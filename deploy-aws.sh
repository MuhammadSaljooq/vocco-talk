#!/bin/bash

# AWS Deployment Script for Vocco Talk
# Usage: ./deploy-aws.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${1:-}"
DISTRIBUTION_ID="${2:-}"

echo -e "${GREEN}🚀 Starting AWS Deployment...${NC}\n"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed.${NC}"
    echo "Install it with: brew install awscli (macOS) or visit https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "Run: aws configure"
    exit 1
fi

# Get AWS account info
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")
echo -e "${GREEN}✓${NC} Connected to AWS Account: ${AWS_ACCOUNT}"
echo -e "${GREEN}✓${NC} Region: ${AWS_REGION}\n"

# Prompt for bucket name if not provided
if [ -z "$BUCKET_NAME" ]; then
    echo -e "${YELLOW}Enter S3 bucket name:${NC}"
    read -r BUCKET_NAME
fi

# Check if bucket exists
if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bucket '$BUCKET_NAME' not found.${NC}"
    echo -e "${YELLOW}Would you like to create it? (y/n)${NC}"
    read -r CREATE_BUCKET
    if [ "$CREATE_BUCKET" = "y" ] || [ "$CREATE_BUCKET" = "Y" ]; then
        echo "Creating bucket..."
        aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
        
        # Enable static website hosting
        echo "Configuring static website hosting..."
        aws s3 website "s3://$BUCKET_NAME" \
            --index-document index.html \
            --error-document index.html
        
        echo -e "${GREEN}✓${NC} Bucket created and configured"
    else
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Build application
echo -e "\n${GREEN}📦 Building application...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the project root?${NC}"
    exit 1
fi

npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist folder not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build complete\n"

# Deploy to S3
echo -e "${GREEN}☁️  Deploying to S3...${NC}"
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --exact-timestamps

echo -e "${GREEN}✓${NC} Files uploaded to S3\n"

# Invalidate CloudFront cache if distribution ID provided
if [ -n "$DISTRIBUTION_ID" ]; then
    echo -e "${GREEN}🔄 Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✓${NC} Cache invalidation created: $INVALIDATION_ID"
    echo -e "${YELLOW}⏳ Cache invalidation may take a few minutes to complete${NC}\n"
else
    echo -e "${YELLOW}⚠️  CloudFront distribution ID not provided. Skipping cache invalidation.${NC}"
    echo -e "${YELLOW}   To invalidate cache, run:${NC}"
    echo -e "${YELLOW}   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'${NC}\n"
fi

# Get S3 website URL
S3_URL="http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo -e "${GREEN}✅ Deployment complete!${NC}\n"
echo -e "S3 Website URL: ${GREEN}$S3_URL${NC}"
if [ -n "$DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)
    echo -e "CloudFront URL: ${GREEN}https://$CLOUDFRONT_URL${NC}"
fi
echo ""

