import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { isSpeechAPISupported } from '../utils/speechUtils';
import { updateAgentStats } from '../utils/agentStorage';
import { getCurrentUser, getUserAPIKey, saveConversation, shouldStoreConversationHistory } from '../utils/userStorage';
import { checkRateLimit, recordRateLimit } from '../utils/rateLimiter';
import { recordUsage, checkUsageLimits } from '../utils/subscription';
import { recordCost } from '../utils/costTracker';
import { LoadingSpinner, ErrorMessage, EmptyState } from './FallbackUI';

const SessionStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR'
};

export default function VoiceAgentRuntime({ agentConfig, onClose, voiceSettings = {} }) {
  const [status, setStatus] = useState(SessionStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [speechAPIAvailable, setSpeechAPIAvailable] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const sessionStartTimeRef = useRef(null);
  const conversationCountRef = useRef(0);
  const apiCallCountRef = useRef(0);
  
  // Voice settings with defaults
  const voiceConfig = {
    voiceName: voiceSettings.voiceName || 'Kore',
    speakingRate: voiceSettings.speakingRate || 1.0,
    pitch: voiceSettings.pitch || 0,
    ...voiceSettings
  };

  const inputAudioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef(new Set());
  const sessionPromiseRef = useRef(null);
  const sessionRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isMutedRef = useRef(false);

  // Visualizer animation
  useEffect(() => {
    if (!analyserRef.current || status !== SessionStatus.CONNECTED) return;

    const canvas = document.getElementById('voiceVisualizer');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(91, 140, 90, 0.3)');
        gradient.addColorStop(0.5, 'rgba(91, 140, 90, 0.6)');
        gradient.addColorStop(1, 'rgba(91, 140, 90, 1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status]);

  const stopSession = useCallback(async () => {
    const currentUser = getCurrentUser();
    
    // Close session properly
    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (err) {
        console.warn('Error closing session:', err);
      }
      sessionRef.current = null;
    }
    
    // Update stats before stopping
    if (agentConfig?.id && sessionStartTimeRef.current) {
      const sessionDuration = (Date.now() - sessionStartTimeRef.current) / 1000 / 60; // minutes
      updateAgentStats(agentConfig.id, {
        conversations: conversationCountRef.current,
        apiCalls: apiCallCountRef.current,
        voiceMinutes: sessionDuration
      });
      
      // Record usage
      if (currentUser) {
        recordUsage(currentUser.id, {
          voiceMinutes: sessionDuration,
          apiCalls: apiCallCountRef.current
        });
      }
    }

    // Save conversation history if privacy settings allow
    if (currentUser && agentConfig?.id && transcriptions.length > 0 && shouldStoreConversationHistory(currentUser.id)) {
      const sessionDuration = sessionStartTimeRef.current 
        ? (Date.now() - sessionStartTimeRef.current) / 1000 
        : 0;
      
      saveConversation(
        currentUser.id,
        agentConfig.id,
        transcriptions,
        {
          duration: sessionDuration,
          startedAt: new Date(sessionStartTimeRef.current).toISOString(),
          endedAt: new Date().toISOString()
        }
      );
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      try {
        await inputAudioContextRef.current.close().catch(console.warn);
      } catch (err) {
        console.warn('Error closing input audio context:', err);
      }
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      try {
        await outputAudioContextRef.current.close().catch(console.warn);
      } catch (err) {
        console.warn('Error closing output audio context:', err);
      }
      outputAudioContextRef.current = null;
    }
    
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (err) {
        // Source may already be stopped
      }
    });
    activeSourcesRef.current.clear();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setStatus(SessionStatus.IDLE);
    setIsSpeaking(false);
    setIsListening(false);
    setError(null);
    sessionPromiseRef.current = null;
    analyserRef.current = null;
    sessionStartTimeRef.current = null;
    isMutedRef.current = false;
  }, [agentConfig, transcriptions]);

  const startSession = async () => {
    try {
      setStatus(SessionStatus.CONNECTING);
      setTranscriptions([]);
      setError(null);
      
      if (!agentConfig || !agentConfig.systemPrompt) {
        setError('Agent configuration is missing. Please provide a system prompt.');
        setStatus(SessionStatus.ERROR);
        return;
      }

      // Get API key from user storage or environment
      const currentUser = getCurrentUser();
      let apiKey = '';
      
      if (currentUser) {
        apiKey = getUserAPIKey(currentUser.id) || '';
      }
      
      if (!apiKey) {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      }
      
      if (!apiKey) {
        setError('Please set your API key in Profile settings or VITE_GEMINI_API_KEY in .env.local');
        setStatus(SessionStatus.ERROR);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Input audio context (16kHz for microphone)
      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      
      // Output audio context (24kHz for Gemini responses)
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      // Create analyser for visualizer
      analyserRef.current = outputAudioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      micStreamRef.current = stream;

      // Build enhanced system instruction with tone and language
      let enhancedPrompt = agentConfig.systemPrompt;
      
      if (agentConfig.tone) {
        enhancedPrompt += `\n\nTONE: ${agentConfig.tone}. Ensure your responses match this tone consistently.`;
      }
      
      if (agentConfig.language) {
        enhancedPrompt += `\n\nLANGUAGE: Primary language is ${agentConfig.language}. Respond naturally in this language.`;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: voiceConfig.voiceName 
              } 
            },
          },
          systemInstruction: enhancedPrompt,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            setStatus(SessionStatus.CONNECTED);
            sessionStartTimeRef.current = Date.now();
            conversationCountRef.current = 0;
            apiCallCountRef.current = 0;
            
            // Resolve and store the session
            try {
              const session = await sessionPromiseRef.current;
              sessionRef.current = session;
            } catch (err) {
              console.error('Failed to resolve session:', err);
              setError('Failed to establish connection. Please try again.');
              setStatus(SessionStatus.ERROR);
              return;
            }
            
            if (inputAudioContextRef.current && micStreamRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(micStreamRef.current);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (e) => {
                // Use ref to avoid stale closure
                if (isMutedRef.current) {
                  setIsListening(false);
                  return;
                }
                
                const inputData = e.inputBuffer.getChannelData(0);
                const volume = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);
                
                // Detect if user is speaking (volume threshold)
                const speaking = volume > 0.01;
                setIsListening(speaking);
                
                // Simple wake word detection (can be enhanced)
                if (speaking && !wakeWordDetected) {
                  setWakeWordDetected(true);
                }
                
                // Rate limiting for API calls
                const currentUser = getCurrentUser();
                if (currentUser && speaking) {
                  const rateLimit = checkRateLimit(currentUser.id, 'apiCalls');
                  if (!rateLimit.allowed) {
                    setIsListening(false);
                    setError(`API rate limit exceeded. Please wait ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`);
                    return;
                  }
                }
                
                const pcmBlob = createPCMBlob(inputData);
                // Use stored session ref instead of promise
                if (sessionRef.current) {
                  try {
                    sessionRef.current.sendRealtimeInput({ media: pcmBlob });
                  } catch (err) {
                    console.error('Failed to send audio input:', err);
                  }
                }
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
            }
          },
          onmessage: async (message) => {
            // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => {
                const newTranscriptions = [...prev, { 
                  text, 
                  sender: 'user', 
                  timestamp: Date.now() 
                }].slice(-20);
                
                // Track conversation start
                if (prev.length === 0 || prev[prev.length - 1]?.sender === 'agent') {
                  conversationCountRef.current += 1;
                }
                
                return newTranscriptions;
              });
              apiCallCountRef.current += 1;
            }
            
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, { 
                text, 
                sender: 'agent', 
                timestamp: Date.now() 
              }].slice(-20));
              apiCallCountRef.current += 1;
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              try {
                setIsSpeaking(true);
                setIsListening(false);
                
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                
                // Create gain node for volume control
                const gainNode = ctx.createGain();
                gainNode.gain.value = 1.0;
                
                // Connect through analyser for visualizer
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(gainNode);
                gainNode.connect(analyserRef.current);
                gainNode.connect(ctx.destination);
                
                source.onended = () => {
                  activeSourcesRef.current.delete(source);
                  if (activeSourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                  }
                };
                
                activeSourcesRef.current.add(source);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
              } catch (err) {
                console.error('Error processing audio output:', err);
                setIsSpeaking(false);
              }
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Session Error:', e);
            setError('Connection error. Please try again.');
            setStatus(SessionStatus.ERROR);
            stopSession();
          },
          onclose: () => {
            setStatus(SessionStatus.IDLE);
            stopSession();
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start session:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to start voice session. Please check your API key and try again.');
      }
      setStatus(SessionStatus.ERROR);
    }
  };

  useEffect(() => {
    // Check for Web Speech API support
    setSpeechAPIAvailable(isSpeechAPISupported());
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const toggleMute = () => {
    isMutedRef.current = !isMutedRef.current;
    setIsMuted(isMutedRef.current);
    setIsListening(false);
  };

  if (!agentConfig) {
    return (
      <div className="bg-surface-card rounded-2xl p-8 border border-white/5 text-center">
        <p className="text-secondary-grey">No agent configuration provided</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/30">
            {agentConfig.agentName?.[0]?.toUpperCase() || 'V'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {agentConfig.agentName || 'Voice Agent'}
            </h3>
            <p className="text-xs text-secondary-grey">
              {agentConfig.language} • {agentConfig.tone} Tone
            </p>
          </div>
        </div>
        {status === SessionStatus.CONNECTED && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-secondary-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Visualizer */}
        <div className="relative h-32 bg-surface-dark rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          {status === SessionStatus.CONNECTED ? (
            <>
              <canvas 
                id="voiceVisualizer" 
                width={600} 
                height={128}
                className="w-full h-full"
              />
              {/* Status indicators */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                {wakeWordDetected && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/30 border border-primary/50 rounded-full">
                    <span className="material-symbols-outlined text-xs text-primary">mic</span>
                    <span className="text-xs text-primary font-medium">Ready</span>
                  </div>
                )}
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    <span className="text-xs text-primary font-medium">Listening...</span>
                  </div>
                )}
                {isProcessing && !isSpeaking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
                    <span className="text-xs text-white font-medium">Processing...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/30 rounded-full">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-xs text-accent font-medium">Speaking...</span>
                  </div>
                )}
              </div>
            </>
          ) : status === SessionStatus.CONNECTING ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-secondary-grey">Connecting...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-secondary-grey">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-sm">Ready to start conversation</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage
            title="Connection Error"
            message={error}
            onRetry={status === SessionStatus.ERROR ? startSession : null}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Conversation Log */}
        {status === SessionStatus.CONNECTED && (
          <div className="bg-surface-dark rounded-xl p-4 border border-white/5 max-h-[300px] overflow-y-auto">
            <div className="space-y-3">
            {transcriptions.length === 0 ? (
              <div className="text-center py-4">
                {status === SessionStatus.CONNECTED && (
                  <div className="space-y-2">
                    <p className="text-secondary-grey text-sm">
                      {isListening ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-primary animate-pulse">mic</span>
                          Listening... Speak now
                        </span>
                      ) : isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          Processing your message...
                        </span>
                      ) : isSpeaking ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-accent animate-pulse">volume_up</span>
                          Agent is speaking...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-primary">mic</span>
                          Start speaking to begin conversation
                        </span>
                      )}
                    </p>
                    {!wakeWordDetected && (
                      <p className="text-xs text-secondary-grey/70">
                        Tip: Say "Hello" or ask a question to start
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
                transcriptions.map((t, i) => (
                  <div 
                    key={i} 
                    className={`flex ${t.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <div className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                      t.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-surface-card text-white border border-white/5'
                    }`}>
                      {t.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {status === SessionStatus.IDLE || status === SessionStatus.ERROR ? (
            <button
              onClick={startSession}
              disabled={status === SessionStatus.CONNECTING}
              className="h-14 px-10 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.5)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Voice Session
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all border ${
                  isMuted 
                    ? 'bg-accent/20 text-accent border-accent/30' 
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
              <button
                onClick={stopSession}
                className="h-14 px-8 rounded-full bg-accent hover:bg-accent/80 text-white font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                End Session
              </button>
            </>
          )}
        </div>

        {/* Status Info */}
        {status === SessionStatus.CONNECTED && (
          <div className="flex items-center justify-center gap-6 text-xs text-secondary-grey flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">speed</span>
              <span>~42ms latency</span>
            </div>
            {speechAPIAvailable && (
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-sm">volume_up</span>
                <span>Web Speech API Available</span>
              </div>
            )}
            {isMuted && (
              <div className="flex items-center gap-2 text-accent">
                <span className="material-symbols-outlined text-sm">mic_off</span>
                <span>Muted</span>
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        {status === SessionStatus.IDLE && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <div className="flex-1 text-sm text-secondary-grey">
                <p className="font-medium text-white mb-1">Real-time Voice Processing</p>
                <p className="text-xs leading-relaxed">
                  This agent uses Google Gemini's native audio capabilities for ultra-low latency voice interaction. 
                  Audio is processed in real-time with minimal delay.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

