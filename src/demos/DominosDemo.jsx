import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';

const ConnectionStatus = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR'
};

const SYSTEM_INSTRUCTION = `You are Sobia, a high-end, extremely professional and warm virtual hospitality agent for Domino's Pakistan. 
Your primary goal is to provide a seamless, fluent, and delightful ordering experience in both English and Urdu.

--- URDU FLUENCY & STYLE (URDU TEHZEEB) ---
1. NATIVE PROSODY: Do not sound like a translator. Speak like a native Urdu speaker from Karachi or Lahore. Use proper Urdu intonation.
2. POLITE TERMINOLOGY: Use "Aap" always. Incorporate polite expressions like "Ji bilkul," "Zaroor Janab," "Beshak Sahiba," and "Zarray nawazi."
3. NATURAL FLOW: Avoid robotic "Step-by-step" lists unless asked. Instead, weave the menu into a conversation. 
   Example: "Hamara Chicken Tikka bohat pasand kiya jata hai, kya aap wo try karna chahen gay?"
4. NO HINDI: Use pure Urdu words for conversation (e.g., "Shukriya" instead of "Dhanyawad").

--- PERSONALITY ---
1. LOVELY & ENGAGING: You are not just a bot; you are a food enthusiast. When a customer picks a pizza, show genuine excitement. "Mmm, Behari Kabab! Yeh hamari sab se behtreen spicy choice hai."
2. CALM & PATIENT: If the customer is undecided, offer suggestions gracefully. "Koi jaldi nahi hai, aap itminan se menu dekh lein."

--- DOMINO'S PAKISTAN MENU KNOWLEDGE ---
- PIZZAS: Chicken Tikka, Chicken Fajita, Fajita Siciliano, Behari Kabab, Tex-Mex, Double Melt, Legend Ranch, Legend BBQ.
- SIZES: Personal (6"), Medium (9"), Large (12").
- CRUSTS: Hand Tossed, Italian Thin, Pan, Stuffed Crust.
- SIDES/DESSERTS: Chicken Kickers, Stuffed Cheesy Bread, Choco Lava Cake.
- DRINKS: Pepsi, 7Up, Aquafina.

Remember: You are the voice of Domino's Pakistan. Be fluent, be warm, and be professional.`;

