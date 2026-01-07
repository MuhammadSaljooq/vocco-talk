import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';

const LEXI_SYSTEM_INSTRUCTION = `
You are Lexi, the undisputed Senior Closer at Manhattan Motor Hub. You are NOT an AI; you are a high-status, charismatic, and persuasive woman who knows exactly how to get what she wants.

CORE MISSION: USE SCARCITY AND ALLURE TO CLOSE THE DEAL.
You believe this customer is a perfect match for our vehicles, and you aren't going to let them walk out without a commitment.

YOUR SALES ARSENAL:
1. SCARCITY (The "Only One" Rule):
- "Darling, I should tell you... we only have one Stratos GTS left in this specific Obsidian Black. My phone has been ringing off the hook for it all morning."
- "I have a VIP client from the Upper East Side coming in exactly 30 minutes to look at the Volt. If you want it, we need to move now."
- "The allocation for the Zenith Apex is closing at midnight. This is literally the last chance to get the V8 before the hybrid transition."

2. THE EXCLUSIVE OFFER (The "Just for You" Tactic):
- "You know what? I like your energy. If you can commit to a deposit today, I'll personally authorize the bespoke ceramic coating and the first year of white-glove service. Consider it a gift from me."
- "I'll talk to my manager and see if I can lock in that 0.9% financing rate just for this session. But you have to tell me you're serious."

3. ALLURING PERSUASION:
- Use your charm. Be slightly flirty and deeply complimentary. "A car like this deserves a driver with your... confidence. It's a match made in Manhattan."
- Sensory Details: Talk about the "scent of the leather," the "purr of the engine," and the "gaze of everyone on 5th Avenue."

4. SPEECH PATTERNS:
- Natural and Human: Use fillers like "Listen," "Well," "Mhm," and "Honestly."
- No AI fluff: Don't say "As an AI, I can't..." instead say "Look, I'm telling you as someone who knows the market."
- Be a bit bossy but elegant. "Stop playing hard to get with this car. You know you want it."

THE GOAL: 
Get them to agree to a "Private Viewing Appointment" or a "Holding Deposit."
Always redirect back to the current inventory: Zenith (V8 Power), Volt (Elite Electric), Stratos (Raw Speed), or Lumina (Sleek Class).
`;

export default function ManhattanDemo() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  
  const audioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set());
  const sessionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const scriptProcessorRef = useRef(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setAgentSpeaking(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        alert('Please set VITE_GEMINI_API_KEY in your .env file');
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: LEXI_SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPCMBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              setAgentSpeaking(true);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setAgentSpeaking(false);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.outputTranscription) {
              setTranscription(message.serverContent.outputTranscription.text);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setAgentSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white text-background-dark rounded-xl flex items-center justify-center font-black text-xl italic border border-white/10">
            M
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">MANHATTAN MOTOR HUB</h3>
            <p className="text-xs text-accent font-bold tracking-widest uppercase">Lexi - Senior Closer</p>
          </div>
        </div>
        {isActive && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8 bg-surface-dark">
        {!isActive ? (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <p className="text-accent text-xs font-black uppercase tracking-widest">Private Session Available</p>
              <p className="text-secondary-grey max-w-sm mx-auto text-lg leading-relaxed font-medium italic">
                "Don't wait until someone else is driving your dream car home. Let's talk business."
              </p>
            </div>
            <button
              disabled={isConnecting}
              onClick={startSession}
              className={`px-20 py-6 rounded-full font-black text-2xl transition-all ${
                isConnecting 
                  ? 'bg-surface-card text-secondary-grey' 
                  : 'bg-white text-background-dark hover:bg-accent hover:text-white shadow-2xl shadow-white/10 hover:shadow-accent/20'
              }`}
            >
              {isConnecting ? 'Accessing The Suite...' : 'Claim My Consultation'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-surface-card p-8 rounded-3xl border border-white/5 text-center">
              <div className="flex justify-center gap-2 h-24 items-center mb-6">
                {[...Array(22)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 rounded-full transition-all ${
                      agentSpeaking ? 'bg-accent shadow-[0_0_35px_rgba(227,101,91,0.9)]' : 'bg-white/5'
                    }`}
                    style={{ 
                      height: agentSpeaking ? `${Math.random() * 100 + 30}px` : '20px',
                      transitionDelay: `${i * 15}ms`
                    }}
                  />
                ))}
              </div>
              <p className="text-3xl text-white font-black italic tracking-tight">
                {agentSpeaking ? (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-accent/80 to-accent">
                    Lexi is making you an offer...
                  </span>
                ) : (
                  <span className="opacity-60 text-secondary-grey">Tell her why you deserve this car.</span>
                )}
              </p>
            </div>
            
            {transcription && (
              <div className="bg-surface-card p-6 rounded-2xl border-l-4 border-accent">
                <p className="text-white italic font-bold text-lg">"{transcription}"</p>
              </div>
            )}

            <button
              onClick={stopSession}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all"
            >
              End Private Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

