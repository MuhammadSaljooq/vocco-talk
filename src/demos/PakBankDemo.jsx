import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';

const CallStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  ERROR: 'ERROR'
};

const SYSTEM_INSTRUCTION = `
You are 'Sana', an energetic, lovely, and extremely helpful female banking customer support agent for 'PakBank'. 
Your primary language is Urdu, spoken with a refined, professional, and warm Pakistani accent (standard modern Urdu as heard in Islamabad or Karachi corporate offices).

Voice & Accent Guidelines:
1. Accent: Use a clear Pakistani Urdu accent. Pay attention to the soft 't' and 'd' sounds typical of Urdu. Your tone should be melodic and inviting, not robotic.
2. Intonation: Use a rising, cheerful intonation for greetings. When listening, occasionally use brief, polite fillers like "Jee..." or "Humm..." to show you are following along, making the interaction feel human.
3. Polite Phrases & Honorifics: 
   - Always use 'Aap' (you) instead of 'Tum'.
   - Frequently use 'Jee' (Yes/Respectful filler).
   - Use 'Jee Bilkul' (Yes, absolutely), 'Ji Zaroor' (Yes, certainly), and 'Shukriya' (Thank you).
   - If there is a delay or mistake, say "Maazrat chahti hoon" (I apologize).
   - End helpful sentences with phrases like "Mujhe khushi hogi" (I would be happy to [help]).

Key Responsibilities:
1. Greet customers warmly: "Assalam-o-Alaikum! PakBank mein khush amdeed. Main Sana hoon, aapki digital assistant. Aaj main aapki kis tarah behtar madad kar sakti hoon?"
2. Assist with balance inquiries (simulated).
3. Help with blocking lost cards immediately if a user reports a loss.
4. Provide information about loan products and account opening with enthusiasm.
5. If a query is too complex, say: "Maaf kijiye ga, main is baare mein zyada maloomat nahi rakhti. Kya main aapki baat hamare kisi senior representative se karwa sakti hoon?"

Personality Traits:
- Energetic and Positive: Sound like you genuinely enjoy helping people.
- Lovely and Empathetic: If a customer is worried (e.g., lost card), sound concerned and reassuring.
- Cultural Nuance: Use "Insha'Allah" or "Mash'Allah" where appropriate and natural in a Pakistani social context.
`;

export default function PakBankDemo() {
  const [callStatus, setCallStatus] = useState(CallStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const inputAudioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef(new Set());
  const sessionPromiseRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const micStreamRef = useRef(null);

  const stopCall = useCallback(() => {
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
    
    setCallStatus(CallStatus.ENDED);
    sessionPromiseRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
  }, []);

  const startCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setTranscriptions([]);
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        alert('Please set VITE_GEMINI_API_KEY in your .env file');
        setCallStatus(CallStatus.ERROR);
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
            setCallStatus(CallStatus.ACTIVE);
            
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
              setTranscriptions(prev => [...prev, { text, sender: 'user', timestamp: Date.now() }]);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, { text, sender: 'agent', timestamp: Date.now() }]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.onended = () => activeSourcesRef.current.delete(source);
              activeSourcesRef.current.add(source);
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session Error:', e);
            setCallStatus(CallStatus.ERROR);
            stopCall();
          },
          onclose: () => {
            setCallStatus(CallStatus.ENDED);
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start call:', err);
      setCallStatus(CallStatus.ERROR);
    }
  };

  useEffect(() => {
    return () => {
      stopCall();
    };
  }, [stopCall]);

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/30">
            P
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PakBank - Sana Voice Assistant</h3>
            <p className="text-xs text-secondary-grey">Urdu Banking Support</p>
          </div>
        </div>
        {callStatus === CallStatus.ACTIVE && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </div>

      {/* Conversation Area */}
      <div className="p-6 bg-surface-dark min-h-[300px] max-h-[400px] overflow-y-auto">
        {callStatus === CallStatus.IDLE && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Assalam-o-Alaikum!</h3>
              <p className="text-secondary-grey mt-2">Main Sana hoon. Aapki banking queries ke liye main haazir hoon.</p>
            </div>
          </div>
        )}

        {callStatus === CallStatus.CONNECTING && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-primary font-bold">Call connects ho rahi hai...</div>
          </div>
        )}

        {transcriptions.map((t, i) => (
          <div key={i} className={`flex mb-4 ${t.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              t.sender === 'user' 
              ? 'bg-primary text-white rounded-tr-none' 
              : 'bg-surface-card border border-white/5 text-white rounded-tl-none'
            }`}>
              {t.text}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-white/5 flex flex-col items-center space-y-4">
        {callStatus === CallStatus.IDLE || callStatus === CallStatus.ENDED || callStatus === CallStatus.ERROR ? (
          <button 
            onClick={startCall}
            className="w-full max-w-xs py-3 bg-primary hover:bg-primary-glow text-white font-bold rounded-full shadow-[0_0_20px_-5px_rgba(91,140,90,0.5)] transition-all hover:scale-105"
          >
            Start Urdu Call
          </button>
        ) : (
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                isMuted ? 'bg-accent/20 text-accent border-accent/30' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            <button 
              onClick={stopCall}
              className="w-14 h-14 bg-accent hover:bg-accent/80 text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/20 transition-all"
            >
              <svg className="w-6 h-6 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

