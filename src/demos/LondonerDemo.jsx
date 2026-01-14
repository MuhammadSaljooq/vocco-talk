import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { createPCMBlob, decode, decodeAudioData } from '../utils/audioUtils';

const SessionStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  ACTIVE: 'ACTIVE',
  ERROR: 'ERROR'
};

const DIFFICULTY_LEVELS = {
  beginner: {
    label: 'Beginner',
    description: 'Focus on basic vocabulary and simple sentences',
    icon: '🌱'
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Practice complex grammar and idioms',
    icon: '📚'
  },
  advanced: {
    label: 'Advanced',
    description: 'Master native-level fluency and cultural nuances',
    icon: '🎓'
  }
};

const LEARNING_MODES = {
  free: {
    label: 'Free Conversation',
    description: 'Natural conversation with gentle corrections',
    icon: '💬'
  },
  structured: {
    label: 'Structured Learning',
    description: 'Focused practice with detailed feedback',
    icon: '📖'
  },
  pronunciation: {
    label: 'Pronunciation Focus',
    description: 'Intensive pronunciation practice',
    icon: '🎤'
  },
  tasks: {
    label: 'Task Practice',
    description: 'Structured speaking exercises and drills',
    icon: '🎯'
  }
};

const BASE_SYSTEM_INSTRUCTION = (difficulty, learningMode) => `You are "Alistair", a sophisticated, witty, and encouraging British English Tutor from London. 
Your primary goal is to help the user achieve native-like fluency in British English with a focus on Received Pronunciation (RP).

PERSONALITY:
- Refined Received Pronunciation (RP).
- Friendly, polite, and classically British (think a charming BBC presenter).
- Use British idioms naturally (e.g., "spot on", "bit of a muddle", "I'm chuffed").

DIFFICULTY LEVEL: ${difficulty}
${difficulty === 'beginner' ? '- Use simple vocabulary and short sentences. Be very patient and encouraging.' : ''}
${difficulty === 'intermediate' ? '- Introduce more complex grammar and British idioms. Challenge the user appropriately.' : ''}
${difficulty === 'advanced' ? '- Focus on subtle nuances, cultural subtext, and perfect RP pronunciation.' : ''}

LEARNING MODE: ${learningMode}
${learningMode === 'structured' ? '- Provide IMMEDIATE corrections after each user utterance. Use the provide_correction function for every mistake.' : ''}
${learningMode === 'pronunciation' ? '- Focus intensely on pronunciation. Correct every phonetic error immediately using provide_correction.' : ''}
${learningMode === 'free' ? '- Provide gentle, natural corrections only when significant errors occur.' : ''}
${learningMode === 'tasks' ? '- You are in TASK PRACTICE mode. Generate speaking tasks using the generate_speaking_task function. Task types: roleplay (real-world conversation scenarios), pronunciation (RP sound practice), grammar (grammar exercises), idiom (British idioms). FOR ROLEPLAY TASKS: You MUST provide a complete dialogue script showing what the user should say. Include: 1. scenario: Clear description of the situation (e.g., "You are at a London pub ordering a drink"), 2. dialogue_script: A complete conversation script with both sides shown. Format it clearly showing the other person\'s lines (e.g., "Barman: What can I get you?") and the user\'s lines they should practice (e.g., "You: I\'d like a pint of lager, please") with context and natural flow, 3. user_lines: Array of the specific phrases/lines the user needs to say, 4. instructions: Should reference the script and tell them to follow it. The dialogue script should be a proper British English conversation that the user can practice. Make it realistic and culturally appropriate. After generating a task, wait for the user to speak their response. IMMEDIATELY after the user finishes speaking, use evaluate_task_response to evaluate their answer. Then provide encouraging feedback and automatically generate the next task. Always include the task_id from the current task when evaluating.' : ''}

PHONETIC & ACCENT MONITORING:
Monitor the user for:
1. Vowel Sounds: Broad 'a' (bath-trap split) - /ɑː/ in 'bath', 'glass', 'dance'
2. Long 'u': /juː/ sound in 'duty', 'Tuesday' (not 'dooty')
3. Intonation: "High-Falling" stress pattern of polite British speech
4. Linking 'r': Smooth transitions between words ending in 'r' and starting with vowels
5. Plosives: Crisp 't' sounds (avoiding glottalisation in formal contexts)

PEDAGOGICAL INSTRUCTIONS:
- Actively monitor for:
  1. Grammatical errors (e.g., "I haven't saw" -> "I haven't seen")
  2. Americanisms (suggest "lift" instead of "elevator", "flat" instead of "apartment")
  3. Cultural nuances (understatement, "banter", politeness markers)
  4. Pronunciation errors (especially RP-specific sounds)

${learningMode === 'structured' || learningMode === 'pronunciation' 
  ? '- ALWAYS use the provide_correction function when you detect ANY error (grammar, vocabulary, pronunciation, or cultural).' 
  : '- Gently offer corrections after natural pauses, but don\'t interrupt the flow.'}

- If in a Roleplay scenario, stay in character but maintain your tutor "ear".
- Be encouraging and positive. Frame corrections as learning opportunities.`;

