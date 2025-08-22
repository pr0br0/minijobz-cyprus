# Supabase Project Setup Guide

## Step 1: Create Supabase Project

### 1.1 Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Sign in with your account or create a new one

### 1.2 Create New Project
1. Click "New Project"
2. **Project Details:**
   - **Name:** `cyprus-jobs-platform`
   - **Database Password:** Generate a strong password (save it securely)
   - **Region:** Select EU region (Frankfurt or Stockholm)
   - **Organization:** Choose your organization

### 1.3 Wait for Project Creation
- This usually takes 2-5 minutes
- You'll receive project URL and API keys

## Step 2: Get Project Credentials

Once the project is created, you'll find:

### 2.1 Project URL
- Found in Project Settings > General > API
- Format: `https://your-project-id.supabase.co`

### 2.2 API Keys
- **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2.3 Database Connection
- **Host:** `db.your-project-id.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`

## Step 3: Run SQL Migrations

### 3.1 Open SQL Editor
- In Supabase dashboard, go to SQL Editor
- Click "New query"

### 3.2 Run Initial Schema
1. Copy contents from `supabase/migrations/001_initial_schema.sql`
2. Paste into SQL editor
3. Click "Run" or press Ctrl+Enter

### 3.3 Run RLS Policies
1. Copy contents from `supabase/migrations/002_rls_policies.sql`
2. Paste into SQL editor
3. Click "Run" or press Ctrl+Enter

## Step 4: Configure Storage

### 4.1 Create Storage Buckets
Go to Storage > Create new bucket:

#### CVs Bucket
- **Name:** `cvs`
- **Public bucket:** No (private)
- **File size limit:** 10MB
- **Allowed MIME types:** `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### Company Logos Bucket
- **Name:** `logos`
- **Public bucket:** Yes
- **File size limit:** 5MB
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### 4.2 Set Up Storage Policies
```sql
-- Create policies for CVs bucket
CREATE POLICY "Users can view own CVs" ON storage.objects
FOR SELECT USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own CVs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own CVs" ON storage.objects
FOR UPDATE USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for logos bucket
CREATE POLICY "Public can view logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Employers can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text IN (
        SELECT user_id::text FROM employers WHERE id = (storage.foldername(name))[1]::uuid
    )
);
```

## Step 5: Configure Authentication

### 5.1 Enable Auth Providers
Go to Authentication > Providers:

#### Google OAuth
- Toggle Google OAuth to ON
- **Google Client ID:** Your Google OAuth client ID
- **Google Client Secret:** Your Google OAuth client secret
- **Site URL:** `http://localhost:3000` (development) or your production URL
- **Redirect URLs:** `http://localhost:3000/auth/callback`

#### Email/Password
- Ensure email/password is enabled
- Configure email templates if needed

### 5.2 Set Up Email Templates
Go to Authentication > Email Templates:
- Customize confirmation, recovery, and magic link emails
- Add your branding and platform name

## Step 6: Update Environment Variables

### 6.1 Update .env.local
Copy the values from Supabase dashboard:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 6.2 Update Stripe Configuration
Add your Stripe test keys:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 7: Test Connection

### 7.1 Test Database Connection
Run this command to test:

```bash
npm run dev
```

Check the console for Supabase connection errors.

### 7.2 Test Authentication
Try to sign up/sign in to test the auth flow.

## Step 8: Set Up Webhooks

### 8.1 Stripe Webhooks
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Listen for events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 8.2 Supabase Webhooks (Optional)
Set up webhooks for:
- User sign-ups
- Authentication events
- Database changes (for real-time features)

## Step 9: Security Configuration

### 9.1 Configure CORS
Go to Project Settings > API > CORS:
- Add your frontend URLs:
  - `http://localhost:3000`
  - `https://your-production-domain.com`

### 9.2 Set Up Rate Limiting
Configure rate limiting in:
- Supabase Auth settings
- Vercel deployment settings

### 9.3 Enable SSL
Ensure SSL is enabled for all connections.

## Step 10: Backup and Monitoring

### 10.1 Configure Backups
- Enable automated daily backups in Supabase
- Set up point-in-time recovery if needed

### 10.2 Set Up Monitoring
- Configure Supabase logs monitoring
- Set up error tracking (Sentry, etc.)
- Monitor database performance

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check environment variables
   - Verify project URL and keys
   - Ensure network connectivity

2. **Authentication Issues**
   - Verify redirect URLs
   - Check email templates
   - Ensure OAuth providers are configured

3. **Storage Issues**
   - Check bucket policies
   - Verify file size limits
   - Ensure proper MIME types

4. **Database Issues**
   - Check RLS policies
   - Verify table relationships
   - Ensure proper indexes

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.gg/supabase)
- [Stripe Documentation](https://stripe.com/docs)

## Next Steps

After completing this setup:

1. ✅ Mark "Set up Supabase project" as complete
2. ✅ Mark "Run SQL migrations" as complete  
3. ✅ Mark "Configure environment variables" as complete
4. 🔄 Begin "Migrate API endpoints" task
5. 🔄 Continue with remaining todo items

Your Cyprus Jobs Platform will be ready for development and testing!