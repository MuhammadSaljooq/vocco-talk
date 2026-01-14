# Londoner AI - Speaking Tasks & Exercises Plan

## Overview
Add a structured speaking practice system where Alistair (the AI tutor) provides specific tasks, sentences, or exercises for users to practice speaking British English.

---

## 1. Task Types & Categories

### A. Sentence Repetition
- **What**: AI says a sentence, user repeats it
- **Purpose**: Practice pronunciation and intonation
- **Example**: 
  - AI: "The weather's rather dreadful today, isn't it?"
  - User repeats the sentence
  - AI provides feedback on pronunciation

### B. Sentence Completion
- **What**: AI gives partial sentence, user completes it
- **Purpose**: Practice grammar and vocabulary
- **Example**:
  - AI: "I'd like to order..."
  - User: "...a pint of lager, please"
  - AI evaluates correctness and British usage

### C. Picture Description
- **What**: AI describes a scenario, user describes it back
- **Purpose**: Practice descriptive language and vocabulary
- **Example**:
  - AI: "Imagine you're at a London bus stop. Describe what you see."
  - User describes the scene
  - AI provides feedback on vocabulary and grammar

### D. Roleplay Prompts
- **What**: AI gives a situation, user responds appropriately
- **Purpose**: Practice real-world conversations
- **Example**:
  - AI: "You're at a pub. The barman asks 'What can I get you?'"
  - User responds
  - AI evaluates politeness, vocabulary, and cultural appropriateness

### E. Pronunciation Drills
- **What**: Focus on specific sounds or words
- **Purpose**: Master RP pronunciation
- **Example**:
  - AI: "Practice saying 'bath' with a broad 'a' sound: /bɑːθ/"
  - User repeats
  - AI provides phonetic feedback

### F. Grammar Exercises
- **What**: Fill in blanks or correct sentences
- **Purpose**: Practice grammar rules
- **Example**:
  - AI: "Complete: I haven't ___ that film yet."
  - User: "seen"
  - AI confirms and explains

### G. Idiom Practice
- **What**: Learn and use British idioms
- **Purpose**: Cultural fluency
- **Example**:
  - AI: "Use 'spot on' in a sentence about the weather."
  - User creates sentence
  - AI evaluates usage

---

## 2. Task Generation System

### A. Function Calling
Create a `generate_speaking_task` function that:
- Takes difficulty level as input
- Generates appropriate task based on current learning focus
- Returns task type, instructions, and expected response

### B. Task Progression
- **Beginner**: Simple sentences, basic vocabulary
- **Intermediate**: Complex sentences, idioms, cultural context
- **Advanced**: Nuanced expressions, subtext, perfect RP

### C. Adaptive Difficulty
- Track user performance
- Adjust task difficulty based on success rate
- Focus on areas needing improvement

---

## 3. UI Components

### A. Task Display Panel
```
┌─────────────────────────────────────┐
│ 🎯 Current Task                     │
│                                     │
│ Task Type: Sentence Repetition      │
│ Difficulty: Intermediate            │
│                                     │
│ "Please repeat after me:            │
│  'I'd like a cup of tea, please.'" │
│                                     │
│ [🎤 Listening...]                   │
│                                     │
│ [✓ Complete] [⏭️ Skip] [💡 Hint]   │
└─────────────────────────────────────┘
```

### B. Task Instructions
- Clear instructions for each task
- Examples when needed
- Visual indicators (icons, colors)

### C. Feedback Display
- Immediate feedback after task completion
- Score/rating (if applicable)
- What was correct/incorrect
- Suggestions for improvement

### D. Task History
- List of completed tasks
- Progress indicators
- Areas of strength/weakness

---

## 4. Integration Points

### A. New Learning Mode: "Task Practice"
- Add to LEARNING_MODES
- Dedicated mode for structured exercises
- Can be combined with difficulty levels

### B. Task Mode Toggle
- Switch between:
  - Free conversation
  - Task practice
  - Mixed mode (conversation + tasks)

### C. Progress Tracking
- Tasks completed
- Success rate per task type
- Time spent on tasks
- Improvement over time

---

## 5. Implementation Details

