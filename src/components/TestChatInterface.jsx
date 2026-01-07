import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { getCurrentUser, getUserAPIKey } from '../utils/userStorage';
import { LoadingSpinner } from './FallbackUI';

const SessionStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR'
};

export default function TestChatInterface({ agentConfig, onConfigChange }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(SessionStatus.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'

  const inputAudioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const sessionPromiseRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef(new Set());
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio level visualization
  useEffect(() => {
    if (!analyserRef.current || status !== SessionStatus.CONNECTED) {
      setAudioLevel(0);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      setAudioLevel(average / 255);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status]);

  const startVoiceSession = async () => {
    try {
      setStatus(SessionStatus.CONNECTING);
      setError(null);

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

      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      micStreamRef.current = stream;

      const analyser = outputAudioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      let enhancedPrompt = agentConfig.systemPrompt || '';
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
              prebuiltVoiceConfig: { voiceName: agentConfig.voice || 'Kore' }
            },
            speakingRate: agentConfig.speakingSpeed || 1.0,
            pitch: agentConfig.pitch || 0,
          },
          systemInstruction: enhancedPrompt,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.CONNECTED);
            setIsProcessing(false);

            if (inputAudioContextRef.current && micStreamRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(micStreamRef.current);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const volume = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);
                setIsListening(volume > 0.01);

                const pcmBlob = createPCMBlob(inputData);
                sessionPromiseRef.current?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
            }
          },
          onmessage: async (message) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setMessages(prev => [...prev, { 
                text, 
                sender: 'user', 
                timestamp: Date.now(),
                type: 'voice'
              }]);
              setIsProcessing(true);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setMessages(prev => [...prev, { 
                text, 
                sender: 'agent', 
                timestamp: Date.now()
              }]);
              setIsProcessing(false);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              setIsListening(false);
              setIsProcessing(false);

              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);

              const gainNode = ctx.createGain();
              gainNode.gain.value = 1.0;

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(gainNode);
              gainNode.connect(analyserRef.current);
              gainNode.connect(ctx.destination);

              source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
              };
              activeSourcesRef.current.add(source);

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }

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
            stopVoiceSession();
          },
          onclose: () => {
            setStatus(SessionStatus.IDLE);
            stopVoiceSession();
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

  const stopVoiceSession = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    activeSourcesRef.current.forEach(source => source.stop());
    activeSourcesRef.current.clear();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setStatus(SessionStatus.IDLE);
    setIsSpeaking(false);
    setIsListening(false);
    setIsProcessing(false);
    analyserRef.current = null;
    sessionPromiseRef.current = null;
  };

  const sendTextMessage = async () => {
    if (!textInput.trim() || status !== SessionStatus.CONNECTED) return;

    const userMessage = textInput.trim();
    setTextInput('');
    setMessages(prev => [...prev, { 
      text: userMessage, 
      sender: 'user', 
      timestamp: Date.now(),
      type: 'text'
    }]);
    setIsProcessing(true);

    // Send text message to the session
    // Note: This would need to be implemented based on Gemini API text input support
    // For now, we'll show a placeholder
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: 'Text input mode is available. Voice mode provides the best experience.', 
        sender: 'agent', 
        timestamp: Date.now()
      }]);
      setIsProcessing(false);
    }, 1000);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-dark rounded-xl border border-white/5 min-h-[400px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-3xl">mic</span>
            </div>
            <p className="text-secondary-grey mb-2">No messages yet</p>
            <p className="text-xs text-secondary-grey">
              {status === SessionStatus.CONNECTED 
                ? 'Start speaking or type a message below'
                : 'Click the microphone button to start a voice session'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-surface-card text-white border border-white/5'
              }`}>
                <div className="flex items-start gap-2">
                  {msg.sender === 'agent' && (
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">AI</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    {msg.type === 'voice' && msg.sender === 'user' && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs opacity-60">mic</span>
                        <span className="text-xs opacity-60">Voice</span>
                      </div>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">You</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-surface-card border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-secondary-grey">Agent is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls */}
      <div className="p-4 border-t border-white/5 bg-surface-card">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'voice'
                ? 'bg-primary text-white'
                : 'bg-surface-dark text-secondary-grey hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">mic</span>
            Voice
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'text'
                ? 'bg-primary text-white'
                : 'bg-surface-dark text-secondary-grey hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">keyboard</span>
            Text
          </button>
        </div>

        {/* Voice Mode Controls */}
        {inputMode === 'voice' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {status === SessionStatus.IDLE || status === SessionStatus.ERROR ? (
                <button
                  onClick={startVoiceSession}
                  disabled={status === SessionStatus.CONNECTING}
                  className="relative group size-20 rounded-full bg-primary hover:bg-primary-glow text-white flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-4xl">mic</span>
                  {status === SessionStatus.CONNECTING && (
                    <div className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopVoiceSession}
                  className={`relative group size-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 ${
                    isListening
                      ? 'bg-primary animate-pulse shadow-[0_0_30px_rgba(91,140,90,0.6)]'
                      : isSpeaking
                      ? 'bg-accent'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <span className="material-symbols-outlined text-4xl text-white">mic</span>
                      <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping"></div>
                    </>
                  ) : isSpeaking ? (
                    <span className="material-symbols-outlined text-4xl text-white">volume_up</span>
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-white">stop</span>
                  )}
                </button>
              )}

              {/* Audio Level Indicator */}
              {status === SessionStatus.CONNECTED && (
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-surface-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-100 rounded-full"
                      style={{ width: `${audioLevel * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-secondary-grey">
                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                  </span>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            {status === SessionStatus.CONNECTED && (
              <div className="flex items-center justify-center gap-4 text-xs">
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-primary font-medium">Listening</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/30 rounded-full">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-accent font-medium">Agent Speaking</span>
                  </div>
                )}
                {isProcessing && !isSpeaking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
                    <span className="text-white font-medium">Processing</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text Mode Controls */}
        {inputMode === 'text' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message..."
              disabled={status !== SessionStatus.CONNECTED}
              className="flex-1 px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all disabled:opacity-50"
            />
            <button
              onClick={sendTextMessage}
              disabled={!textInput.trim() || status !== SessionStatus.CONNECTED}
              className="px-6 py-3 bg-primary hover:bg-primary-glow text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Send
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-xl">
            <p className="text-sm text-accent">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-accent hover:text-accent/80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <button
            onClick={clearConversation}
            disabled={messages.length === 0}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-secondary-grey hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Clear Chat
          </button>
          
          {status === SessionStatus.CONNECTED && (
            <div className="flex items-center gap-2 text-xs text-secondary-grey">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