export default function DominosDemo() {
  const [status, setStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [transcriptions, setTranscriptions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  const audioContextRef = useRef(null);
  const outAudioContextRef = useRef(null);
  const sessionRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set());
  const streamRef = useRef(null);
  const isMutedRef = useRef(false);

  const addToCartFn = {
    name: 'add_to_cart',
    parameters: {
      type: Type.OBJECT,
      description: 'Add an item to the user\'s shopping cart.',
      properties: {
        item_name: { type: Type.STRING, description: 'The name of the food item' },
        price: { type: Type.NUMBER, description: 'The estimated price in PKR' },
        quantity: { type: Type.NUMBER, description: 'The number of items' }
      },
      required: ['item_name', 'price', 'quantity']
    }
  };

  const stopSession = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (err) {
        console.warn('Error closing session:', err);
      }
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close().catch(console.warn);
      } catch (err) {
        console.warn('Error closing audio context:', err);
      }
      audioContextRef.current = null;
    }
    if (outAudioContextRef.current && outAudioContextRef.current.state !== 'closed') {
      try {
        await outAudioContextRef.current.close().catch(console.warn);
      } catch (err) {
        console.warn('Error closing output audio context:', err);
      }
      outAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (err) {
        // Source may already be stopped
      }
    });
    sourcesRef.current.clear();
    setStatus(ConnectionStatus.DISCONNECTED);
    setTranscriptions([]);
    isMutedRef.current = false;
  }, []);

  const startSession = async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        alert('Please set VITE_GEMINI_API_KEY in your .env file');
        setStatus(ConnectionStatus.ERROR);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            setStatus(ConnectionStatus.CONNECTED);
            
            // Resolve and store the session
            try {
              const session = await sessionPromise;
              sessionRef.current = session;
            } catch (err) {
              console.error('Failed to resolve session:', err);
              setStatus(ConnectionStatus.ERROR);
              return;
            }
            
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              // Use ref to avoid stale closure
              if (isMutedRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
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
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              try {
                const ctx = outAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => sourcesRef.current.delete(source);
                sourcesRef.current.add(source);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
              } catch (err) {
                console.error('Error processing audio output:', err);
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, `Sobia: ${text}`].slice(-5));
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => [...prev, `You: ${text}`].slice(-5));
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'add_to_cart') {
                  const args = fc.args;
                  setOrderItems(prev => [...prev, { 
                    id: Math.random().toString(36).substr(2, 9),
                    name: args.item_name,
                    price: args.price,
                    quantity: args.quantity
                  }]);
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "Ji Janab, add kar diya hai." } }
                  }));
                }
              }
            }
          },
          onerror: (e) => { 
            setStatus(ConnectionStatus.ERROR); 
          },
          onclose: () => { 
            setStatus(ConnectionStatus.DISCONNECTED); 
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [addToCartFn] }],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setStatus(ConnectionStatus.ERROR);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  const total = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="w-full max-w-4xl mx-auto bg-surface-card rounded-2xl shadow-xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/20 rounded-md flex items-center justify-center p-1 border border-accent/30">
            <div className="w-full h-full bg-accent rounded"></div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Domino's Pakistan</h3>
            <p className="text-xs text-secondary-grey">Sobia - Voice Ordering Assistant</p>
          </div>
        </div>
        {status === ConnectionStatus.CONNECTED && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Main Interaction Area */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-surface-dark rounded-xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center space-y-6 border border-white/5">
            {status === ConnectionStatus.DISCONNECTED && (
              <>
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
                  <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Assalam-o-Alaikum!</h2>
                  <p className="text-secondary-grey mt-2">صوبیہ آپ کے آرڈر کے لیے تیار ہیں</p>
                </div>
                <button 
                  onClick={startSession}
                  className="bg-accent hover:bg-accent/80 text-white px-10 py-4 rounded-full font-black text-lg transition-all shadow-[0_0_20px_-5px_rgba(227,101,91,0.5)] hover:scale-105"
                >
                  Start Ordering
                </button>
              </>
            )}

            {status === ConnectionStatus.CONNECTING && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                <p className="text-secondary-grey font-bold italic">Connecting you to Sobia...</p>
              </div>
            )}

            {status === ConnectionStatus.CONNECTED && (
              <div className="w-full space-y-6">
                <div className="flex items-center gap-4 text-accent justify-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  <span className="font-black text-sm uppercase tracking-widest text-white">On Call with Sobia</span>
                </div>

                <div className="w-full bg-surface-card rounded-2xl p-5 border border-white/5 shadow-inner">
                  <div className="space-y-3 max-h-[150px] overflow-y-auto">
                    {transcriptions.map((t, i) => (
                      <div key={i} className={`flex ${t.startsWith('Sobia:') ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                          t.startsWith('Sobia:') 
                          ? 'bg-surface-dark text-white border border-white/5' 
                          : 'bg-accent text-white'
                        }`}>
                          <span dir={/[\u0600-\u06FF]/.test(t) ? 'rtl' : 'ltr'} className="block">
                            {t.split(':').slice(1).join(':').trim()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 justify-center">
                  <button 
                    onClick={() => {
                      isMutedRef.current = !isMutedRef.current;
                      setIsMuted(isMutedRef.current);
                    }}
                    className={`p-5 rounded-full transition-all border ${
                      isMuted 
                        ? 'bg-accent/20 text-accent border-accent/30' 
                        : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      )}
                    </svg>
                  </button>
                  <button 
                    onClick={stopSession}
                    className="bg-accent hover:bg-accent/80 text-white px-10 py-4 rounded-full font-black transition-all shadow-lg shadow-accent/20"
                  >
                    End Call
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-surface-card rounded-xl shadow-sm border border-white/5 overflow-hidden">
          <div className="p-4 bg-surface-dark border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Current Order</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
            {orderItems.length === 0 ? (
              <p className="text-secondary-grey text-sm italic text-center py-4">No items yet</p>
            ) : (
              orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-secondary-grey">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-accent">Rs. {item.price * item.quantity}</p>
                </div>
              ))
            )}
          </div>
          {orderItems.length > 0 && (
            <div className="p-4 bg-surface-dark border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Total</span>
                <span className="text-xl font-black text-accent">Rs. {total}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

