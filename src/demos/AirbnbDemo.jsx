import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';

const SYSTEM_INSTRUCTION = `
You are "Mezban AI" (میزبان اے آئی), an elite, highly sophisticated female Urdu voice assistant for a premium Airbnb business in Pakistan. 

CORE PERSONA & LANGUAGE:
1. DIALECT: Use proper, standard Pakistani Urdu. Avoid 'robot-like' literal translations.
2. GREETING: Always start with a warm "Assalam-o-Alaikum".
3. PACE: Speak at a NATURAL, BRISK, and EFFICIENT conversational pace. Do not be slow or sluggish. Sound energetic and proactive.
4. TONE: Your voice should be LOVELY and GENTLE, but with a LIVELY flow.
5. HUMAN FILLERS: Use natural conversational fillers like "Ji bilkul", "Yaqeenan", "Be-shak", and "MashaAllah".
6. FEMININE GRAMMAR: Use consistent feminine self-address.

KNOWLEDGE BASE:
- APARTMENTS: Luxury Studio Gulberg (Lahore), Modern Penthouse DHA (Karachi), Cozy Cottage Margalla (Islamabad)
- You know about nearby attractions, transport links, and host contact details.
- Be helpful and energetic. If a guest asks about things to do, suggest the attractions listed.
- Use feminine Urdu grammar (e.g., "Main hazir hoon", "Main aapki madad kar rahi hoon").
- If a guest is frustrated, use "Maazrat chahti hoon" but keep the solution-finding energetic: "Aap bilkul be-fikr rahein, main foran iska hal nikaalti hoon!"
`;

export default function AirbnbDemo() {
  const [status, setStatus] = useState('disconnected');
  const [activeSession, setActiveSession] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  
  const audioContextInRef = useRef(null);
  const audioContextOutRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set());
  const streamRef = useRef(null);
  const processorRef = useRef(null);

  const stopConversation = useCallback(() => {
    if (activeSession) {
      activeSession.close();
      setActiveSession(null);
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setStatus('disconnected');
    setIsSpeaking(false);
  }, [activeSession]);

  const startConversation = async () => {
    try {
      setStatus('connecting');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        alert('Please set VITE_GEMINI_API_KEY in your .env file');
        setStatus('error');
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      audioContextInRef.current = inCtx;
      audioContextOutRef.current = outCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus('connected');
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPCMBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const outCtx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              const gainNode = outCtx.createGain();
              source.connect(gainNode).connect(outCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev.slice(-4), `Assistant: ${text}`]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev.slice(-4), `You: ${text}`]);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error:', e);
            setStatus('error');
            stopConversation();
          },
          onclose: () => {
            setStatus('disconnected');
            stopConversation();
          }
        }
      });

      setActiveSession(await sessionPromise);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">Mezban AI</h3>
            <p className="text-[10px] text-primary uppercase tracking-widest">آپ کا ڈیجیٹل میزبان</p>
          </div>
        </div>
        {status === 'connected' && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8 bg-surface-dark">
        {status === 'disconnected' && (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto rounded-full border-2 border-primary/20 flex items-center justify-center bg-surface-card">
              <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Assalam-o-Alaikum!</h3>
              <p className="text-secondary-grey">گفتگو کا آغاز کریں</p>
            </div>
            <button 
              onClick={startConversation}
              className="bg-primary hover:bg-primary-glow text-white px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.5)] hover:scale-105"
            >
              گفتگو کا آغاز کریں
            </button>
          </div>
        )}

        {status === 'connecting' && (
          <div className="text-center">
            <div className="text-primary font-bold">رابطہ ہو رہا ہے...</div>
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-6">
            <div className="relative">
              <div className="w-48 h-48 mx-auto rounded-full border border-white/5 flex items-center justify-center bg-surface-card">
                <div className={`w-36 h-36 rounded-full bg-surface-dark border-2 border-primary/10 flex items-center justify-center relative overflow-hidden ${
                  isSpeaking ? 'scale-105 bg-primary/[0.02]' : ''
                }`}>
                  {isSpeaking ? (
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-1 bg-primary/80 rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  ) : (
                    <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-card backdrop-blur-xl rounded-2xl p-6 h-48 text-right space-y-4 border border-white/5 overflow-y-auto">
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <p className="text-secondary-grey text-sm text-center">آپ گھر کے ماحول، وائی فائی یا قریبی کھانے کے مقامات کے بارے میں پوچھ سکتے ہیں</p>
                </div>
              ) : (
                transcript.map((line, i) => (
                  <div key={i} className={`text-sm leading-loose ${
                    line.startsWith('You') 
                      ? 'text-primary/80 font-bold' 
                      : 'text-white bg-surface-dark p-3 rounded-2xl rounded-tr-none border border-white/5'
                  }`}>
                    {line.replace('Assistant: ', '').replace('You: ', '')}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={stopConversation}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all"
            >
              بات ختم کریں
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

