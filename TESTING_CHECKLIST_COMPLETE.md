# Complete Testing Checklist - Vocco Talk Platform

## Pre-Testing Setup

- [ ] Install all dependencies: `npm install`
- [ ] Set up `.env.local` with `VITE_GEMINI_API_KEY`
- [ ] Ensure microphone access is available
- [ ] Use Chrome/Edge for best compatibility
- [ ] Clear browser cache and localStorage
- [ ] Test in incognito/private mode for clean state

---

## 1. Voice Input Testing

### Browser Compatibility
- [ ] **Chrome/Edge**: Voice input captures correctly
  - [ ] Microphone permission prompt appears
  - [ ] Audio waveform visualizer shows activity when speaking
  - [ ] "Listening..." indicator appears when speaking
  - [ ] Transcription appears in real-time
  - [ ] Multiple consecutive inputs work correctly

- [ ] **Firefox**: Voice input captures correctly
  - [ ] Microphone permission works
  - [ ] Audio capture functions
  - [ ] Note any limitations or differences

- [ ] **Safari**: Voice input testing
  - [ ] Test microphone access (may have limitations)
  - [ ] Document Web Audio API limitations
  - [ ] Note any compatibility issues

- [ ] **Mobile Browsers**: Voice input on mobile
  - [ ] iOS Safari: Test microphone access
  - [ ] Android Chrome: Test microphone access
  - [ ] Verify responsive UI works correctly
  - [ ] Test touch interactions

### Voice Input Functionality
- [ ] **Microphone Permission**
  - [ ] Permission prompt appears on first use
  - [ ] Granting permission allows voice input
  - [ ] Denying permission shows helpful error message
  - [ ] Error message includes instructions to enable

- [ ] **Audio Capture**
  - [ ] Voice is captured when speaking
  - [ ] Visual feedback shows when listening
  - [ ] Mute button stops audio capture
  - [ ] Unmute resumes audio capture
  - [ ] Audio quality is acceptable

- [ ] **Voice Activity Detection**
  - [ ] "Listening..." indicator appears when user speaks
  - [ ] Indicator disappears when user stops speaking
  - [ ] Visual waveform responds to voice input
  - [ ] Threshold detection works correctly

- [ ] **Error Scenarios**
  - [ ] No microphone connected: Shows appropriate error
  - [ ] Microphone disconnected during session: Handles gracefully
  - [ ] Permission revoked during session: Shows error and stops
  - [ ] Network interruption: Handles reconnection

---

## 2. Gemini API Integration Testing

### API Connection
- [ ] **Connection Establishment**
  - [ ] Connects successfully with valid API key
  - [ ] Shows "Connecting..." state during connection
  - [ ] "Connected" indicator appears when ready
  - [ ] Connection status persists during session

- [ ] **API Key Handling**
  - [ ] Uses API key from Profile settings if set
  - [ ] Falls back to environment variable if no user key
  - [ ] Shows error if no API key available
  - [ ] Error message is clear and actionable

- [ ] **Response Handling**
  - [ ] Receives audio responses from Gemini
  - [ ] Audio plays correctly
  - [ ] Transcription appears for agent responses
  - [ ] Multiple responses in sequence work correctly

### Agent Behavior
- [ ] **Prompt Adherence**
  - [ ] Agent follows system prompt instructions
  - [ ] Personality matches defined tone
  - [ ] Language matches selected language
  - [ ] Behavior matches template (if used)

- [ ] **Custom Prompts**
  - [ ] Custom system prompt is applied correctly
  - [ ] Agent responds according to custom instructions
  - [ ] Complex prompts work correctly
  - [ ] Prompt sanitization doesn't break functionality

- [ ] **Template Testing**
  - [ ] Standard templates work correctly
  - [ ] Premium templates work (if Pro tier)
  - [ ] Template selection applies correct prompt
  - [ ] Custom modifications to templates work

### Error Handling
- [ ] **Invalid API Key**
  - [ ] Shows clear error message
  - [ ] Provides link to update API key
  - [ ] Doesn't crash the application

