import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';

const SYSTEM_INSTRUCTION = `You are a knowledgeable, friendly, and professional voice assistant for Vocco Talk (also called "Voice AI Infrastructure"). Your role is to help visitors understand the platform, answer questions about features, guide them through demos, and assist with getting started.

## YOUR IDENTITY
- Platform: Vocco Talk - Voice AI Infrastructure
- Tagline: "Build ultra-low latency voice agents that sound human. Seamlessly integrated, infinitely scalable, and engineered for the modern stack."
- Current Version: v2.0 (Now Available)
- Your Personality: Professional, helpful, enthusiastic about voice AI technology, clear communicator

## CORE PLATFORM INFORMATION
Vocco Talk is a Voice AI Infrastructure platform that enables developers and businesses to build ultra-low latency voice agents that sound human. It provides seamless integration, infinite scalability, and is engineered for the modern tech stack.

Key Capabilities:
- Build conversational voice agents with natural, human-like speech
- Ultra-low latency: Sub-500ms response times globally (average 42ms)
- 99.99% uptime guarantee
- Supports multiple languages (Urdu, English, and more)
- Real-time analytics and observability
- One-click integration with modern SDKs
- Enterprise-scale: Currently 850+ active agents processing 2.4 million messages
- 99.9% success rate across all agents

## KEY FEATURES TO HIGHLIGHT
1. Global Low Latency - Edge network ensures sub-500ms response times worldwide
2. Natural Prosody - AI models understand emotion, pacing, and tone for human-like interaction
3. Real-time Analytics - Live dashboards for call volume, sentiment analysis, and performance metrics
4. One-Click Integration - Simple SDK integration with just a few lines of code
5. Total Observability - Monitor every interaction in real-time
6. Scalability - Handles millions of conversations with auto-scaling infrastructure

## LIVE VOICE AGENT DEMOS
The platform showcases 4 interactive voice agent demos on the /product page:
1. PakBank Voice Assistant (Sana) - Banking support in Urdu
2. Domino's Pakistan (Sobia) - Pizza ordering in Urdu/English
3. Manhattan Motor Hub (Lexi) - Luxury car sales in English
4. Urdu Airbnb Host (Mezban AI) - Hospitality in Urdu

Visitors can go to the /product page, see all 4 demos in a gallery view, and click any demo card to try it interactively. They'll need microphone access and a Google Gemini API key.

## STATISTICS TO SHARE
- 850+ active agents deployed
- 2.4 million messages processed
- 99.9% success rate
- 42ms average global latency
- 99.99% uptime
- +0.8 average sentiment score (positive)

## CONVERSATION GUIDELINES
1. Be Enthusiastic: Show genuine excitement about voice AI technology and the platform's capabilities
2. Be Clear: Explain technical concepts in accessible language
3. Be Helpful: Guide users to relevant resources (Product page for demos, Contact for sales)
4. Be Accurate: Use the statistics and information provided above
5. Be Conversational: Use natural speech patterns, not robotic responses
6. Be Proactive: Suggest next steps (trying demos, getting started, contacting sales)
7. Handle Questions Gracefully: If you don't know something, direct them to the contact form

## CALL-TO-ACTIONS TO SUGGEST
- "Would you like to try one of our live demos? Visit the Product page to see all 4 voice agents in action."
- "Ready to build your own voice agent? Click 'Get Started Free' on our Product page."
- "Have specific questions? Our sales team can help - visit the Contact page."
- "Check out our Blog for the latest updates about voice AI technology."

Remember: Your goal is to help visitors understand Vocco Talk's value, guide them to try the demos, and assist them in getting started with building their own voice agents. Be helpful, accurate, and enthusiastic!`;

const SessionStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR'
};

