# GitHub Secrets Setup Guide

## Quick Setup for Automatic Deployment

### Step 1: Go to GitHub Secrets Page
👉 https://github.com/MuhammadSaljooq/vocco-talk/settings/secrets/actions

### Step 2: Add These Secrets

Click "New repository secret" for each:

#### 1. EC2_HOST
- **Name:** `EC2_HOST`
- **Value:** `54.173.50.236`

#### 2. EC2_USER
- **Name:** `EC2_USER`
- **Value:** `ec2-user`

#### 3. EC2_SSH_KEY
- **Name:** `EC2_SSH_KEY`
- **Value:** Copy entire contents of your `Vocco.pem` file
  ```bash
  # To get the key content, run:
  cat Vocco.pem
  # Copy everything including:
  # -----BEGIN RSA PRIVATE KEY-----
  # ... (all lines) ...
  # -----END RSA PRIVATE KEY-----
  ```

#### 4. VITE_GEMINI_API_KEY (Optional)
- **Name:** `VITE_GEMINI_API_KEY`
- **Value:** Your Gemini API key (if you want it in build)

### Step 3: Test Deployment

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push
   ```
3. Go to Actions tab: https://github.com/MuhammadSaljooq/vocco-talk/actions
4. Watch the deployment run automatically!

### Step 4: Verify

After deployment completes:
- Visit: http://54.173.50.236
- Your app should be live!

---

## Troubleshooting

### If deployment fails:

1. **Check SSH Key:**
   - Make sure EC2_SSH_KEY includes complete key file
   - Should start with `-----BEGIN` and end with `-----END`

2. **Check EC2 Access:**
   - Verify security group allows SSH from GitHub IPs
   - Test SSH manually: `ssh -i Vocco.pem ec2-user@54.173.50.236`

3. **Check GitHub Actions Logs:**
   - Go to Actions tab
   - Click on failed workflow
   - Check error messages

---

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
./deploy-to-ec2.sh
```

This will build and deploy immediately without GitHub.

