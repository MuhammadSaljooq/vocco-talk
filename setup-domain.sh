#!/bin/bash

# Domain Setup Script for EC2
# Usage: ./setup-domain.sh yourdomain.com [www.yourdomain.com]

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
DOMAIN="${1:-}"
WWW_DOMAIN="${2:-}"

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Error: Domain name required${NC}"
    echo "Usage: ./setup-domain.sh yourdomain.com [www.yourdomain.com]"
    exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Domain Setup Script - Vocco Talk                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}\n"

# Check key file
if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ Key file '$EC2_KEY' not found${NC}"
    exit 1
fi

chmod 400 "$EC2_KEY" 2>/dev/null || true

echo -e "${GREEN}🌐 Setting up domain: $DOMAIN${NC}\n"

# Step 1: Install Certbot (for SSL)
echo -e "${GREEN}📦 Step 1: Installing Certbot...${NC}"
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << ENDSSH
    if ! command -v certbot &> /dev/null; then
        sudo yum install -y certbot python3-certbot-nginx
        echo "✅ Certbot installed"
    else
        echo "✅ Certbot already installed"
    fi
ENDSSH

# Step 2: Create Nginx configuration
echo -e "\n${GREEN}⚙️  Step 2: Configuring Nginx...${NC}"
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << ENDSSH
    # Create Nginx config
    sudo tee /etc/nginx/conf.d/vocco-talk.conf > /dev/null << NGINXCONF
server {
    listen 80;
    server_name $DOMAIN${WWW_DOMAIN:+ $WWW_DOMAIN};

    root /usr/share/nginx/html;
    index index.html;

    # Logging
    access_log /var/log/nginx/vocco-talk-access.log;
    error_log /var/log/nginx/vocco-talk-error.log;

    # Main location
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINXCONF

    # Test Nginx configuration
    sudo nginx -t && echo "✅ Nginx configuration valid"
ENDSSH

# Step 3: Restart Nginx
echo -e "\n${GREEN}🔄 Step 3: Restarting Nginx...${NC}"
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "sudo systemctl restart nginx"
echo -e "${GREEN}✅ Nginx restarted${NC}"

# Step 4: Set up SSL
echo -e "\n${GREEN}🔒 Step 4: Setting up SSL certificate...${NC}"
echo -e "${YELLOW}⚠️  Make sure your DNS A record points to $EC2_HOST before continuing${NC}"
echo -e "${YELLOW}   Check: https://www.whatsmydns.net/#A/$DOMAIN${NC}"
echo ""
read -p "Has DNS propagated? (y/n): " DNS_READY

if [ "$DNS_READY" != "y" ] && [ "$DNS_READY" != "Y" ]; then
    echo -e "${YELLOW}⚠️  Skipping SSL setup. Run again after DNS propagates.${NC}"
    echo -e "${YELLOW}   Or run manually:${NC}"
    echo -e "${YELLOW}   ssh -i $EC2_KEY $EC2_USER@$EC2_HOST${NC}"
    echo -e "${YELLOW}   sudo certbot --nginx -d $DOMAIN${NC}"
else
    echo -e "${GREEN}Requesting SSL certificate...${NC}"
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << ENDSSH
        sudo certbot --nginx -d $DOMAIN${WWW_DOMAIN:+ -d $WWW_DOMAIN} --non-interactive --agree-tos --email admin@$DOMAIN --redirect || echo "⚠️  SSL setup failed - run manually"
ENDSSH
fi

# Step 5: Verify
echo -e "\n${GREEN}🧪 Step 5: Verifying setup...${NC}"
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Domain is working! HTTP Status: $HTTP_CODE${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP Status: $HTTP_CODE${NC}"
    echo -e "${YELLOW}   Domain may need more time to propagate${NC}"
fi

# Summary
echo -e "\n${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Domain Setup Complete!                           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ Domain configured: $DOMAIN${NC}"
echo -e "${GREEN}✅ Nginx configured${NC}"
if [ "$DNS_READY" = "y" ] || [ "$DNS_READY" = "Y" ]; then
    echo -e "${GREEN}✅ SSL certificate requested${NC}"
fi

echo -e "\n${BLUE}🌐 Access your site:${NC}"
echo -e "   http://$DOMAIN"
if [ "$DNS_READY" = "y" ] || [ "$DNS_READY" = "Y" ]; then
    echo -e "   https://$DOMAIN"
fi

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Wait for DNS propagation (if not done)"
echo -e "   2. Set up SSL: sudo certbot --nginx -d $DOMAIN"
echo -e "   3. Test your site: http://$DOMAIN"

echo ""

