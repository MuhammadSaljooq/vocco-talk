#!/bin/bash

# EC2 Update Script - Run this on EC2 to pull updates from Git
# Place this script on your EC2 instance and run it to update

set -e

# Configuration
APP_DIR="/usr/share/nginx/html"
BACKUP_DIR="/var/backups/nginx-html"
GIT_REPO="" # Set your Git repository URL here
GIT_BRANCH="main"

echo "🔄 Starting update process..."

# Create backup
echo "💾 Creating backup..."
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r "$APP_DIR" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

# If using Git-based deployment
if [ -n "$GIT_REPO" ]; then
    WORK_DIR="/tmp/vocco-talk-deploy"
    
    echo "📥 Cloning repository..."
    rm -rf "$WORK_DIR"
    git clone -b "$GIT_BRANCH" "$GIT_REPO" "$WORK_DIR"
    
    echo "📦 Building application..."
    cd "$WORK_DIR"
    npm install
    npm run build
    
    echo "📤 Deploying..."
    sudo rm -rf "$APP_DIR/*"
    sudo cp -r dist/* "$APP_DIR/"
else
    echo "⚠️  Git repository not configured"
    echo "Please set GIT_REPO in this script or use manual deployment"
fi

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R nginx:nginx "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Update complete!"
echo "🌐 Your app is live at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