- [ ] **API Rate Limits**
  - [ ] Shows rate limit error when exceeded
  - [ ] Displays remaining calls and reset time
  - [ ] Prevents further API calls when limit reached

- [ ] **Network Errors**
  - [ ] Handles connection timeouts gracefully
  - [ ] Shows retry option
  - [ ] Recovers when connection restored

- [ ] **API Errors**
  - [ ] Handles 400/401/403/429 errors
  - [ ] Shows user-friendly error messages
  - [ ] Provides troubleshooting guidance

---

## 3. Text-to-Speech Testing

### Audio Output
- [ ] **Audio Playback**
  - [ ] Agent responses play as audio
  - [ ] Audio quality is clear and natural
  - [ ] Volume is appropriate
  - [ ] No audio distortion or clipping

- [ ] **Visual Feedback**
  - [ ] "Speaking..." indicator appears during playback
  - [ ] Waveform visualizer shows audio activity
  - [ ] Visual feedback matches audio playback

- [ ] **Interruption Handling**
  - [ ] User can interrupt agent mid-speech
  - [ ] Audio stops when user starts speaking
  - [ ] No audio overlap or conflicts

- [ ] **Multiple Responses**
  - [ ] Sequential responses play correctly
  - [ ] No audio gaps or overlaps
  - [ ] Smooth transitions between responses

### Voice Customization
- [ ] **Voice Selection** (Pro tier)
  - [ ] Different voices work correctly
  - [ ] Voice settings apply to new sessions
  - [ ] Voice persists across sessions

- [ ] **Speaking Speed** (Pro tier)
  - [ ] Speed adjustment works
  - [ ] Range 0.5x to 2.0x functions correctly
  - [ ] Changes apply to new responses

- [ ] **Pitch Adjustment** (Pro tier)
  - [ ] Pitch changes work
  - [ ] Range -20 to +20 functions correctly
  - [ ] Changes apply to new responses

---

## 4. Error Handling Testing

### User-Friendly Messages
- [ ] **Microphone Errors**
  - [ ] "Microphone access denied" - Clear message
  - [ ] "No microphone found" - Helpful guidance
  - [ ] Instructions on how to enable microphone

- [ ] **API Errors**
  - [ ] "API key not set" - Clear instructions
  - [ ] "Invalid API key" - Link to update
  - [ ] "Rate limit exceeded" - Shows limits and reset time
  - [ ] "Usage limit exceeded" - Upgrade prompt

- [ ] **Network Errors**
  - [ ] "Connection failed" - Retry option
  - [ ] "Network error" - Helpful message
  - [ ] Graceful degradation

- [ ] **Form Validation**
  - [ ] Empty fields show errors
  - [ ] Invalid input shows specific errors
  - [ ] Errors clear when user fixes input
  - [ ] Submit disabled when errors exist

### Error Recovery
- [ ] **Session Recovery**
  - [ ] Can retry after error
  - [ ] State resets correctly
  - [ ] No memory leaks after errors

- [ ] **Data Persistence**
  - [ ] Form data persists on error
  - [ ] User doesn't lose work
  - [ ] Can correct and resubmit

---

## 5. Rate Limiting Testing

### API Call Limits
- [ ] **Per-Minute Limits**
  - [ ] 30 calls/minute limit enforced
  - [ ] Counter resets after 1 minute
  - [ ] Error shows when limit reached
  - [ ] Shows remaining calls

- [ ] **Per-Hour Limits**
  - [ ] Voice sessions: 10/hour limit
  - [ ] Agent creations: 20/hour limit
  - [ ] Limits reset correctly
  - [ ] Error messages are clear

### Usage Tracking
- [ ] **Monthly Limits**
  - [ ] API calls tracked correctly
  - [ ] Voice minutes tracked correctly
  - [ ] Limits enforced per subscription tier
  - [ ] Usage resets monthly

- [ ] **Limit Enforcement**
  - [ ] Prevents actions when limit exceeded
  - [ ] Shows upgrade prompt
  - [ ] Links to pricing page

---

## 6. Dashboard Testing

