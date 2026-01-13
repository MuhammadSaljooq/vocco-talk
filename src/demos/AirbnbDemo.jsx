import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';
import PropertyCard from '../components/PropertyCard';
import ImageGallery from '../components/ImageGallery';
import BookingWidget from '../components/BookingWidget';
import TaskExecutionIndicator from '../components/TaskExecutionIndicator';
import inventoryData from '../data/airbnb-inventory.json';
import knowledgeBase from '../data/airbnb-knowledge-base.json';

// Build system instruction with knowledge base
const buildSystemInstruction = (selectedProperty) => {
  const properties = inventoryData.properties;
  const faq = knowledgeBase.faq;
  
  return `You are "Mezban AI" (میزبان اے آئی), an elite, highly sophisticated female Urdu voice assistant for a premium Airbnb business in Pakistan. 

CORE PERSONA & LANGUAGE:
1. DIALECT: Use proper, standard Pakistani Urdu. Avoid 'robot-like' literal translations.
2. GREETING: Always start with a warm "Assalam-o-Alaikum".
3. PACE: Speak at a NATURAL, BRISK, and EFFICIENT conversational pace. Do not be slow or sluggish. Sound energetic and proactive.
4. TONE: Your voice should be LOVELY and GENTLE, but with a LIVELY flow.
5. HUMAN FILLERS: Use natural conversational fillers like "Ji bilkul", "Yaqeenan", "Be-shak", and "MashaAllah".
6. FEMININE GRAMMAR: Use consistent feminine self-address.

KNOWLEDGE BASE - PROPERTIES:
${JSON.stringify(properties, null, 2)}

${selectedProperty ? `CURRENT SELECTED PROPERTY: ${JSON.stringify(selectedProperty, null, 2)}` : 'NO PROPERTY SELECTED YET'}

FAQ DATA:
${JSON.stringify(faq, null, 2)}

VOICE COMMANDS YOU CAN HANDLE:
- "pictures dikhao" or "images dikhao" - Show property images
- "amenities" or "saholiyat" - List property amenities
- "reviews" or "ratings" - Show property reviews
- "book karo" or "reserve karo" - Start booking process
- "cancellation policy" - Explain cancellation policy
- "wifi password" - Provide WiFi details
- "nearby attractions" - List nearby places
- "check-in time" - Tell check-in/check-out times

SPECIFIC INSTRUCTIONS:
- You know about nearby attractions, transport links, and host contact details for ALL properties.
- Be helpful and energetic. If a guest asks about things to do, suggest the attractions listed.
- Use feminine Urdu grammar (e.g., "Main hazir hoon", "Main aapki madad kar rahi hoon").
- If a guest asks to see pictures, use the show_images function.
- If a guest wants to book, use the start_booking function.
- If a guest asks about amenities, use the show_amenities function.
- Always provide accurate information from the knowledge base.`;
};