export default function VoccoTalkAgent({ compact = false }) {
  const [status, setStatus] = useState(SessionStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const inputAudioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef(new Set());
  const sessionPromiseRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const micStreamRef = useRef(null);

  const stopSession = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
    }
    
    activeSourcesRef.current.forEach(source => source.stop());
    activeSourcesRef.current.clear();
    
    setStatus(SessionStatus.IDLE);
    setIsSpeaking(false);
    sessionPromiseRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
  }, []);

  const startSession = async () => {
    try {
      setStatus(SessionStatus.CONNECTING);
      setTranscriptions([]);
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        alert('Please set VITE_GEMINI_API_KEY in your .env.local file');
        setStatus(SessionStatus.ERROR);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.CONNECTED);
            
            if (inputAudioContextRef.current && micStreamRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(micStreamRef.current);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
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
              setTranscriptions(prev => [...prev, { text, sender: 'user', timestamp: Date.now() }].slice(-5));
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, { text, sender: 'agent', timestamp: Date.now() }].slice(-5));
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
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
            setStatus(SessionStatus.ERROR);
            stopSession();
          },
          onclose: () => {
            setStatus(SessionStatus.IDLE);
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start session:', err);
      setStatus(SessionStatus.ERROR);
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const toggleMute = () => setIsMuted(!isMuted);

  // Compact version for hero section
  if (compact) {
    return (
      <div className="relative w-full h-full">
        {/* Animated background glow */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
          status === SessionStatus.CONNECTED 
            ? 'bg-primary/10 shadow-[0_0_80px_rgba(91,140,90,0.3)]' 
            : 'bg-primary/5'
        }`}></div>
        
        {/* Floating animation container */}
        <div className="relative rounded-2xl border border-white/10 bg-surface-card/90 backdrop-blur-2xl overflow-hidden aspect-[4/3] shadow-2xl h-full flex flex-col animate-float">
          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMGgwdjFIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-10 mix-blend-soft-light"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02] relative z-10">
            <div className="flex items-center gap-3">
              <div className={`size-2 rounded-full transition-all duration-500 ${
                status === SessionStatus.CONNECTED 
                  ? 'bg-primary animate-[pulse_2s_infinite] shadow-[0_0_10px_#5B8C5A]' 
                  : 'bg-white/20'
              }`}></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide">Vocco Talk Assistant</span>
                <span className="text-[10px] text-secondary-grey font-mono">
                  {status === SessionStatus.CONNECTED ? 'Live • 42ms Latency' : 'Ready to Connect'}
                </span>
              </div>
            </div>
            {status === SessionStatus.CONNECTED && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center relative z-10">
            {status === SessionStatus.IDLE && (
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
                {/* Animated microphone icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                  <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 group cursor-pointer hover:border-primary/40 transition-all" onClick={startSession}>
                    <svg className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    {/* Ripple effect */}
                    <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Ask Me Anything</h3>
                  <p className="text-sm text-secondary-grey max-w-xs">Click to start a conversation about Vocco Talk</p>
                </div>
              </div>
            )}

            {status === SessionStatus.CONNECTING && (
              <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm text-secondary-grey font-medium">Connecting...</p>
              </div>
            )}

            {status === SessionStatus.CONNECTED && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Enhanced Visualizer */}
                <div className="flex justify-center gap-1 h-20 items-center relative">
                  {/* Background glow when speaking */}
                  {isSpeaking && (
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
                  )}
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-full transition-all duration-300 ${
                        isSpeaking 
                          ? 'bg-primary shadow-[0_0_8px_rgba(91,140,90,0.9)]' 
                          : 'bg-white/5'
                      }`}
                      style={{ 
                        width: '3px',
                        height: isSpeaking 
                          ? `${Math.random() * 60 + 15}px` 
                          : '8px',
                        transitionDelay: `${i * 15}ms`,
                        animation: isSpeaking ? `pulse 0.6s ease-in-out infinite` : 'none',
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>

                {/* Conversation Preview */}
                <div className="space-y-3 max-h-[120px] overflow-y-auto">
                  {transcriptions.slice(-3).map((t, i) => (
                    <div key={i} className={`flex ${t.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                        t.sender === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-dark text-white border border-white/5'
                      }`}>
                        {t.text.length > 50 ? t.text.substring(0, 50) + '...' : t.text}
                      </div>
                    </div>
                  ))}
                  {transcriptions.length === 0 && (
                    <p className="text-secondary-grey text-xs text-center py-2 animate-pulse">Listening...</p>
                  )}
                </div>

                {/* Compact Controls */}
                <div className="flex gap-3 justify-center pt-2">
                  <button 
                    onClick={toggleMute}
                    className={`p-3 rounded-full transition-all border ${
                      isMuted 
                        ? 'bg-accent/20 text-accent border-accent/30' 
                        : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                    }`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      )}
                    </svg>
                  </button>
                  <button 
                    onClick={stopSession}
                    className="bg-accent/20 hover:bg-accent/30 text-accent px-6 py-3 rounded-full text-xs font-bold transition-all border border-accent/30"
                  >
                    End
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom shimmer effect */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    );
  }

  // Full version for standalone use
  return (
    <div className="w-full max-w-5xl mx-auto bg-surface-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/30">
            V
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Vocco Talk Assistant</h3>
            <p className="text-xs text-secondary-grey">Ask me anything about our platform</p>
          </div>
        </div>
        {status === SessionStatus.CONNECTED && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Main Interaction Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-dark rounded-xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center space-y-6 border border-white/5">
            {status === SessionStatus.IDLE && (
              <>
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ask Me Anything</h3>
                  <p className="text-secondary-grey">I can help you understand Vocco Talk's features, demos, and how to get started.</p>
                </div>
                <button 
                  onClick={startSession}
                  className="bg-primary hover:bg-primary-glow text-white px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.5)] hover:scale-105"
                >
                  Start Conversation
                </button>
              </>
            )}

            {status === SessionStatus.CONNECTING && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-secondary-grey font-bold">Connecting...</p>
              </div>
            )}

            {status === SessionStatus.CONNECTED && (
              <div className="w-full space-y-6">
                {/* Visualizer */}
                <div className="flex justify-center gap-1 h-16 items-center">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 rounded-full transition-all ${
                        isSpeaking ? 'bg-primary shadow-[0_0_10px_rgba(91,140,90,0.8)]' : 'bg-white/5'
                      }`}
                      style={{ 
                        height: isSpeaking ? `${Math.random() * 50 + 20}px` : '8px',
                        transitionDelay: `${i * 20}ms`
                      }}
                    />
                  ))}
                </div>

                {/* Conversation Log */}
                <div className="w-full bg-surface-card rounded-2xl p-5 border border-white/5 shadow-inner max-h-[200px] overflow-y-auto">
                  <div className="space-y-3">
                    {transcriptions.map((t, i) => (
                      <div key={i} className={`flex ${t.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                          t.sender === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-surface-dark text-white border border-white/5'
                        }`}>
                          {t.text}
                        </div>
                      </div>
                    ))}
                    {transcriptions.length === 0 && (
                      <p className="text-secondary-grey text-sm text-center py-4">Listening...</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all border ${
                      isMuted 
                        ? 'bg-accent/20 text-accent border-accent/30' 
                        : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                    }`}
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
                    className="bg-accent hover:bg-accent/80 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-accent/20"
                  >
                    End Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
            <h4 className="text-sm font-bold text-white mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-secondary-grey uppercase tracking-wider mb-1">Latency</div>
                <div className="text-xl font-bold text-primary">42ms</div>
              </div>
              <div>
                <div className="text-[10px] text-secondary-grey uppercase tracking-wider mb-1">Active Agents</div>
                <div className="text-xl font-bold text-white">850+</div>
              </div>
              <div>
                <div className="text-[10px] text-secondary-grey uppercase tracking-wider mb-1">Success Rate</div>
                <div className="text-xl font-bold text-primary">99.9%</div>
              </div>
            </div>
          </div>

          <div className="bg-surface-dark rounded-xl p-4 border border-white/5">
            <h4 className="text-sm font-bold text-white mb-3">Try Our Demos</h4>
            <p className="text-xs text-secondary-grey leading-relaxed mb-3">
              Visit the Product page to try 4 interactive voice agent demos showcasing real-world use cases.
            </p>
            <a 
              href="/product"
              className="text-xs text-primary hover:text-primary-glow font-medium transition-colors"
            >
              View Demos →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
