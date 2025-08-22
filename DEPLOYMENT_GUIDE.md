# 🚀 MiniJobZ Deployment Guide

## Overview
This guide walks you through deploying the MiniJobZ Cyprus Jobs Platform to production using Vercel with Supabase as the database.

## Prerequisites
- [ ] GitHub account
- [ ] Vercel account
- [ ] Supabase account
- [ ] Domain name (optional but recommended)
- [ ] SMTP email service (Gmail App Password or SendGrid)
- [ ] Stripe account for payments

---

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Choose a region close to Cyprus (Europe West recommended)
4. Set a strong database password

### 1.2 Get Database Credentials
After project creation, go to Settings > API:
- Copy `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

---

## Step 2: Environment Variables Setup

### 2.1 Required Environment Variables
Create these in Vercel dashboard under Settings > Environment Variables:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=https://your-domain.com (or https://your-app.vercel.app)
NEXTAUTH_SECRET=your_32_character_secret_key

# Stripe Payments
STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for testing)
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe dashboard)

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=noreply@your-domain.com

# App Configuration
APP_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com

# Optional: AI Features
OPENAI_API_KEY=sk-... (for job recommendations)

# File Upload
MAX_FILE_SIZE=5242880
```

### 2.2 Generate NextAuth Secret
```bash
openssl rand -base64 32
```

---

## Step 3: Vercel Deployment

### 3.1 Connect GitHub Repository
1. Push your code to GitHub repository
2. Go to [vercel.com](https://vercel.com) and login
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Deployment Settings
1. **Framework Preset**: Next.js
2. **Root Directory**: `MiniJobZ` (if not already selected)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`

### 3.3 Add Environment Variables
1. In Vercel dashboard, go to Settings > Environment Variables
2. Add all the environment variables from Step 2.1
3. Set them for Production, Preview, and Development environments

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Verify at the provided Vercel URL

---

## Step 4: Domain Configuration (Optional)

### 4.1 Custom Domain Setup
1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` and `APP_URL` environment variables

### 4.2 SSL Certificate
- Vercel automatically provides SSL certificates
- Verify HTTPS is working

---

## Step 5: Payment Setup (Stripe)

### 5.1 Stripe Configuration
1. Create Stripe account or login
2. Get API keys from Stripe Dashboard
3. Set up webhook endpoint: `https://your-domain.com/api/payments/webhook`
4. Configure webhook events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5.2 Test Payment Flow
1. Use Stripe test keys initially
2. Test subscription creation
3. Switch to live keys when ready

---

## Step 6: Email Service Setup

### 6.1 Gmail App Password (Recommended for testing)
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password
3. Use in `SMTP_PASS` environment variable

### 6.2 Production Email Service (Recommended)
Consider using:
- **SendGrid**: 100 emails/day free
- **Mailgun**: 10,000 emails/month free
- **Amazon SES**: Pay-per-use

---

## Step 7: Post-Deployment Verification

### 7.1 Health Check
Visit: `https://your-domain.com/api/health`
Should return: `{"status": "OK", "timestamp": "..."}`

### 7.2 Core Functionality Tests
- [ ] User registration/login
- [ ] Job posting (employer)
- [ ] Job search and filtering
- [ ] Job applications
- [ ] Email notifications
- [ ] Payment processing (if enabled)

### 7.3 Admin Access
1. Register an admin account
2. Update user role in Supabase database to 'ADMIN'
3. Access admin panel at `/admin`

---

## Step 8: Monitoring and Maintenance

### 8.1 Set Up Monitoring
- Enable Vercel Analytics
- Set up error tracking (Sentry recommended)
- Monitor performance metrics

### 8.2 Regular Maintenance
- Monitor error logs
- Update dependencies monthly
- Backup database regularly
- Review performance metrics

---

## Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables are set correctly
- Verify database connection
- Review build logs in Vercel dashboard

**Database Connection Issues:**
- Verify Supabase credentials
- Check database migration status
- Ensure correct region selection

**Email Not Sending:**
- Verify SMTP credentials
- Check spam folders
- Test with different email providers

**Payment Issues:**
- Verify Stripe webhook URL
- Check webhook secret
- Test with Stripe test cards

### Support
- Check Vercel documentation
- Review Next.js deployment guides
- Supabase documentation for database issues

---

## Security Checklist

- [ ] All environment variables are properly set
- [ ] Database RLS (Row Level Security) is enabled
- [ ] HTTPS is working correctly
- [ ] Webhook endpoints are secured
- [ ] Admin access is restricted
- [ ] File upload restrictions are in place
- [ ] Rate limiting is configured
- [ ] CORS is properly configured

---

## Go Live Checklist

- [ ] All functionality tested in staging
- [ ] Domain and SSL configured
- [ ] Payment system tested
- [ ] Email notifications working
- [ ] Admin panel accessible
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] GDPR compliance verified
- [ ] Performance optimized
- [ ] Security measures implemented

**🎉 Your Cyprus Jobs Platform is ready for production!**