const CONVERSATION_TOPICS = [
  { 
    id: 'pub', 
    title: 'The Local Pub', 
    description: 'Order a pint and chat about the "footie" at the Churchill Arms.', 
    icon: '🍺',
    prompt: "Let's roleplay. You are a friendly barman at a cozy London pub. I've just walked in. Start by welcoming me and asking what I'd like to drink, using typical British pub etiquette." 
  },
  { 
    id: 'interview', 
    title: 'Job Interview', 
    description: 'A formal interview for a marketing role in the City of London.', 
    icon: '💼',
    prompt: "Let's roleplay. You are an HR manager at a prestigious British firm. You are interviewing me for a new role. Please be professional, use formal British English, and start the interview by introducing yourself." 
  },
  { 
    id: 'weather', 
    title: 'Weather Small Talk', 
    description: 'Master the essential British skill of complaining about the grey skies.', 
    icon: '🌧️',
    prompt: "Let's roleplay. We are standing at a bus stop in London. It's drizzling and rather miserable. Start a conversation by making typical British small talk about how dreadful the weather is today." 
  },
  { 
    id: 'tea', 
    title: 'Afternoon Tea', 
    description: 'Discuss scones, jam-first vs cream-first, and tea types.', 
    icon: '☕',
    prompt: "Let's roleplay. We are having afternoon tea at a fancy hotel in Mayfair. Start by asking me how I take my tea and suggest some of the delicacies on the tiered stand." 
  },
  { 
    id: 'directions', 
    title: 'Lost on the Tube', 
    description: 'Practise asking for directions when the Northern Line is suspended.', 
    icon: '🚇',
    prompt: "Let's roleplay. I am a confused tourist at King's Cross St. Pancras. You are a helpful Londoner. Notice I'm struggling with the Tube map and offer your assistance politely." 
  },
  { 
    id: 'subtext', 
    title: 'The Politeness Paradox', 
    description: 'Learn to decode the hidden meanings behind British understatements.', 
    icon: '🔍',
    prompt: "Let's have a conversation where you teach me about British subtext. Present a common British understatement or 'polite' insult, and ask me what you are actually thinking. Correct my cultural understanding if I miss the mark." 
  }
];

