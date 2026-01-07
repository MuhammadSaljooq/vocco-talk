# Testing Checklist - Vocco Talk Platform

## Pre-Testing Setup

- [ ] Install all dependencies: `npm install`
- [ ] Set up `.env.local` with `VITE_GEMINI_API_KEY`
- [ ] Ensure microphone access is available
- [ ] Use Chrome/Edge for best compatibility

## 1. Authentication Testing

### User Registration
- [ ] Navigate to homepage
- [ ] Click "Sign up" button
- [ ] Fill in name, email, password
- [ ] Submit form
- [ ] Verify account created
- [ ] Verify redirected to dashboard

### User Login
- [ ] Click "Log in" button
- [ ] Enter email and password
- [ ] Submit form
- [ ] Verify successful login
- [ ] Verify user info in header

### Error Cases
- [ ] Try registering with existing email (should show error)
- [ ] Try logging in with wrong password (should show error)
- [ ] Try logging in with non-existent email (should show error)
- [ ] Try submitting empty form (should show validation errors)

## 2. Agent Creation Testing

### Create Agent from Template
- [ ] Navigate to Create Agent page
- [ ] Click "Browse Templates"
- [ ] Select a template (e.g., Customer Support)
- [ ] Verify form auto-fills with template data
- [ ] Enter agent name
- [ ] Click "Create & Test Agent"
- [ ] Verify agent created
- [ ] Verify runtime appears

### Create Custom Agent
- [ ] Navigate to Create Agent page
- [ ] Enter agent name
- [ ] Write custom system prompt (min 50 chars)
- [ ] Select language
- [ ] Select tone
- [ ] Click "Create & Test Agent"
- [ ] Verify agent created

### Form Validation
- [ ] Try submitting without agent name (should show error)
- [ ] Try submitting with short name (< 3 chars) (should show error)
- [ ] Try submitting without system prompt (should show error)
- [ ] Try submitting with short prompt (< 50 chars) (should show error)

## 3. Voice Interaction Testing

### Start Voice Session
- [ ] Create or select an agent
- [ ] Click "Start Voice Session"
- [ ] Grant microphone permission
- [ ] Verify connection status shows "Connected"
- [ ] Verify visualizer appears

### Voice Input
- [ ] Speak into microphone
- [ ] Verify "Listening..." indicator appears
- [ ] Verify transcription appears in conversation log
- [ ] Verify agent responds with audio

### Voice Output
- [ ] Wait for agent response
- [ ] Verify "Speaking..." indicator appears
- [ ] Verify audio plays
- [ ] Verify transcription appears

### Controls
- [ ] Click mute button
- [ ] Verify microphone muted
- [ ] Verify mute indicator shows
- [ ] Click unmute
- [ ] Verify microphone active again
- [ ] Click "End Session"
- [ ] Verify session ends
- [ ] Verify conversation saved (if privacy allows)

### Error Scenarios
- [ ] Deny microphone permission (should show error)
- [ ] Disconnect internet during session (should handle gracefully)
- [ ] Use invalid API key (should show error)
- [ ] Test with no API key set (should show error)

## 4. Dashboard Testing

### View Agents
- [ ] Navigate to Dashboard
- [ ] Verify all created agents appear
- [ ] Verify agent cards show correct information
- [ ] Verify stats are displayed

### Filter Agents
- [ ] Click "All" filter (should show all agents)
- [ ] Click "Recent" filter (should sort by date)
- [ ] Click "Popular" filter (should sort by conversations)

### Test Agent from Dashboard
- [ ] Click "Test" button on agent card
- [ ] Verify runtime modal opens
- [ ] Test voice interaction
- [ ] Close modal

### Edit Agent
- [ ] Click "Edit" button on agent card
- [ ] Verify CreateAgent page opens with agent data
- [ ] Modify agent name or prompt
- [ ] Click "Save Changes"
- [ ] Verify changes saved
- [ ] Verify redirected to dashboard

### Delete Agent
- [ ] Click "Delete" button on agent card
- [ ] Confirm deletion
- [ ] Verify agent removed from list
- [ ] Verify stats updated

### Share Agent
- [ ] Click "Share" button
- [ ] Verify share modal opens
- [ ] Click "Share Link" tab
- [ ] Click "Copy" button
- [ ] Verify link copied to clipboard
- [ ] Click "Embed Code" tab
- [ ] Click "Copy" button
- [ ] Verify embed code copied

## 5. Profile & Settings Testing

### View Profile
- [ ] Navigate to Profile page
- [ ] Verify user information displayed
- [ ] Verify tabs available (Profile, API Keys, Conversations, Privacy)