### A. Function Declaration
```javascript
const generateTaskFn = {
  name: 'generate_speaking_task',
  parameters: {
    type: Type.OBJECT,
    properties: {
      task_type: {
        type: Type.STRING,
        enum: ['repetition', 'completion', 'description', 'roleplay', 'pronunciation', 'grammar', 'idiom']
      },
      difficulty: { type: Type.STRING },
      instructions: { type: Type.STRING },
      example_response: { type: Type.STRING },
      focus_area: { type: Type.STRING } // grammar, pronunciation, vocabulary, cultural
    }
  }
}
```

### B. Task State Management
```javascript
const [currentTask, setCurrentTask] = useState(null);
const [taskHistory, setTaskHistory] = useState([]);
const [taskMode, setTaskMode] = useState(false);
const [taskScore, setTaskScore] = useState(0);
```

### C. Task Flow
1. User selects "Task Practice" mode
2. AI generates first task using function call
3. Task displayed to user
4. User speaks response
5. AI evaluates and provides feedback
6. User completes or skips
7. Next task generated
8. Progress tracked

---

## 6. Features to Add

### A. Task Categories Tab
- New tab in UI: "Tasks"
- Browse available task types
- Select specific focus areas
- View task history

### B. Task Settings
- Number of tasks per session
- Task type preferences
- Auto-advance or manual
- Show hints option

### C. Gamification
- Task completion streaks
- Badges for task types mastered
- Daily task goals
- Leaderboard (optional)

### D. Task Library
- Pre-defined tasks for each category
- Difficulty-appropriate tasks
- Cultural context tasks
- Pronunciation-specific drills

---

## 7. User Experience Flow

### Scenario 1: Starting Task Practice
1. User selects "Task Practice" mode
2. Chooses difficulty level
3. AI greets: "Right, let's begin with some structured practice. I'll give you tasks to complete."
4. First task generated and displayed
5. User speaks response
6. AI provides feedback
7. Next task automatically generated

### Scenario 2: During Task
1. Task displayed with clear instructions
2. User clicks "Start" or begins speaking
3. Real-time transcription shown
4. AI listens and evaluates
5. Feedback appears immediately
6. Option to retry or continue

### Scenario 3: Task Completion
1. User completes task
2. AI provides detailed feedback
3. Score/rating shown
4. Next task button appears
5. Progress updated

---

## 8. Technical Implementation Steps

### Step 1: Add Task Mode to Learning Modes
- Update LEARNING_MODES constant
- Add UI toggle

### Step 2: Create Task Generation Function
- Implement function calling
- Add to system instruction
- Handle task generation logic

### Step 3: Build Task UI Components
- Task display panel
- Instructions component
- Feedback component
- Task history component

### Step 4: Implement Task State Management
- Add state variables
- Handle task flow
- Track progress

### Step 5: Add Task Tab
- New tab in main interface
- Task browser
- Task history view

### Step 6: Integrate with Progress Tracking
- Save completed tasks
- Track success rates
- Update dashboard

---

## 9. Example Tasks by Difficulty

### Beginner Tasks
- "Repeat: 'Hello, how are you?'"
- "Complete: 'I would like a...'"
- "Describe: What do you see in a typical British café?"

### Intermediate Tasks
- "Use 'brilliant' in a sentence about the weather"
- "Practice: 'I haven't been to the cinema in ages'"
- "Roleplay: Ordering at a British restaurant"

### Advanced Tasks
- "Explain the subtext: 'That's interesting'"
- "Practice RP: 'The bath is in the glass'"
- "Use three British idioms in one conversation"

---

## 10. Success Metrics

### User Engagement
- Tasks completed per session
- Time spent in task mode
- Return rate to task practice

### Learning Effectiveness
- Improvement in pronunciation scores
- Reduction in errors over time
- Vocabulary acquisition rate

### User Satisfaction
- Task difficulty appropriateness
- Feedback quality ratings
- Overall learning experience

---

## Next Steps

1. ✅ Review and approve plan
2. Implement task generation function
3. Build UI components
4. Add task mode integration
5. Test with different difficulty levels
6. Gather user feedback
7. Iterate and improve

---

## Questions to Consider

- Should tasks be pre-generated or dynamically created?
- How many tasks per session?
- Should users be able to create custom tasks?
- How detailed should feedback be?
- Should there be a timer for tasks?
- Can tasks be saved/favorited?

