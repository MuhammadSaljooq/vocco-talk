# Development Notes & Best Practices

## Environment Variables

**Always use environment variables for API keys**

### Setup
1. Create `.env.local` file in project root:
```bash
VITE_GEMINI_API_KEY=your_api_key_here
VITE_ENCRYPTION_KEY=your_encryption_key_here
```

2. Never commit `.env.local` to version control
3. Use `import.meta.env.VITE_GEMINI_API_KEY` to access in code
4. Users can also set API keys in Profile settings (stored encrypted)

### Security
- API keys are encrypted using XOR cipher (demo mode)
- In production, use AES-256 encryption
- Keys are never exposed in client-side code
- Environment variables are only available at build time

---

## Error Boundaries & Fallback UI

**Implemented comprehensive error handling**

### ErrorBoundary Component
- Catches React component errors
- Shows user-friendly error messages
- Displays error details in development mode
- Provides recovery options (Try Again, Go Home)

### Usage
```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Fallback UI Components
- `LoadingSpinner` - For loading states
- `EmptyState` - For empty data states
- `ErrorMessage` - For error messages with retry
- `OfflineIndicator` - Shows when user is offline
- `ApiKeyWarning` - Warns when API key is missing

---

## Prompt Testing & Complexity

**Test with various prompt complexities**

### Prompt Tester Component
- Analyzes prompt complexity (word count, tokens, structure)
- Validates prompt quality
- Suggests improvements
- Generates test variations (Simple, Moderate, Complex, Full)

### Usage
```jsx
<PromptTester 
  prompt={systemPrompt}
  onSelectTest={(testPrompt) => setSystemPrompt(testPrompt)}
/>
```

### Prompt Analysis Functions
- `analyzePromptComplexity()` - Get complexity metrics
- `validatePromptQuality()` - Check for issues and suggestions
- `generateComplexityTests()` - Create test variations
- `comparePrompts()` - Compare two prompts

### Best Practices
- Test prompts with 50-1000 words
- Include personality traits, responsibilities, examples
- Use paragraph breaks for organization
- Avoid generic AI language
- Keep prompts under 5000 characters for best performance

---

## API Cost Monitoring

**Monitor Gemini API costs during development**

### Cost Tracking
- Automatically tracks API calls and voice minutes
- Calculates estimated costs based on usage
- Stores daily, monthly, and total costs
- Shows cost breakdown in Profile > Costs tab

### Pricing Reference
- API Call: $0.0001 per call
- Voice Minute: $0.01 per minute
- Input Tokens: $0.000000125 per 1K tokens
- Output Tokens: $0.0000005 per 1K tokens

### Usage
```javascript
import { recordCost, getTodayCost, getMonthCost } from '../utils/costTracker';

// Record usage
recordCost({ apiCalls: 1, voiceMinutes: 0.5 });

// Get costs
const today = getTodayCost();
const month = getMonthCost();
```

### Development Mode
- Costs are logged to console in development
- Daily cost limit checking available
- Reset function for testing

---

## Agent Prompt Versioning

**Version control for agent prompts**

### Features
- Automatic version tracking when prompts change
- Version history (last 10 versions per agent)
- Restore previous versions
- Compare versions
- Version statistics

### Usage
```javascript
import { 
  savePromptVersion, 
  getPromptVersions, 
  restoreVersion,
  compareVersions 
} from '../utils/promptVersioning';

// Automatically saved when agent is created/updated
// Manual version save
savePromptVersion(agentId, prompt, {
  reason: 'Improved personality',
  notes: 'Added more examples'
});

// Get versions
const versions = getPromptVersions(agentId);

// Restore version
restoreVersion(agentId, 2);

// Compare versions
compareVersions(agentId, 1, 2);
```

### Version Metadata
- Version number
- Prompt content
- Creation timestamp
- Reason for change
- Notes
- Changed by (user ID)

---

## Testing Checklist

### Voice Input
- [ ] Test across browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Verify microphone permissions
- [ ] Test error handling (no mic, denied permission)

### API Integration
- [ ] Test with valid API key
- [ ] Test with invalid API key
- [ ] Test rate limiting
- [ ] Test usage limits
- [ ] Monitor costs during testing

### Prompt Complexity
- [ ] Test simple prompts (50-100 words)
- [ ] Test moderate prompts (100-200 words)
- [ ] Test complex prompts (200-500 words)
- [ ] Test very complex prompts (500+ words)
- [ ] Verify prompt versioning works

### Error Handling
- [ ] Test error boundaries
- [ ] Test network errors
- [ ] Test API errors
- [ ] Test form validation
- [ ] Verify fallback UI displays correctly

---

## Performance Considerations

### Memory Management
- Clean up audio contexts on unmount
- Stop media streams properly
- Clear animation frames
- Remove event listeners

### API Usage
- Implement rate limiting
- Track usage to prevent overages
- Monitor costs
- Cache responses when possible

### Optimization
- Lazy load components
- Minimize re-renders
- Use React.memo for expensive components
- Debounce user input

---

## Security Best Practices

### Data Protection
- Encrypt sensitive data (API keys, passwords)
- Never expose API keys in client code
- Validate and sanitize user input
- Implement prompt sanitization

### Authentication
- User-specific data isolation
- Session management
- Secure logout
- Privacy controls

### Input Validation
- Validate prompts for injection attempts
- Sanitize user input
- Enforce length limits
- Check for malicious patterns

---

## Deployment Checklist

### Pre-Deployment
- [ ] Set up environment variables
- [ ] Test all features
- [ ] Verify error handling
- [ ] Check cost tracking
- [ ] Review security measures

### Production Considerations
- [ ] Use production-grade encryption (AES-256)
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Implement proper rate limiting on backend
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Set up CDN for static assets

### Post-Deployment
- [ ] Monitor error rates
- [ ] Track API costs
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Review analytics

---

## Future Improvements

### Prompt Versioning
- Visual diff viewer
- A/B testing capabilities
- Performance metrics per version
- Rollback with one click

### Cost Monitoring
- Cost alerts
- Budget limits
- Cost projections
- Detailed breakdowns

### Testing Tools
- Automated prompt testing
- Performance benchmarking
- Cost estimation before creation
- Prompt quality scoring

### Error Handling
- Sentry integration
- Error analytics
- User error reporting
- Automatic error recovery

---

## Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

