# AWS Setup Guide - Vocco Talk

This guide will help you connect to AWS and deploy your application to AWS S3 + CloudFront.

## Prerequisites

- AWS Account
- AWS CLI installed
- Node.js and npm installed

## Step 1: Install AWS CLI

### macOS
```bash
brew install awscli
```

### Linux
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Windows
Download and install from: https://aws.amazon.com/cli/

## Step 2: Configure AWS Credentials

### Option A: Using AWS CLI (Recommended)
```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: Your AWS access key
- **AWS Secret Access Key**: Your AWS secret key
- **Default region name**: e.g., `us-east-1`, `eu-west-1`
- **Default output format**: `json`

### Option B: Using Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=us-east-1
```

### Option C: Using AWS Credentials File
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = your_access_key_id
aws_secret_access_key = your_secret_access_key
region = us-east-1
```

## Step 3: Verify AWS Connection

Test your connection:
```bash
aws sts get-caller-identity
```

You should see your AWS account details.

## Step 4: Create S3 Bucket

```bash
# Replace 'your-bucket-name' with your unique bucket name
aws s3 mb s3://your-bucket-name --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### Configure Bucket Policy (Public Read Access)
```bash
# Create bucket-policy.json
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
EOF

# Apply policy
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

## Step 5: Build Your Application

```bash
cd "/Users/shireenafzal/vocco talk final "
npm install
npm run build
```

## Step 6: Deploy to S3

```bash
# Sync dist folder to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Or use the deploy script
./deploy-aws.sh
```

## Step 7: Set Up CloudFront Distribution

### Using AWS Console:
1. Go to CloudFront in AWS Console
2. Create Distribution
3. Origin Domain: Select your S3 bucket
4. Viewer Protocol Policy: Redirect HTTP to HTTPS
5. Default Root Object: `index.html`
6. Create Distribution

### Using AWS CLI:
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3.amazonaws.com \
  --default-root-object index.html \
  --viewer-protocol-policy redirect-to-https
```

## Step 8: Environment Variables

For production, set environment variables:

### Option A: AWS Systems Manager Parameter Store
```bash
aws ssm put-parameter \
  --name "/vocco-talk/VITE_GEMINI_API_KEY" \
  --value "your_api_key" \
  --type "SecureString"
```

### Option B: Build-time Injection
Add to your build script:
```bash
VITE_GEMINI_API_KEY=your_key npm run build
```

## Quick Deploy Script

Create `deploy-aws.sh`:
```bash
#!/bin/bash
set -e

BUCKET_NAME="your-bucket-name"
DISTRIBUTION_ID="your-cloudfront-distribution-id"

echo "Building application..."
npm run build

echo "Deploying to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy-aws.sh
```

## Troubleshooting

### Access Denied Errors
- Check IAM permissions
- Verify bucket policy
- Ensure credentials are correct

### CORS Issues
Add CORS configuration to S3 bucket:
```bash
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

Create `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Route Not Found (SPA)
Configure CloudFront error pages:
- 403 → 200 → `/index.html`
- 404 → 200 → `/index.html`

## Security Best Practices

1. **Use IAM Roles** instead of access keys when possible
2. **Enable MFA** on AWS account
3. **Rotate credentials** regularly
4. **Use least privilege** IAM policies
5. **Enable CloudFront logging**
6. **Set up CloudWatch alarms**

## Cost Estimation

- **S3 Storage**: ~$0.023 per GB/month
- **CloudFront**: ~$0.085 per GB (first 10TB)
- **Data Transfer**: ~$0.09 per GB (out to internet)

For a small to medium site: ~$5-20/month

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions, AWS CodePipeline)
2. Configure custom domain
3. Set up monitoring and alerts
4. Implement caching strategies
5. Set up backup and disaster recovery

---

**Need Help?**
- AWS Documentation: https://docs.aws.amazon.com/
- AWS CLI Reference: https://awscli.amazonaws.com/v2/documentation/
- AWS Support: https://aws.amazon.com/support/