### Usage Metrics
- [ ] **Accuracy**
  - [ ] Total agents count is correct
  - [ ] Total conversations count is accurate
  - [ ] Total API calls matches actual usage
  - [ ] Total voice minutes is accurate

- [ ] **Real-Time Updates**
  - [ ] Metrics update after creating agent
  - [ ] Metrics update after voice session
  - [ ] Metrics update after deleting agent
  - [ ] No lag or delay in updates

### Agent Management
- [ ] **Agent List**
  - [ ] All agents displayed correctly
  - [ ] Agent cards show correct information
  - [ ] Stats per agent are accurate
  - [ ] Filtering works (All, Recent, Popular)

- [ ] **Agent Actions**
  - [ ] Test button opens runtime modal
  - [ ] Edit button loads agent data correctly
  - [ ] Delete removes agent and updates stats
  - [ ] Share generates correct link/embed code

---

## 7. Mobile Device Testing

### Responsive Design
- [ ] **Layout**
  - [ ] Dashboard adapts to mobile screen
  - [ ] Forms are usable on mobile
  - [ ] Buttons are appropriately sized
  - [ ] Text is readable

- [ ] **Voice Interaction**
  - [ ] Microphone access works on mobile
  - [ ] Voice input captures correctly
  - [ ] Audio playback works
  - [ ] Visual feedback is visible

- [ ] **Touch Interactions**
  - [ ] Buttons are tappable
  - [ ] Forms are easy to fill
  - [ ] Scrolling works smoothly
  - [ ] Modals are accessible

### Mobile-Specific
- [ ] **iOS Safari**
  - [ ] Microphone permission works
  - [ ] Audio playback works
  - [ ] UI renders correctly
  - [ ] Performance is acceptable

- [ ] **Android Chrome**
  - [ ] Microphone permission works
  - [ ] Audio playback works
  - [ ] UI renders correctly
  - [ ] Performance is acceptable

---

## 8. Subscription & Monetization Testing

### Subscription Tiers
- [ ] **Free Tier**
  - [ ] Default tier assigned correctly
  - [ ] Limits enforced (3 agents, 1000 API calls, 60 minutes)
  - [ ] Premium features blocked
  - [ ] Upgrade prompts appear when needed

- [ ] **Pro Tier**
  - [ ] Upgrade to Pro works
  - [ ] Premium templates accessible
  - [ ] Custom voice options available
  - [ ] Higher limits apply (20 agents, 10000 calls, 600 minutes)

- [ ] **Enterprise Tier**
  - [ ] Unlimited agents work
  - [ ] All features accessible
  - [ ] High limits apply

### Usage Tracking
- [ ] **Monthly Usage**
  - [ ] API calls tracked per month
  - [ ] Voice minutes tracked per month
  - [ ] Usage resets monthly
  - [ ] Usage displays correctly in dashboard

- [ ] **Limit Enforcement**
  - [ ] Cannot create agent when limit reached
  - [ ] Cannot start session when limit reached
  - [ ] Clear error messages
  - [ ] Upgrade prompts appear

### Premium Features
- [ ] **Premium Templates**
  - [ ] Only accessible in Pro+
  - [ ] Error shown for Free tier
  - [ ] Templates work correctly when accessible

- [ ] **Custom Voice**
  - [ ] Only accessible in Pro+
  - [ ] Settings apply correctly
  - [ ] Changes persist

---

## 9. Security Testing

### Data Protection
- [ ] **API Key Encryption**
  - [ ] API keys encrypted in storage
  - [ ] Keys not visible in localStorage (encoded)
  - [ ] Decryption works correctly

- [ ] **User Data Isolation**
  - [ ] Users can only see their own agents
  - [ ] Users can only access their own data
  - [ ] No cross-user data leakage

### Input Validation
- [ ] **Prompt Sanitization**
  - [ ] Injection attempts blocked
  - [ ] Suspicious patterns removed
  - [ ] Valid prompts still work
  - [ ] Length limits enforced

