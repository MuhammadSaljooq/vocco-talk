# Deployment Guide - Vocco Talk

## Pre-Deployment Checklist

- [ ] All features tested (see TESTING_CHECKLIST.md)
- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] Production API keys secured
- [ ] HTTPS configured
- [ ] Error monitoring set up

## Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.production` or set in hosting platform:
```env
VITE_GEMINI_API_KEY=your_production_api_key_here
```

**Note:** Users can also set their own API keys in Profile settings, so this is optional.

### 3. Build for Production
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### 4. Test Production Build Locally
```bash
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `VITE_GEMINI_API_KEY` (optional, users can set their own)

4. **Configure:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

**Advantages:**
- Automatic HTTPS
- Global CDN
- Easy environment variable management
- Automatic deployments from Git

### Option 2: Netlify

1. **Connect Repository:**
   - Go to Netlify Dashboard
   - Add new site from Git
   - Connect GitHub/GitLab/Bitbucket

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Framework: Vite

3. **Environment Variables:**
   - Site settings → Environment variables
   - Add `VITE_GEMINI_API_KEY`

4. **Deploy:**
   - Push to main branch triggers deployment
   - Or use Netlify CLI: `netlify deploy --prod`

**Advantages:**
- Free SSL certificate
- Continuous deployment
- Form handling (if needed)
- Split testing

### Option 3: AWS S3 + CloudFront

1. **Build:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront:**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Enable HTTPS
   - Configure caching

4. **Set Environment Variables:**
   - Use AWS Systems Manager Parameter Store
   - Or inject at build time

**Advantages:**
- Scalable
- Global CDN
- Cost-effective for high traffic
- Full control

### Option 4: Traditional Hosting

1. **Build:**
   ```bash
   npm run build
   ```

2. **Upload Files:**
   - Upload contents of `dist/` folder to web server
   - Ensure `.htaccess` or server config handles SPA routing

3. **Server Configuration:**
   ```apache
   # .htaccess for Apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

   ```nginx
   # nginx.conf
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

4. **HTTPS Setup:**
   - Install SSL certificate (Let's Encrypt recommended)
   - Configure HTTPS redirect

## Environment Variables

### Required (Optional)
- `VITE_GEMINI_API_KEY` - Google Gemini API key (users can set their own)

### Development
- `.env.local` - Local development (gitignored)

### Production
- Set in hosting platform environment variables
- Or users configure in Profile settings

## Important Notes

### HTTPS Required
- Microphone access requires HTTPS in production
- Ensure SSL certificate is valid
- Redirect HTTP to HTTPS

### Browser Compatibility
- **Chrome/Edge:** Full support ✅
- **Firefox:** Full support ✅
- **Safari:** Limited Web Audio API support ⚠️
- **Mobile:** Works but may have limitations ⚠️

### API Key Management
- Users can set their own API keys in Profile settings
- Platform API key is optional (for demo purposes)
- In production, consider backend proxy for API keys

### Data Storage
- Current: localStorage (client-side only)
- Production: Migrate to backend database
- Consider data migration strategy

## Post-Deployment

### 1. Verify Deployment
- [ ] Site loads correctly
- [ ] HTTPS working
- [ ] All routes accessible
- [ ] Voice features work
- [ ] API key can be set

### 2. Monitor
- Set up error tracking (Sentry, LogRocket)
- Monitor API usage
- Track user signups
- Monitor performance

### 3. Analytics
- Set up Google Analytics
- Track key events:
  - User signups
  - Agent creations
  - Voice sessions
  - API usage

### 4. Backup Strategy
- Regular database backups (when migrated)
- Version control for code
- Environment variable backups

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Runtime Errors
- Check browser console
- Verify API key is set
- Check network requests
- Verify HTTPS is enabled

### Audio Issues
- Ensure HTTPS is enabled
- Check microphone permissions
- Verify browser compatibility
- Check API key validity

## Scaling Considerations

### Current Limitations
- localStorage (5-10MB limit)
- No backend (all client-side)
- No rate limiting
- No user authentication server-side

### Future Improvements
- Backend API for data storage
- Database for scalability
- Rate limiting
- Caching strategy
- CDN for static assets
- Load balancing

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys encrypted (in production)
- [ ] Input validation
- [ ] XSS protection
- [ ] CORS configured
- [ ] Rate limiting (future)
- [ ] Authentication secure (future)

## Support

For deployment issues:
1. Check build logs
2. Verify environment variables
3. Test locally first
4. Check hosting platform docs
5. Review browser console errors

---

**Ready for Deployment:** ✅ Yes (with noted limitations)

**Recommended Platform:** Vercel or Netlify for easiest deployment