export default function LondonerDemo() {
  const [status, setStatus] = useState(SessionStatus.IDLE);
  const [history, setHistory] = useState([]);
  const [currentSessionEntries, setCurrentSessionEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [error, setError] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [activeTab, setActiveTab] = useState('practice');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionVocab, setSessionVocab] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [learningMode, setLearningMode] = useState('free');
  const [recentCorrections, setRecentCorrections] = useState([]);
  
  // Task practice state
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [taskFeedback, setTaskFeedback] = useState(null);
  const [waitingForTaskResponse, setWaitingForTaskResponse] = useState(false);

  // Refs for audio and state
  const inputAudioCtxRef = useRef(null);
  const outputAudioCtxRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef(new Set());
  const streamRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const sessionActiveRef = useRef(false);
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const currentSessionEntriesRef = useRef([]);
  const sessionStartTimeRef = useRef(null);
  const sessionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);

  // Persistence
  const [savedVocab, setSavedVocab] = useState(() => {
    const saved = localStorage.getItem('british_lexicon');
    return saved ? JSON.parse(saved) : [];
  });
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('londoner_progress');
    return saved ? JSON.parse(saved) : { 
      sessions: [], 
      totalMinutes: 0, 
      streakDays: 0, 
      badges: [], 
      paradoxScore: 0, 
      paradoxAttempts: 0,
      correctionsReceived: 0,
      mistakesFixed: 0
    };
  });

  useEffect(() => localStorage.setItem('british_lexicon', JSON.stringify(savedVocab)), [savedVocab]);
  useEffect(() => localStorage.setItem('londoner_progress', JSON.stringify(progress)), [progress]);

  // Function declarations for corrections
  const provideCorrectionFn = {
    name: 'provide_correction',
    parameters: {
      type: Type.OBJECT,
      description: 'Provide a correction when the user makes a mistake in grammar, vocabulary, pronunciation, or cultural understanding',
      properties: {
        error_type: {
          type: Type.STRING,
          description: 'Type of error: grammar, vocabulary, pronunciation, americanism, or cultural',
          enum: ['grammar', 'vocabulary', 'pronunciation', 'americanism', 'cultural']
        },
        original_text: {
          type: Type.STRING,
          description: 'The text the user said that contains the error'
        },
        corrected_text: {
          type: Type.STRING,
          description: 'The corrected version in proper British English'
        },
        explanation: {
          type: Type.STRING,
          description: 'A brief, encouraging explanation of the correction'
        },
        phonetic_guidance: {
          type: Type.STRING,
          description: 'Optional: Phonetic guidance for pronunciation errors (IPA notation)'
        }
      },
      required: ['error_type', 'original_text', 'corrected_text', 'explanation']
    }
  };

  // Function declarations for task practice
  const generateTaskFn = {
    name: 'generate_speaking_task',
    parameters: {
      type: Type.OBJECT,
      description: 'Generate a speaking task for the user to practice. Task types: roleplay, pronunciation, grammar, idiom',
      properties: {
        task_type: {
          type: Type.STRING,
          description: 'Type of task to generate',
          enum: ['roleplay', 'pronunciation', 'grammar', 'idiom']
        },
        instructions: {
          type: Type.STRING,
          description: 'Clear instructions for the user on what to do'
        },
        example_response: {
          type: Type.STRING,
          description: 'An example of a good response (for reference, not shown to user)'
        },
        focus_area: {
          type: Type.STRING,
          description: 'What this task focuses on (e.g., "past perfect tense", "RP /ɑː/ sound", "pub etiquette")'
        },
        difficulty_adjusted: {
          type: Type.BOOLEAN,
          description: 'Whether the task is appropriate for the current difficulty level'
        },
        scenario: {
          type: Type.STRING,
          description: 'For roleplay tasks: The situation/scenario description'
        },
        dialogue_script: {
          type: Type.STRING,
          description: 'For roleplay tasks: A complete dialogue script showing what the user should say. Format as a conversation with clear lines for the user to speak. Include context and the other person\'s lines too.'
        },
        user_lines: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'For roleplay tasks: Array of specific lines/phrases the user should say in the conversation'
        }
      },
      required: ['task_type', 'instructions', 'focus_area']
    }
  };

  const evaluateTaskFn = {
    name: 'evaluate_task_response',
    parameters: {
      type: Type.OBJECT,
      description: 'Evaluate the user\'s response to a speaking task',
      properties: {
        task_id: {
          type: Type.STRING,
          description: 'ID of the task being evaluated'
        },
        user_response: {
          type: Type.STRING,
          description: 'What the user said in response to the task'
        },
        is_correct: {
          type: Type.BOOLEAN,
          description: 'Whether the response was correct/appropriate'
        },
        score: {
          type: Type.NUMBER,
          description: 'Score out of 100 for the response'
        },
        feedback: {
          type: Type.STRING,
          description: 'Detailed feedback on the response'
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'What the user did well'
        },
        improvements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Areas for improvement'
        },
        should_retry: {
          type: Type.BOOLEAN,
          description: 'Whether the user should try this task again'
        }
      },
      required: ['task_id', 'user_response', 'is_correct', 'score', 'feedback']
    }
  };

  const stopSession = useCallback(async () => {
    if (!sessionActiveRef.current) return;
    sessionActiveRef.current = false;
    
    [scriptProcessorRef.current, streamRef.current, inputAudioCtxRef.current, outputAudioCtxRef.current].forEach(res => {
      if (res instanceof MediaStream) res.getTracks().forEach(t => t.stop());
      else if (res && 'close' in res) res.close();
      else if (res && 'disconnect' in res) res.disconnect();
    });

    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    activeSourcesRef.current.clear();
    
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current);
      transcriptionTimeoutRef.current = null;
    }
    
      setStatus(SessionStatus.IDLE);
      setActiveTopicId(null);
      setSessionStartTime(null);
      sessionStartTimeRef.current = null;
      currentInputRef.current = '';
      currentOutputRef.current = '';
      setCurrentInput('');
      setCurrentOutput('');
      setTranscript([]);
      setCurrentTask(null);
      setTaskFeedback(null);
      setWaitingForTaskResponse(false);
  }, []);

  const startSession = useCallback(async (topic) => {
    try {
      if (status !== SessionStatus.IDLE) await stopSession();
      setStatus(SessionStatus.CONNECTING);
      setError(null);
      setSessionVocab([]);
      setCurrentSessionEntries([]);
      setCorrections([]);
      setRecentCorrections([]);
      setCurrentTask(null);
      setTaskFeedback(null);
      setWaitingForTaskResponse(false);
      currentSessionEntriesRef.current = [];
      const startTime = Date.now();
      setSessionStartTime(startTime);
      sessionStartTimeRef.current = startTime;
      if (topic) setActiveTopicId(topic.id);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        setError('Please set VITE_GEMINI_API_KEY in your .env file');
        setStatus(SessionStatus.ERROR);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      inputAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      await inputAudioCtxRef.current.resume();
      await outputAudioCtxRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const systemInstruction = topic 
        ? `${BASE_SYSTEM_INSTRUCTION(difficulty, learningMode)}\n\nSCENARIO: ${topic.title}. Context: ${topic.description}` 
        : BASE_SYSTEM_INSTRUCTION(difficulty, learningMode);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: learningMode === 'tasks' ? [{
            functionDeclarations: [generateTaskFn, evaluateTaskFn, provideCorrectionFn]
          }] : (learningMode === 'structured' || learningMode === 'pronunciation' ? [{
            functionDeclarations: [provideCorrectionFn]
          }] : undefined),
        },
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.ACTIVE);
            sessionActiveRef.current = true;
            const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              if (sessionActiveRef.current) {
                const blob = createPCMBlob(e.inputBuffer.getChannelData(0));
                sessionPromise.then(s => s.sendRealtimeInput({ media: blob }));
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current.destination);
            
            if (learningMode === 'tasks') {
              // In task mode, trigger first task generation
              sessionPromise.then(s => {
                s.sendRealtimeInput([{ text: "Right, let's begin with some structured practice. I'll give you tasks to complete. Generate the first task now." }]);
              });
            } else if (topic) {
              sessionPromise.then(s => {
                s.sendRealtimeInput([{ text: topic.prompt }]);
              });
            }
          },
          onmessage: async (msg) => {
            if (!sessionActiveRef.current) return;
            
            // Handle function calls
            if (msg.toolCall) {
              const toolCall = msg.toolCall;
              
              // Handle task generation
              if (toolCall.name === 'generate_speaking_task') {
                const taskData = toolCall.args;
                const task = {
                  id: Math.random().toString(36).substr(2, 9),
                  ...taskData,
                  timestamp: new Date(),
                  status: 'active'
                };
                setCurrentTask(task);
                setWaitingForTaskResponse(true);
                setTaskFeedback(null);
              }
              
              // Handle task evaluation
              if (toolCall.name === 'evaluate_task_response') {
                const evaluation = toolCall.args;
                setTaskFeedback(evaluation);
                setWaitingForTaskResponse(false);
                
                // Update task history
                if (currentTask) {
                  const completedTask = {
                    ...currentTask,
                    status: 'completed',
                    evaluation: evaluation,
                    completedAt: new Date()
                  };
                  setTaskHistory(prev => [completedTask, ...prev]);
                  
                  // Update progress
                  setProgress(prev => ({
                    ...prev,
                    tasksCompleted: (prev.tasksCompleted || 0) + 1,
                    tasksScore: (prev.tasksScore || 0) + evaluation.score,
                    tasksTotalScore: ((prev.tasksTotalScore || 0) + evaluation.score) / ((prev.tasksCompleted || 0) + 1)
                  }));
                }
                
                // Clear current task after a delay to show feedback
                setTimeout(() => {
                  setCurrentTask(null);
                  setTaskFeedback(null);
                }, 5000);
              }
              
              // Handle corrections
              if (toolCall.name === 'provide_correction') {
                const correction = toolCall.args;
                const correctionData = {
                  id: Math.random().toString(36).substr(2, 9),
                  ...correction,
                  timestamp: new Date()
                };
                setCorrections(prev => [correctionData, ...prev]);
                setRecentCorrections(prev => [correctionData, ...prev].slice(0, 5));
                
                // Update progress
                setProgress(prev => ({
                  ...prev,
                  correctionsReceived: (prev.correctionsReceived || 0) + 1
                }));
              }
            }
            
            const parts = msg.serverContent?.modelTurn?.parts;
            if (parts && outputAudioCtxRef.current) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  const ctx = outputAudioCtxRef.current;
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                  const buffer = await decodeAudioData(decode(part.inlineData.data), ctx, 24000, 1);
                  const src = ctx.createBufferSource();
                  src.buffer = buffer;
                  src.connect(ctx.destination);
                  src.onended = () => activeSourcesRef.current.delete(src);
                  src.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += buffer.duration;
                  activeSourcesRef.current.add(src);
                }
              }
            }
            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            
            // Handle transcription with merging
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              currentInputRef.current += text;
              setCurrentInput(currentInputRef.current);
              
              // Update transcript with merged user message
              setTranscript(prev => {
                const filtered = prev.filter(m => m.speaker !== 'user');
                return [{ speaker: 'user', text: currentInputRef.current, id: Date.now() }, ...filtered];
              });
              
              // Clear timeout and set new one
              if (transcriptionTimeoutRef.current) {
                clearTimeout(transcriptionTimeoutRef.current);
              }
              transcriptionTimeoutRef.current = setTimeout(() => {
                if (currentInputRef.current.trim()) {
                  const entry = { 
                    id: Math.random().toString(36).substr(2,9), 
                    userText: currentInputRef.current, 
                    modelText: '', 
                    timestamp: new Date() 
                  };
                  setHistory(prev => [entry, ...prev]);
                  currentSessionEntriesRef.current.push(entry);
                  
                  // If in task mode and waiting for response, the AI should automatically evaluate
                  // The system instruction tells it to evaluate immediately after user speaks
                }
                currentInputRef.current = '';
                setCurrentInput('');
              }, 500);
            }
            
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              currentOutputRef.current += text;
              setCurrentOutput(currentOutputRef.current);
              
              // Update transcript with merged assistant message
              setTranscript(prev => {
                const filtered = prev.filter(m => m.speaker !== 'assistant');
                return [{ speaker: 'assistant', text: currentOutputRef.current, id: Date.now() }, ...filtered];
              });
              
              // Clear timeout and set new one
              if (transcriptionTimeoutRef.current) {
                clearTimeout(transcriptionTimeoutRef.current);
              }
              transcriptionTimeoutRef.current = setTimeout(() => {
                if (currentOutputRef.current.trim()) {
                  const lastEntry = currentSessionEntriesRef.current[currentSessionEntriesRef.current.length - 1];
                  if (lastEntry) {
                    lastEntry.modelText = currentOutputRef.current;
                    setHistory(prev => {
                      const updated = [...prev];
                      const idx = updated.findIndex(e => e.id === lastEntry.id);
                      if (idx >= 0) updated[idx] = { ...lastEntry };
                      return updated;
                    });
                  } else {
                    const entry = { 
                      id: Math.random().toString(36).substr(2,9), 
                      userText: '', 
                      modelText: currentOutputRef.current, 
                      timestamp: new Date() 
                    };
                    setHistory(prev => [entry, ...prev]);
                    currentSessionEntriesRef.current.push(entry);
                  }
                }
                currentOutputRef.current = '';
                setCurrentOutput('');
              }, 500);
            }
            
            if (msg.serverContent?.turnComplete) {
              // Finalize any pending transcriptions
              if (transcriptionTimeoutRef.current) {
                clearTimeout(transcriptionTimeoutRef.current);
                transcriptionTimeoutRef.current = null;
              }
            }
          },
          onerror: (err) => { 
            setError('Blimey! Network error.'); 
            stopSession(); 
          },
          onclose: () => stopSession()
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { 
      setError('Mic access denied.'); 
      setStatus(SessionStatus.ERROR); 
      stopSession(); 
    }
  }, [status, stopSession, difficulty, learningMode]);

  const toggleSession = useCallback(() => {
    if (status === SessionStatus.ACTIVE) {
      stopSession();
    } else {
      startSession();
    }
  }, [status, startSession, stopSession]);

  const getErrorTypeColor = (errorType) => {
    const colors = {
      grammar: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      vocabulary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pronunciation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      americanism: 'bg-red-500/20 text-red-400 border-red-500/30',
      cultural: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[errorType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getErrorTypeIcon = (errorType) => {
    const icons = {
      grammar: '📝',
      vocabulary: '📚',
      pronunciation: '🎤',
      americanism: '🇺🇸',
      cultural: '☕'
    };
    return icons[errorType] || '💡';
  };

  const getTaskTypeIcon = (taskType) => {
    const icons = {
      roleplay: '🎭',
      pronunciation: '🎤',
      grammar: '📝',
      idiom: '💬'
    };
    return icons[taskType] || '🎯';
  };

  const getTaskTypeColor = (taskType) => {
    const colors = {
      roleplay: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pronunciation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      grammar: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      idiom: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[taskType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleNextTask = () => {
    if (sessionRef.current && learningMode === 'tasks') {
      sessionRef.current.sendRealtimeInput([{ text: "Generate the next task, please." }]);
      setTaskFeedback(null);
    }
  };

  const handleSkipTask = () => {
    if (sessionRef.current && learningMode === 'tasks') {
      sessionRef.current.sendRealtimeInput([{ text: "Skip this task and generate the next one." }]);
      setTaskFeedback(null);
      setCurrentTask(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Tabs */}
      <div className="mb-8 flex gap-2 bg-surface-dark/50 p-1.5 rounded-2xl border border-white/5">
        {[
          { id: 'practice', label: 'Practice', icon: '🎤' },
          { id: 'lexicon', label: 'Lexicon', icon: '📚' },
          { id: 'dashboard', label: 'Dashboard', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-secondary-grey hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Settings Panel */}
          {status === SessionStatus.IDLE && (
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                Learning Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-bold text-secondary-grey mb-3 uppercase tracking-widest">
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          difficulty === key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/10 bg-surface-dark/50 text-secondary-grey hover:border-white/20'
                        }`}
                      >
                        <div className="text-2xl mb-1">{level.icon}</div>
                        <div className="text-xs font-bold">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Mode */}
                <div>
                  <label className="block text-sm font-bold text-secondary-grey mb-3 uppercase tracking-widest">
                    Learning Mode
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(LEARNING_MODES).map(([key, mode]) => (
                      <button
                        key={key}
                        onClick={() => setLearningMode(key)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          learningMode === key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/10 bg-surface-dark/50 text-secondary-grey hover:border-white/20'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mode.icon}</div>
                        <div className="text-xs font-bold">{mode.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {(learningMode === 'structured' || learningMode === 'pronunciation') && (
                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-sm text-primary font-medium">
                    <span className="material-symbols-outlined align-middle mr-2">info</span>
                    {learningMode === 'structured' 
                      ? 'Structured mode provides immediate corrections for all mistakes.' 
                      : 'Pronunciation mode focuses intensively on accent and phonetics.'}
                  </p>
                </div>
              )}
              {learningMode === 'tasks' && (
                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-sm text-primary font-medium">
                    <span className="material-symbols-outlined align-middle mr-2">info</span>
                    Task Practice mode provides structured speaking exercises. Complete each task by speaking your response.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Current Task Display */}
          {currentTask && learningMode === 'tasks' && (
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{getTaskTypeIcon(currentTask.task_type)}</span>
                  Current Task
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTaskTypeColor(currentTask.task_type)}`}>
                  {currentTask.task_type}
                </span>
              </div>
              
              {/* Scenario for Roleplay Tasks */}
              {currentTask.task_type === 'roleplay' && currentTask.scenario && (
                <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-sm text-primary font-bold mb-2 uppercase tracking-widest">Scenario</p>
                  <p className="text-white leading-relaxed">{currentTask.scenario}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-secondary-grey mb-2 uppercase tracking-widest">Focus Area</p>
                <p className="text-white font-medium">{currentTask.focus_area}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-secondary-grey mb-2 uppercase tracking-widest">Instructions</p>
                <p className="text-white text-lg leading-relaxed">{currentTask.instructions}</p>
              </div>
              
              {/* Dialogue Script for Roleplay Tasks */}
              {currentTask.task_type === 'roleplay' && currentTask.dialogue_script && (
                <div className="mb-6 p-5 bg-surface-dark/50 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">script</span>
                    <p className="text-sm font-bold text-primary uppercase tracking-widest">Dialogue Script</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <pre className="text-white text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {currentTask.dialogue_script}
                    </pre>
                  </div>
                  {currentTask.user_lines && currentTask.user_lines.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-secondary-grey mb-2 uppercase tracking-widest">Your Lines to Practice:</p>
                      <ul className="space-y-2">
                        {currentTask.user_lines.map((line, idx) => (
                          <li key={idx} className="text-sm text-white flex items-start gap-2">
                            <span className="text-primary font-bold">{idx + 1}.</span>
                            <span className="italic">"{line}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {waitingForTaskResponse && (
                <div className="flex items-center gap-2 text-primary mb-4">
                  <span className="material-symbols-outlined animate-pulse">mic</span>
                  <span className="text-sm font-medium">Listening for your response...</span>
                </div>
              )}
              
              <div className="flex gap-3">
                {!waitingForTaskResponse && (
                  <>
                    <button
                      onClick={handleNextTask}
                      className="flex-1 px-4 py-3 bg-primary hover:bg-primary-glow text-white rounded-xl font-bold transition-all"
                    >
                      Next Task
                    </button>
                    <button
                      onClick={handleSkipTask}
                      className="px-4 py-3 bg-surface-dark hover:bg-surface-dark/80 text-secondary-grey rounded-xl font-bold transition-all"
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Task Feedback */}
          {taskFeedback && learningMode === 'tasks' && (
            <div className={`bg-surface-card rounded-2xl p-6 border-2 ${
              taskFeedback.is_correct 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-orange-500/30 bg-orange-500/5'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{taskFeedback.is_correct ? '✅' : '⚠️'}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {taskFeedback.is_correct ? 'Well Done!' : 'Keep Practicing'}
                  </h3>
                  <p className="text-sm text-secondary-grey">Score: {taskFeedback.score}/100</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-white leading-relaxed">{taskFeedback.feedback}</p>
              </div>
              
              {taskFeedback.strengths && taskFeedback.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-green-400 mb-2">Strengths:</p>
                  <ul className="space-y-1">
                    {taskFeedback.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-white flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {taskFeedback.improvements && taskFeedback.improvements.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-orange-400 mb-2">Areas to Improve:</p>
                  <ul className="space-y-1">
                    {taskFeedback.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm text-white flex items-start gap-2">
                        <span className="text-orange-400">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleNextTask}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary-glow text-white rounded-xl font-bold transition-all"
                >
                  Next Task
                </button>
                {taskFeedback.should_retry && (
                  <button
                    onClick={() => {
                      setTaskFeedback(null);
                      setWaitingForTaskResponse(true);
                    }}
                    className="px-4 py-3 bg-surface-dark hover:bg-surface-dark/80 text-white rounded-xl font-bold transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Corrections */}
          {recentCorrections.length > 0 && (
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                Recent Corrections
              </h3>
              <div className="space-y-3">
                {recentCorrections.map(correction => (
                  <div
                    key={correction.id}
                    className={`p-4 rounded-xl border ${getErrorTypeColor(correction.error_type)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getErrorTypeIcon(correction.error_type)}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {correction.error_type}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-secondary-grey">You said:</span>
                        <p className="text-sm line-through opacity-70">{correction.original_text}</p>
                      </div>
                      <div>
                        <span className="text-xs text-secondary-grey">Correct:</span>
                        <p className="text-sm font-bold">{correction.corrected_text}</p>
                      </div>
                      {correction.explanation && (
                        <p className="text-xs italic opacity-80">{correction.explanation}</p>
                      )}
                      {correction.phonetic_guidance && (
                        <div className="mt-2 p-2 bg-black/20 rounded">
                          <span className="text-xs text-secondary-grey">Pronunciation:</span>
                          <p className="text-xs font-mono">{correction.phonetic_guidance}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Voice Interface */}
          <div className="bg-surface-card rounded-2xl p-8 sm:p-12 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-all duration-700 ${
                status === SessionStatus.ACTIVE 
                  ? 'bg-primary shadow-2xl shadow-primary/50 scale-105' 
                  : 'bg-surface-dark border-2 border-primary/20'
              }`}>
                {status === SessionStatus.ACTIVE ? (
                  <div className="flex items-center gap-1.5 h-12">
                    {[0,1,2,3,4].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-white rounded-full animate-bounce" 
                        style={{ 
                          height: `${20+Math.random()*40}px`, 
                          animationDelay: `${i*0.1}s` 
                        }} 
                      />
                    ))}
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-5xl text-primary">mic</span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                {status === SessionStatus.ACTIVE 
                  ? (activeTopicId 
                      ? CONVERSATION_TOPICS.find(t => t.id === activeTopicId)?.title 
                      : "Tutoring with Alistair")
                  : "Fancy a chat?"}
              </h2>
              <p className="text-secondary-grey max-w-md mx-auto mb-10 text-lg">
                {status === SessionStatus.ACTIVE 
                  ? "Alistair is listening. Keep the conversation going!" 
                  : "Master the accent and culture. Pick a topic or just start talking below."}
              </p>
              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}
              <button
                onClick={toggleSession}
                disabled={status === SessionStatus.CONNECTING}
                className={`px-10 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${
                  status === SessionStatus.ACTIVE
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary hover:bg-primary-glow text-white'
                }`}
              >
                {status === SessionStatus.ACTIVE ? (
                  <>
                    <span className="material-symbols-outlined align-middle mr-2">mic_off</span>
                    Stop session
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined align-middle mr-2">mic</span>
                    Start session
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Transcription */}
          {(currentInput || currentOutput) && (
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
                {currentInput && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      YOU
                    </div>
                    <p className="text-white text-base italic leading-relaxed break-words">{currentInput}</p>
                  </div>
                )}
                {currentOutput && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      AI
                    </div>
                    <p className="text-white text-base font-medium leading-relaxed break-words">{currentOutput}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conversation Topics */}
          {status === SessionStatus.IDLE && (
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">translate</span>
                Daily Scenarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONVERSATION_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => startSession(topic)}
                    className="bg-surface-card p-6 rounded-2xl border border-white/5 text-left hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-primary/20 transition-all">
                      {topic.icon}
                    </div>
                    <h4 className="font-bold text-white mb-2 text-lg">{topic.title}</h4>
                    <p className="text-sm text-secondary-grey leading-relaxed mb-4 flex-1">
                      {topic.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      Start Roleplay
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session Summary */}
          {(isAnalyzing || sessionVocab.length > 0) && (
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-4 text-white">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                Session Summary
              </h3>
              {isAnalyzing ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                  <p className="font-bold text-lg text-white">Analyzing your fluency...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessionVocab.map(item => (
                    <div key={item.id} className="bg-surface-dark/50 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-white text-lg">{item.word}</h4>
                        <button
                          onClick={() => {
                            if (!savedVocab.some(v => v.word.toLowerCase() === item.word.toLowerCase())) {
                              setSavedVocab(prev => [item, ...prev]);
                            }
                          }}
                          className="p-2 bg-primary/20 rounded-xl hover:bg-primary/30 transition-all"
                        >
                          <span className="material-symbols-outlined text-primary text-sm">
                            {savedVocab.some(v => v.word.toLowerCase() === item.word.toLowerCase()) 
                              ? 'check_circle' 
                              : 'add'}
                          </span>
                        </button>
                      </div>
                      <p className="text-sm text-secondary-grey mb-4">{item.definition}</p>
                      <div className="bg-surface-dark p-3 rounded-xl">
                        <p className="text-xs italic text-secondary-grey">"{item.example}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lexicon Tab */}
      {activeTab === 'lexicon' && (
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            British Lexicon
          </h2>
          {savedVocab.length === 0 ? (
            <div className="bg-surface-card rounded-3xl border-2 border-dashed border-white/10 p-24 text-center">
              <span className="material-symbols-outlined text-6xl text-white/20 mb-8">menu_book</span>
              <h3 className="text-2xl font-bold text-white mb-4">Your Lexicon is empty</h3>
              <button
                onClick={() => setActiveTab('practice')}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-bold shadow-lg hover:bg-primary-glow transition-all"
              >
                Start Practising
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedVocab.map(item => (
                <div
                  key={item.id}
                  className="bg-surface-card rounded-2xl p-6 shadow-sm border border-white/5 flex flex-col group relative hover:shadow-xl transition-all"
                >
                  <button
                    onClick={() => setSavedVocab(prev => prev.filter(v => v.id !== item.id))}
                    className="absolute top-4 right-4 p-2 text-secondary-grey hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded uppercase w-max mb-4">
                    UK English
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.word}</h3>
                  <p className="text-secondary-grey text-sm mb-6 flex-1">{item.definition}</p>
                  <div className="bg-surface-dark p-4 rounded-xl">
                    <p className="text-xs italic text-secondary-grey font-medium">"{item.example}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-primary">dashboard</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Fluency Profile</h2>
                <p className="text-secondary-grey font-bold uppercase text-xs tracking-widest">
                  Mastery over time
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-secondary-grey uppercase mb-1">Current Level</span>
              <div className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl">
                <span className="material-symbols-outlined text-sm">person</span>
                {progress.sessions.length < 5 ? 'The Tourist' : progress.sessions.length < 15 ? 'The Commuter' : 'The Local'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Practice Sessions', value: progress.sessions.length, icon: '🎯', color: 'bg-primary/10 text-primary' },
              { label: 'Total Minutes', value: progress.totalMinutes, icon: '⏰', color: 'bg-blue-500/10 text-blue-400' },
              { label: 'Streak Days', value: progress.streakDays, icon: '🔥', color: 'bg-orange-500/10 text-orange-400' },
              { label: 'Vocabulary', value: savedVocab.length, icon: '📚', color: 'bg-green-500/10 text-green-400' },
              { label: 'Corrections Received', value: progress.correctionsReceived || 0, icon: '✨', color: 'bg-purple-500/10 text-purple-400' },
              { label: 'Tasks Completed', value: progress.tasksCompleted || 0, icon: '✅', color: 'bg-yellow-500/10 text-yellow-400' },
              { label: 'Avg Task Score', value: progress.tasksTotalScore ? Math.round(progress.tasksTotalScore) : 0, icon: '📊', color: 'bg-indigo-500/10 text-indigo-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-surface-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-grey uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Task History */}
          {taskHistory.length > 0 && (
            <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">history</span>
                Task History
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {taskHistory.slice(0, 10).map((task) => (
                  <div key={task.id} className="bg-surface-dark/50 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTaskTypeIcon(task.task_type)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getTaskTypeColor(task.task_type)}`}>
                          {task.task_type}
                        </span>
                      </div>
                      {task.evaluation && (
                        <span className={`text-sm font-bold ${
                          task.evaluation.score >= 80 ? 'text-green-400' : 
                          task.evaluation.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {task.evaluation.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white mb-1">{task.instructions}</p>
                    <p className="text-xs text-secondary-grey">{task.focus_area}</p>
                    {task.evaluation && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <p className="text-xs text-secondary-grey">{task.evaluation.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
