#!/bin/bash

# Automated Deployment Script for EC2
# Usage: ./deploy-to-ec2.sh [--auto]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
EC2_HOST="54.173.50.236"
EC2_USER="ec2-user"
EC2_KEY="Vocco.pem"
REMOTE_DIR="/usr/share/nginx/html"
BUILD_DIR="dist"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           EC2 Deployment Script - Vocco Talk                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}\n"

# Check if key file exists
if [ ! -f "$EC2_KEY" ]; then
    echo -e "${YELLOW}⚠️  Key file '$EC2_KEY' not found in current directory.${NC}"
    echo -e "${YELLOW}Enter path to your EC2 key file:${NC}"
    read -r EC2_KEY
    if [ ! -f "$EC2_KEY" ]; then
        echo -e "${RED}❌ Key file not found: $EC2_KEY${NC}"
        exit 1
    fi
fi

# Set correct permissions on key file
chmod 400 "$EC2_KEY" 2>/dev/null || true

# Step 1: Build the application
echo -e "${GREEN}📦 Step 1: Building application...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the project root?${NC}"
    exit 1
fi

npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed - $BUILD_DIR folder not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build complete\n"

# Step 2: Test SSH connection
echo -e "${GREEN}🔌 Step 2: Testing SSH connection...${NC}"
if ! ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" &>/dev/null; then
    echo -e "${RED}❌ Cannot connect to EC2 instance${NC}"
    echo -e "${YELLOW}Please verify:${NC}"
    echo -e "  - Key file path: $EC2_KEY"
    echo -e "  - EC2 IP: $EC2_HOST"
    echo -e "  - Username: $EC2_USER (try 'ubuntu' if this fails)"
    exit 1
fi

echo -e "${GREEN}✓${NC} SSH connection successful\n"

# Step 3: Check/Install Nginx on EC2
echo -e "${GREEN}🌐 Step 3: Setting up web server on EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        sudo yum update -y
        sudo yum install nginx -y
        sudo systemctl start nginx
        sudo systemctl enable nginx
        echo "✓ Nginx installed and started"
    else
        echo "✓ Nginx already installed"
    fi
    
    # Create backup directory
    sudo mkdir -p /var/backups/nginx-html
    echo "✓ Backup directory ready"
ENDSSH

echo -e "${GREEN}✓${NC} Web server ready\n"

# Step 4: Backup existing deployment
echo -e "${GREEN}💾 Step 4: Backing up existing deployment...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "sudo cp -r $REMOTE_DIR /var/backups/nginx-html/backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo 'No existing deployment to backup'" 

echo -e "${GREEN}✓${NC} Backup complete\n"

# Step 5: Upload files
echo -e "${GREEN}📤 Step 5: Uploading files to EC2...${NC}"
rsync -avz --delete -e "ssh -i $EC2_KEY -o StrictHostKeyChecking=no" \
    "$BUILD_DIR/" "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"

echo -e "${GREEN}✓${NC} Files uploaded\n"

# Step 6: Set correct permissions
echo -e "${GREEN}🔐 Step 6: Setting permissions...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "sudo chown -R nginx:nginx $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"

echo -e "${GREEN}✓${NC} Permissions set\n"

# Step 7: Restart Nginx
echo -e "${GREEN}🔄 Step 7: Restarting web server...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "sudo systemctl restart nginx"

echo -e "${GREEN}✓${NC} Web server restarted\n"

# Step 8: Test deployment
echo -e "${GREEN}🧪 Step 8: Testing deployment...${NC}"
sleep 2
if curl -s -o /dev/null -w "%{http_code}" "http://$EC2_HOST" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓${NC} Deployment successful!\n"
else
    echo -e "${YELLOW}⚠️  Deployment complete but site may need a moment to be ready${NC}\n"
fi

# Summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Deployment Complete!                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ Your webapp is now live at:${NC}"
echo -e "   ${BLUE}http://$EC2_HOST${NC}\n"

echo -e "${YELLOW}💡 Tip: Run this script anytime to update your deployment${NC}"
echo -e "   ${YELLOW}./deploy-to-ec2.sh${NC}\n"