- [ ] **Form Validation**
  - [ ] Required fields enforced
  - [ ] Length limits enforced
  - [ ] Invalid input rejected
  - [ ] Error messages are clear

---

## 10. Performance Testing

### Load Testing
- [ ] **Multiple Agents**
  - [ ] Dashboard loads quickly with 20+ agents
  - [ ] Filtering works with many agents
  - [ ] No performance degradation

- [ ] **Long Sessions**
  - [ ] Voice sessions work for extended periods
  - [ ] No memory leaks
  - [ ] Performance remains stable

- [ ] **Large Conversations**
  - [ ] History loads quickly
  - [ ] Scrolling is smooth
  - [ ] No lag with many messages

### Memory Management
- [ ] **Memory Leaks**
  - [ ] No leaks after multiple sessions
  - [ ] Memory usage stable
  - [ ] Cleanup works correctly

- [ ] **Resource Cleanup**
  - [ ] Audio contexts closed properly
  - [ ] Streams stopped correctly
  - [ ] No lingering connections

---

## 11. Integration Testing

### Complete User Flows
- [ ] **New User Flow**
  1. Sign up → Account created
  2. Consent modal → Preferences saved
  3. Create agent → Agent saved
  4. Test agent → Conversation works
  5. View dashboard → Stats accurate
  6. View profile → Settings accessible

- [ ] **Existing User Flow**
  1. Login → Session restored
  2. View dashboard → Agents displayed
  3. Test agent → Works correctly
  4. Edit agent → Changes saved
  5. View history → Conversations shown

- [ ] **Upgrade Flow**
  1. View pricing → Plans displayed
  2. Upgrade to Pro → Subscription updated
  3. Access premium features → Works
  4. Usage limits → Updated correctly

---

## 12. Edge Cases

### Boundary Conditions
- [ ] **Maximum Limits**
  - [ ] Create max agents → Last one works
  - [ ] Reach API limit → Error shown
  - [ ] Reach voice limit → Error shown

- [ ] **Empty States**
  - [ ] No agents → Empty state shown
  - [ ] No conversations → Empty state shown
  - [ ] No templates → Handles gracefully

- [ ] **Concurrent Actions**
  - [ ] Multiple tabs → No conflicts
  - [ ] Rapid clicks → Handles correctly
  - [ ] Multiple sessions → Isolated correctly

### Data Edge Cases
- [ ] **Very Long Prompts**
  - [ ] 10,000 character prompt → Works
  - [ ] Validation prevents overflow
  - [ ] Display handles long text

- [ ] **Special Characters**
  - [ ] Unicode characters work
  - [ ] Emojis work
  - [ ] Special symbols handled

---

## Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________
OS: ___________
Device: ___________

Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Critical Issues:
1. 
2. 
3. 

Minor Issues:
1. 
2. 
3. 

Notes:
[Add specific observations and issues]
```

---

## Priority Levels

**P0 - Critical (Must Fix Before Launch)**
- Voice input capture
- Gemini API integration
- Agent behavior matching prompts
- Error handling
- Data security

**P1 - High (Should Fix Soon)**
- Rate limiting
- Usage tracking accuracy
- Mobile compatibility
- Performance issues

**P2 - Medium (Nice to Have)**
- UI polish
- Additional features
- Edge case handling

**P3 - Low (Future Enhancements)**
- Advanced customization
- Additional templates
- Analytics improvements

---

## Automated Testing Recommendations

### Unit Tests
- [ ] Encryption/decryption functions
- [ ] Rate limiting logic
- [ ] Prompt sanitization
- [ ] Usage tracking calculations

### Integration Tests
- [ ] API key management
- [ ] Agent creation flow
- [ ] Conversation saving
- [ ] Subscription management

### E2E Tests
- [ ] Complete user registration flow
- [ ] Agent creation and testing
- [ ] Dashboard interactions
- [ ] Subscription upgrade flow

---

**Testing Status:** Ready for comprehensive testing

**Next Steps:** 
1. Run through checklist systematically
2. Document all issues found
3. Prioritize fixes
4. Re-test after fixes
5. Deploy to staging
6. Final QA before production