### Update Profile
- [ ] Edit name field
- [ ] Click "Save Changes"
- [ ] Verify name updated
- [ ] Verify success message shown

### API Key Management
- [ ] Navigate to API Keys tab
- [ ] Enter API key
- [ ] Click "Save API Key"
- [ ] Verify key saved
- [ ] Verify key masked in display
- [ ] Toggle visibility
- [ ] Verify key shown/hidden

### Conversation History
- [ ] Navigate to Conversations tab
- [ ] Verify past conversations listed
- [ ] Click on conversation
- [ ] Verify messages displayed
- [ ] Delete a conversation
- [ ] Verify conversation removed

### Privacy Settings
- [ ] Navigate to Privacy tab
- [ ] Change privacy level to "Maximum"
- [ ] Verify setting saved
- [ ] Create new conversation
- [ ] Verify conversation NOT saved
- [ ] Change back to "Standard"
- [ ] Create new conversation
- [ ] Verify conversation saved

## 6. Analytics Testing

### Usage Statistics
- [ ] Navigate to Dashboard
- [ ] Verify total agents count correct
- [ ] Verify total conversations count correct
- [ ] Verify total API calls count correct
- [ ] Verify total voice minutes correct

### Per-Agent Stats
- [ ] View agent card
- [ ] Verify conversations count
- [ ] Verify API calls count
- [ ] Verify voice minutes
- [ ] Test agent
- [ ] Verify stats update after session

## 7. Browser Compatibility

### Chrome/Edge
- [ ] Test all features
- [ ] Verify audio works
- [ ] Verify microphone access

### Firefox
- [ ] Test basic functionality
- [ ] Verify audio works
- [ ] Note any limitations

### Safari
- [ ] Test basic functionality
- [ ] Note Web Audio API limitations
- [ ] Document known issues

### Mobile
- [ ] Test on mobile browser
- [ ] Verify responsive design
- [ ] Test voice interaction
- [ ] Note any limitations

## 8. Performance Testing

### Large Data Sets
- [ ] Create 20+ agents
- [ ] Verify dashboard loads quickly
- [ ] Verify filtering works
- [ ] Create 50+ conversations
- [ ] Verify history loads quickly

### Memory Leaks
- [ ] Start multiple voice sessions
- [ ] End sessions
- [ ] Check browser memory usage
- [ ] Verify no memory leaks

### Audio Latency
- [ ] Measure response time
- [ ] Verify < 500ms latency
- [ ] Test with slow connection
- [ ] Verify graceful degradation

## 9. Error Handling

### Network Errors
- [ ] Disconnect internet
- [ ] Try to start voice session
- [ ] Verify error message shown
- [ ] Reconnect internet
- [ ] Verify recovery works

### API Errors
- [ ] Use invalid API key
- [ ] Verify error message shown
- [ ] Use expired API key
- [ ] Verify error handling

### Permission Errors
- [ ] Deny microphone permission
- [ ] Verify error message shown
- [ ] Verify instructions provided

## 10. Security Testing

### Data Isolation
- [ ] Create account A
- [ ] Create agents in account A
- [ ] Logout
- [ ] Create account B
- [ ] Verify account B cannot see account A's agents

### API Key Security
- [ ] Save API key
- [ ] Verify key not visible in localStorage (encoded)
- [ ] Verify key not exposed in network requests

### Input Validation
- [ ] Try XSS in agent name
- [ ] Try SQL injection in prompts
- [ ] Verify inputs sanitized

## 11. User Experience

### Navigation
- [ ] Verify all links work
- [ ] Verify back button works
- [ ] Verify breadcrumbs (if any)

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify layout adapts

### Loading States
- [ ] Verify loading indicators shown
- [ ] Verify smooth transitions
- [ ] Verify no flash of unstyled content

## 12. Integration Testing

### Complete User Flow
- [ ] Sign up
- [ ] Create agent
- [ ] Test agent with voice
- [ ] View conversation history
- [ ] Edit agent
- [ ] Share agent
- [ ] Delete agent
- [ ] Logout

### Multi-Agent Flow
- [ ] Create multiple agents
- [ ] Test each agent
- [ ] Verify stats aggregate correctly
- [ ] Delete multiple agents

## Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________
OS: ___________

Passed: ___/___
Failed: ___/___
Notes: 

[Add specific issues found]
```

## Known Issues to Document

- Safari Web Audio API limitations
- Mobile browser microphone access differences
- Large conversation history performance
- Network disconnection handling

---

**Testing Priority:**
1. Critical: Authentication, Agent Creation, Voice Interaction
2. High: Dashboard, Profile, Analytics
3. Medium: Sharing, Filtering, Error Handling
4. Low: Browser Compatibility, Performance