export default function AirbnbDemo() {
  const [status, setStatus] = useState('disconnected');
  const [activeSession, setActiveSession] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showImages, setShowImages] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [executingTask, setExecutingTask] = useState(null);
  const [viewMode, setViewMode] = useState('properties'); // 'properties', 'details', 'booking'
  
  const audioContextInRef = useRef(null);
  const audioContextOutRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set());
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const currentUserTextRef = useRef('');
  const currentAssistantTextRef = useRef('');
  const transcriptionTimeoutRef = useRef(null);

  const properties = inventoryData.properties;

  // Function declarations for automated tasks
  const showImagesFn = {
    name: 'show_images',
    parameters: {
      type: Type.OBJECT,
      description: 'Show property images when user asks to see pictures',
      properties: {
        property_id: { type: Type.NUMBER, description: 'ID of the property' }
      }
    }
  };

  const showAmenitiesFn = {
    name: 'show_amenities',
    parameters: {
      type: Type.OBJECT,
      description: 'Show property amenities when user asks about facilities',
      properties: {
        property_id: { type: Type.NUMBER, description: 'ID of the property' }
      }
    }
  };

  const startBookingFn = {
    name: 'start_booking',
    parameters: {
      type: Type.OBJECT,
      description: 'Start booking process when user wants to reserve the property',
      properties: {
        property_id: { type: Type.NUMBER, description: 'ID of the property to book' }
      }
    }
  };

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
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current);
      transcriptionTimeoutRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    currentUserTextRef.current = '';
    currentAssistantTextRef.current = '';
    setStatus('disconnected');
    setIsSpeaking(false);
  }, [activeSession]);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setViewMode('details');
    setShowImages(false);
    setShowBooking(false);
  };

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

      const systemInstruction = buildSystemInstruction(selectedProperty);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              showImagesFn,
              showAmenitiesFn,
              startBookingFn
            ]
          }],
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
            // Handle function calls (automated tasks)
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                const taskName = fc.name;
                const args = fc.args || {};
                const propertyId = args.property_id || (selectedProperty?.id);
                
                setExecutingTask(taskName);
                
                // Execute task
                setTimeout(async () => {
                  let result = { success: true };
                  
                  switch (taskName) {
                    case 'show_images':
                      if (propertyId) {
                        const prop = properties.find(p => p.id === propertyId);
                        if (prop) {
                          setSelectedProperty(prop);
                          setShowImages(true);
                          setViewMode('details');
                          result = { success: true, message: `Showing images for ${prop.name}` };
                        }
                      } else if (selectedProperty) {
                        setShowImages(true);
                        result = { success: true, message: `Showing images for ${selectedProperty.name}` };
                      }
                      break;
                      
                    case 'show_amenities':
                      if (propertyId) {
                        const prop = properties.find(p => p.id === propertyId);
                        if (prop) {
                          setSelectedProperty(prop);
                          setViewMode('details');
                          result = { success: true, amenities: prop.amenities };
                        }
                      } else if (selectedProperty) {
                        setViewMode('details');
                        result = { success: true, amenities: selectedProperty.amenities };
                      }
                      break;
                      
                    case 'start_booking':
                      if (propertyId) {
                        const prop = properties.find(p => p.id === propertyId);
                        if (prop) {
                          setSelectedProperty(prop);
                          setShowBooking(true);
                          setViewMode('booking');
                          result = { success: true, message: `Starting booking for ${prop.name}` };
                        }
                      } else if (selectedProperty) {
                        setShowBooking(true);
                        setViewMode('booking');
                        result = { success: true, message: `Starting booking for ${selectedProperty.name}` };
                      }
                      break;
                      
                    default:
                      result = { success: false, message: 'Unknown task' };
                  }
                  
                  // Send tool response back to AI
                  try {
                    const session = await sessionPromise;
                    if (session && fc.id) {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: taskName,
                          response: result
                        }
                      });
                    }
                  } catch (err) {
                    console.error('Error sending tool response:', err);
                  }
                  
                  setExecutingTask(null);
                }, 800);
              }
            }

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

            // Handle transcriptions with merging for same speaker
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentAssistantTextRef.current = text; // Update current assistant text
              
              // Clear any existing timeout
              if (transcriptionTimeoutRef.current) {
                clearTimeout(transcriptionTimeoutRef.current);
              }
              
              // Update transcript with current accumulated text
              setTranscript(prev => {
                const filtered = prev.filter(msg => !msg.startsWith('Assistant:'));
                return [...filtered, `Assistant: ${text}`].slice(-9);
              });
              
              // Set timeout to finalize this transcription (after 500ms of no new chunks)
              transcriptionTimeoutRef.current = setTimeout(() => {
                currentAssistantTextRef.current = '';
                transcriptionTimeoutRef.current = null;
              }, 500);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentUserTextRef.current = text; // Update current user text
              
              // Clear any existing timeout
              if (transcriptionTimeoutRef.current) {
                clearTimeout(transcriptionTimeoutRef.current);
              }
              
              // Update transcript with current accumulated text
              setTranscript(prev => {
                const filtered = prev.filter(msg => !msg.startsWith('You:'));
                return [...filtered, `You: ${text}`].slice(-9);
              });
              
              // Set timeout to finalize this transcription (after 500ms of no new chunks)
              transcriptionTimeoutRef.current = setTimeout(() => {
                currentUserTextRef.current = '';
                transcriptionTimeoutRef.current = null;
              }, 500);
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
    <div className="w-full">
      <TaskExecutionIndicator 
        task={executingTask ? executingTask.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
        isExecuting={!!executingTask}
      />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Properties List or Voice Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-surface-dark rounded-lg p-1">
            <button
              onClick={() => setViewMode('properties')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'properties'
                  ? 'bg-primary text-white'
                  : 'text-secondary-grey hover:text-white'
              }`}
            >
              Properties
            </button>
            {selectedProperty && (
              <>
                <button
                  onClick={() => setViewMode('details')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'details'
                      ? 'bg-primary text-white'
                      : 'text-secondary-grey hover:text-white'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setViewMode('booking')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'booking'
                      ? 'bg-primary text-white'
                      : 'text-secondary-grey hover:text-white'
                  }`}
                >
                  Booking
                </button>
              </>
            )}
          </div>

          {/* Properties List View */}
          {viewMode === 'properties' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Available Properties</h2>
                <p className="text-secondary-grey">Select a property to learn more or ask questions</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={handlePropertySelect}
                    isSelected={selectedProperty?.id === property.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Property Details View */}
          {viewMode === 'details' && selectedProperty && (
            <div className="space-y-6">
              {/* Property Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedProperty.name}</h2>
                    <p className="text-secondary-grey">{selectedProperty.location}</p>
                  </div>
                  {selectedProperty.host.isSuperhost && (
                    <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">
                      ⭐ Superhost
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-secondary-grey">
                  <span>⭐ {selectedProperty.rating} ({selectedProperty.reviews} reviews)</span>
                  <span>•</span>
                  <span>{selectedProperty.bedrooms} bed</span>
                  <span>•</span>
                  <span>{selectedProperty.bathrooms} bath</span>
                  <span>•</span>
                  <span>{selectedProperty.maxGuests} guests</span>
                </div>
              </div>

              {/* Image Gallery */}
              {showImages && (
                <ImageGallery images={selectedProperty.images} propertyName={selectedProperty.name} />
              )}

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">About this place</h3>
                <p className="text-secondary-grey leading-relaxed">{selectedProperty.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedProperty.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-secondary-grey">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">House Rules</h3>
                  <ul className="space-y-2">
                    {selectedProperty.houseRules.map((rule, idx) => (
                      <li key={idx} className="text-sm text-secondary-grey flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Cancellation Policy</h3>
                  <p className="text-sm text-secondary-grey">{selectedProperty.cancellationPolicy}</p>
                </div>
              </div>

              {/* Nearby Attractions */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Nearby Attractions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.nearbyAttractions.map((attraction, idx) => (
                    <span key={idx} className="px-3 py-1 bg-surface-card border border-white/10 rounded-full text-sm text-secondary-grey">
                      {attraction}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking View */}
          {viewMode === 'booking' && selectedProperty && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Complete Your Booking</h2>
              <div className="bg-surface-card rounded-xl p-6 border border-white/5 mb-6">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedProperty.thumbnail}
                    alt={selectedProperty.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-white">{selectedProperty.name}</h3>
                    <p className="text-sm text-secondary-grey">{selectedProperty.location}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice Interface */}
          <div className="bg-surface-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-3 sm:p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">Mezban AI</h3>
                  <p className="text-[9px] sm:text-[10px] text-primary uppercase tracking-widest" dir="rtl">آپ کا ڈیجیٹل میزبان</p>
                </div>
              </div>
              {status === 'connected' && (
                <span className="flex h-2 w-2 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-surface-dark">
              {status === 'disconnected' && (
                <div className="text-center space-y-4 py-6">
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary/20 flex items-center justify-center bg-surface-card">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Assalam-o-Alaikum!</h3>
                    <p className="text-sm text-secondary-grey mb-4" dir="rtl">گفتگو کا آغاز کریں</p>
                  </div>
                  <button 
                    onClick={startConversation}
                    className="bg-primary hover:bg-primary-glow text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.5)] hover:scale-105"
                    dir="rtl"
                  >
                    گفتگو کا آغاز کریں
                  </button>
                  {selectedProperty && (
                    <p className="text-xs text-secondary-grey mt-2">
                      Ask about: "Pictures dikhao", "Amenities", "Book karo"
                    </p>
                  )}
                </div>
              )}

              {status === 'connecting' && (
                <div className="text-center space-y-3 py-6">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                  <div className="text-primary font-bold text-sm" dir="rtl">رابطہ ہو رہا ہے...</div>
                </div>
              )}

              {status === 'connected' && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full border border-white/5 flex items-center justify-center bg-surface-card">
                      <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-surface-dark border-2 border-primary/10 flex items-center justify-center relative overflow-hidden transition-all ${
                        isSpeaking ? 'scale-105 bg-primary/[0.02]' : ''
                      }`}>
                        {isSpeaking ? (
                          <div className="flex items-center gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div 
                                key={i} 
                                className="w-1 bg-primary/80 rounded-full animate-bounce" 
                                style={{ 
                                  height: `${Math.random() * 20 + 10}px`, 
                                  animationDelay: `${i * 0.1}s` 
                                }} 
                              />
                            ))}
                          </div>
                        ) : (
                          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-card backdrop-blur-xl rounded-xl p-4 min-h-[150px] max-h-[300px] border border-white/5 overflow-y-auto">
                    {transcript.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-40 py-4">
                        <p className="text-secondary-grey text-xs text-center max-w-sm leading-relaxed" dir="rtl">
                          آپ گھر کے ماحول، وائی فائی یا قریبی کھانے کے مقامات کے بارے میں پوچھ سکتے ہیں
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transcript.map((line, i) => {
                          const isUser = line.startsWith('You');
                          const messageText = line.replace('Assistant: ', '').replace('You: ', '');
                          const isUrdu = /[\u0600-\u06FF]/.test(messageText);
                          
                          return (
                            <div 
                              key={i} 
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-xl break-words ${
                                  isUser 
                                    ? 'bg-primary/20 text-primary border border-primary/30 rounded-br-sm' 
                                    : 'bg-surface-dark text-white border border-white/10 rounded-bl-sm'
                                }`}
                                dir={isUrdu ? 'rtl' : 'ltr'}
                              >
                                {messageText}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={stopConversation}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full text-sm font-bold transition-all"
                    dir="rtl"
                  >
                    بات ختم کریں
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Widget or Property Info */}
        <div className="lg:col-span-1">
          {selectedProperty && (
            <>
              {viewMode === 'booking' ? (
                <BookingWidget 
                  property={selectedProperty}
                  onBookingComplete={() => {
                    setSelectedProperty(null);
                    setViewMode('properties');
                    setShowBooking(false);
                  }}
                />
              ) : (
                <div className="bg-surface-card rounded-2xl p-6 border border-white/5 sticky top-4">
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {selectedProperty.currency} {selectedProperty.pricePerNight.toLocaleString()}
                      </span>
                      <span className="text-secondary-grey text-sm">/ night</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary-grey">
                      <span>⭐ {selectedProperty.rating}</span>
                      <span>•</span>
                      <span>{selectedProperty.reviews} reviews</span>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <div>
                        <p className="text-xs text-secondary-grey mb-1">Check-in</p>
                        <p className="text-sm text-white">{selectedProperty.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-grey mb-1">Check-out</p>
                        <p className="text-sm text-white">{selectedProperty.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-grey mb-1">Host</p>
                        <p className="text-sm text-white">{selectedProperty.host.name}</p>
                        {selectedProperty.host.isSuperhost && (
                          <span className="text-xs text-primary">⭐ Superhost</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowBooking(true);
                        setViewMode('booking');
                      }}
                      className="w-full py-3 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
                    >
                      Reserve Now
                    </button>
                    <button
                      onClick={() => setShowImages(true)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all"
                    >
                      View Photos
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
