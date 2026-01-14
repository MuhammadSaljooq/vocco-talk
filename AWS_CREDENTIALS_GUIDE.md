# How to Find AWS Access Key and Secret Access Key

## Step-by-Step Guide

### Method 1: Create New Access Keys (Recommended)

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your AWS account

2. **Navigate to IAM (Identity and Access Management)**
   - Click on your username in the top-right corner
   - Select "Security credentials" from the dropdown
   - OR search for "IAM" in the search bar and click on it

3. **Access Your User's Security Credentials**
   - In IAM, click on "Users" in the left sidebar
   - Click on your username
   - Click on the "Security credentials" tab

4. **Create Access Key**
   - Scroll down to "Access keys" section
   - Click "Create access key" button
   - Select use case:
     - **Command Line Interface (CLI)** - for AWS CLI
     - **Application running outside AWS** - for SDKs
   - Check the confirmation box and click "Next"
   - Optionally add a description tag
   - Click "Create access key"

5. **Download/Copy Your Keys**
   - **Access Key ID**: Visible immediately (starts with `AKIA...`)
   - **Secret Access Key**: Click "Show" to reveal it
   - **⚠️ IMPORTANT**: Copy both keys NOW - the Secret Access Key will only be shown ONCE!
   - Click "Download .csv file" to save them securely
   - Click "Done"

### Method 2: View Existing Access Keys

1. **Go to IAM → Users → Your Username → Security credentials**
2. **Find "Access keys" section**
3. **You'll see existing Access Key IDs** (if any)
4. **⚠️ Note**: You CANNOT view the Secret Access Key again after creation
   - If you lost it, you must create a new access key pair

### Visual Guide

```
AWS Console
  └── IAM (Search or Services menu)
      └── Users (Left sidebar)
          └── [Your Username]
              └── Security credentials tab
                  └── Access keys section
                      └── Create access key
```

## Security Best Practices

### ✅ DO:
- **Store keys securely** - Never commit to Git
- **Use IAM roles** when possible (for EC2, Lambda, etc.)
- **Rotate keys regularly** (every 90 days recommended)
- **Use least privilege** - Only grant necessary permissions
- **Enable MFA** on your AWS account
- **Delete unused keys** immediately

### ❌ DON'T:
- **Share keys** publicly or in code repositories
- **Use root account keys** - Create IAM user instead
- **Store keys in plain text** files
- **Use same keys** for multiple applications
- **Ignore key rotation** warnings

## Setting Up Credentials

### Option 1: AWS CLI Configure (Recommended)
```bash
aws configure
```
Enter:
- Access Key ID: `AKIA...`
- Secret Access Key: `your-secret-key`
- Default region: `us-east-1` (or your preferred region)
- Default output: `json`

### Option 2: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

### Option 3: Credentials File
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = your-secret-key
region = us-east-1
```

## Verify Your Credentials

Test if your credentials work:
```bash
aws sts get-caller-identity
```

You should see:
```json
{
    "UserId": "...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

## Troubleshooting

### "Access Denied" Error
- Check IAM permissions
- Verify keys are correct
- Ensure user has necessary policies attached

### "Invalid Access Key" Error
- Verify Access Key ID format (starts with `AKIA...`)
- Check if key was deleted or deactivated
- Create new access key if needed

### Can't See Secret Access Key
- Secret keys are only shown once during creation
- If lost, create a new access key pair
- Delete the old key after creating new one

## Required IAM Permissions

For deployment, your IAM user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetDistribution"
            ],
            "Resource": "*"
        }
    ]
}
```

Or attach these managed policies:
- `AmazonS3FullAccess` (or create custom policy with only needed permissions)
- `CloudFrontFullAccess` (or create custom policy)

## Quick Links

- **AWS Console**: https://console.aws.amazon.com/
- **IAM Dashboard**: https://console.aws.amazon.com/iam/
- **Create Access Key**: https://console.aws.amazon.com/iam/home#/security_credentials
- **AWS CLI Documentation**: https://docs.aws.amazon.com/cli/

---

**Remember**: Keep your Secret Access Key secure and never share it publicly!


