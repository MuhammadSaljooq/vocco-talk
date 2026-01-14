# Automatic Deployment Guide - EC2

This guide shows you how to set up automatic deployment so your app updates on EC2 whenever you make changes.

## 🎯 Deployment Options

### Option 1: GitHub Actions (Recommended - Fully Automatic)

**Best for:** Automatic deployment on every Git push

#### Setup Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/vocco-talk.git
   git push -u origin main
   ```

2. **Add GitHub Secrets**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `EC2_HOST`: `54.173.50.236`
     - `EC2_USER`: `ec2-user`
     - `EC2_SSH_KEY`: Contents of your `Vocco.pem` file (copy entire content)
     - `VITE_GEMINI_API_KEY`: Your Gemini API key (optional)

3. **Enable GitHub Actions**
   - The workflow file is already created at `.github/workflows/deploy-ec2.yml`
   - Push to `main` branch to trigger deployment
   - Or manually trigger from Actions tab

#### How it works:
- Every push to `main` branch → Automatically builds → Deploys to EC2
- Manual trigger available from GitHub Actions tab

---

### Option 2: Local Deployment Script (Semi-Automatic)

**Best for:** Quick manual deployments

#### Setup:

1. **Make script executable:**
   ```bash
   chmod +x deploy-to-ec2.sh
   ```

2. **Update configuration in script:**
   ```bash
   EC2_HOST="54.173.50.236"
   EC2_USER="ec2-user"
   EC2_KEY="Vocco.pem"  # Path to your key file
   ```

3. **Deploy:**
   ```bash
   ./deploy-to-ec2.sh
   ```

#### How it works:
- Run script → Builds app → Uploads to EC2 → Restarts server
- Takes ~30 seconds per deployment

---

### Option 3: Git-Based Deployment on EC2

**Best for:** Pulling updates directly on EC2

#### Setup on EC2:

1. **SSH into EC2:**
   ```bash
   ssh -i Vocco.pem ec2-user@54.173.50.236
   ```

2. **Install Git and Node.js:**
   ```bash
   sudo yum update -y
   sudo yum install git -y
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

3. **Clone your repository:**
   ```bash
   cd /opt
   sudo git clone https://github.com/yourusername/vocco-talk.git
   cd vocco-talk
   ```

4. **Set up update script:**
   ```bash
   sudo cp ec2-update-script.sh /usr/local/bin/update-app
   sudo chmod +x /usr/local/bin/update-app
   ```

5. **Update manually:**
   ```bash
   sudo /usr/local/bin/update-app
   ```

#### Auto-update with Cron (Optional):

```bash
# Edit crontab
sudo crontab -e

# Add this line to check for updates every hour
0 * * * * cd /opt/vocco-talk && git pull && /usr/local/bin/update-app
```

---

### Option 4: Webhook-Based Deployment

**Best for:** Custom CI/CD integration

#### Setup:

1. **Create webhook endpoint on EC2** (requires Node.js backend)
2. **Configure GitHub webhook** to call EC2 endpoint
3. **On webhook trigger:** Pull latest code and deploy

---

## 🚀 Quick Start (Recommended: GitHub Actions)

### Step 1: Initialize Git Repository

```bash
cd "/Users/shireenafzal/vocco talk final "
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `vocco-talk`
3. Don't initialize with README

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/yourusername/vocco-talk.git
git branch -M main
git push -u origin main
```

### Step 4: Configure GitHub Secrets

1. Go to: `https://github.com/yourusername/vocco-talk/settings/secrets/actions`
2. Click "New repository secret"
3. Add these secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `EC2_HOST` | `54.173.50.236` | Your EC2 public IP |
| `EC2_USER` | `ec2-user` | EC2 username |
| `EC2_SSH_KEY` | `[Contents of Vocco.pem]` | Your private key |
| `VITE_GEMINI_API_KEY` | `[Your API key]` | Optional |

**To get EC2_SSH_KEY:**
```bash
cat Vocco.pem
# Copy entire output including -----BEGIN and -----END lines
```

### Step 5: Test Deployment

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push
   ```
3. Go to GitHub → Actions tab
4. Watch the deployment run automatically!

---

## 📋 Deployment Workflow Comparison

| Method | Automation | Setup Time | Best For |
|--------|-----------|------------|----------|
| **GitHub Actions** | ✅ Fully Automatic | 10 min | Production |
| **Local Script** | ⚠️ Manual | 2 min | Quick updates |
| **Git on EC2** | ⚠️ Manual/Cron | 15 min | Simple setups |
| **Webhook** | ✅ Automatic | 30 min | Custom needs |

---

## 🔧 Manual Deployment (One-Time Setup)

If you prefer manual control:

```bash
# 1. Build locally
npm run build

# 2. Upload to EC2
scp -i Vocco.pem -r dist/* ec2-user@54.173.50.236:/usr/share/nginx/html/

# 3. Set permissions (SSH into EC2 first)
ssh -i Vocco.pem ec2-user@54.173.50.236
sudo chown -R nginx:nginx /usr/share/nginx/html
sudo chmod -R 755 /usr/share/nginx/html
sudo systemctl restart nginx
```

---

## 🎯 Recommended Setup

**For automatic updates, use GitHub Actions:**

1. ✅ Push code to GitHub
2. ✅ Configure GitHub Secrets (one-time)
3. ✅ Every `git push` → Auto-deploys to EC2
4. ✅ Check deployment status in GitHub Actions

**Benefits:**
- ✅ Fully automatic
- ✅ Deployment history
- ✅ Rollback capability
- ✅ Team collaboration
- ✅ No manual steps needed

---

## 🔍 Troubleshooting

### GitHub Actions Fails

**SSH Connection Issues:**
- Verify `EC2_SSH_KEY` secret contains complete key file
- Check `EC2_HOST` and `EC2_USER` are correct
- Ensure security group allows SSH from GitHub IPs

**Permission Issues:**
- Verify key file has correct permissions (600)
- Check EC2 user has sudo access

### Manual Script Fails

**Connection Issues:**
- Verify key file path is correct
- Check EC2 instance is running
- Test SSH manually: `ssh -i Vocco.pem ec2-user@54.173.50.236`

**Build Issues:**
- Ensure Node.js is installed locally
- Check `npm run build` works locally first

---

## 📝 Next Steps

1. **Choose your deployment method** (GitHub Actions recommended)
2. **Set up GitHub repository** and push your code
3. **Configure secrets** in GitHub
4. **Make a test change** and push to trigger deployment
5. **Verify** your app is live at http://54.173.50.236

---

## 🎉 Success!

Once set up, your workflow will be:
1. Make changes to your code
2. `git add . && git commit -m "Update" && git push`
3. Wait ~2 minutes
4. Your app is automatically updated on EC2! 🚀


