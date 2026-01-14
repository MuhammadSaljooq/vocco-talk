# Domain Setup Guide for EC2

This guide will help you connect your domain to your EC2 instance.

## Prerequisites

- Domain name (e.g., voccotalk.com, app.voccotalk.com)
- Access to your domain registrar's DNS settings
- EC2 instance running (54.173.50.236)

## Step 1: Configure DNS Records

### Option A: Using A Record (Recommended)

1. **Log in to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

2. **Go to DNS Management** or **DNS Settings**

3. **Add an A Record:**
   - **Type:** A
   - **Name/Host:** @ (or leave blank for root domain) OR subdomain (e.g., `app`, `www`)
   - **Value/IP:** `54.173.50.236`
   - **TTL:** 3600 (or default)

4. **For www subdomain (optional):**
   - **Type:** A
   - **Name/Host:** www
   - **Value/IP:** `54.173.50.236`
   - **TTL:** 3600

### Option B: Using CNAME (For Subdomains)

If you want to use a subdomain:
- **Type:** CNAME
- **Name/Host:** app (or your subdomain)
- **Value:** `54.173.50.236` (or create A record first, then CNAME to it)

## Step 2: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually takes 15-30 minutes
- Check propagation: https://www.whatsmydns.net/

## Step 3: Configure Nginx on EC2

After DNS propagates, configure Nginx to serve your domain.

## Step 4: Set Up SSL (HTTPS) - Recommended

Use Let's Encrypt for free SSL certificates.

---

## Quick Setup Script

Run the domain setup script:
```bash
./setup-domain.sh yourdomain.com
```

This will:
1. Configure Nginx for your domain
2. Set up SSL certificate
3. Configure HTTPS redirect
4. Test the setup

---

## Manual Setup Steps

See detailed instructions below.


