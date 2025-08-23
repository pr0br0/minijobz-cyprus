# 🚀 Vercel Deployment Guide for MiniJobZ Cyprus

## Environment Variables for Vercel

When Vercel asks for environment variables, add these:

### **Required Environment Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hquysongotmqmpglgkvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdXlzb25nb3RtcW1wZ2xna3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDM2MzYsImV4cCI6MjA3MTQ3OTYzNn0.fMUpF7ns1sfjRCr3lKa4-PDw084F4Eb7ILjyVcCP5BA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdXlzb25nb3RtcW1wZ2xna3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkwMzYzNiwiZXhwIjoyMDcxNDc5NjM2fQ.ri6rcoPRtUH2Efab1L5yTGytp02YjjCWqSJMTO92Mgk

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:1234567qwertyu!@db.hquysongotmqmpglgkvd.supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=MRS4wU8YLTcWl7nscpsGFNDGA3vQV9M4Kr8uekBuAG0=

# App Configuration
APP_URL=https://your-app-name.vercel.app
ADMIN_EMAIL=admin@cyprusjobs.com

# Feature Flags (Optional)
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

## 📋 **Step-by-Step Vercel Deployment:**

### 1. **Connect GitHub Repository**
- Go to https://vercel.com (opened in browser)
- Click "New Project"
- Import from GitHub: `pr0br0/minijobz-cyprus`
- Select "MiniJobZ" folder as root directory

### 2. **Configure Build Settings**
```bash
Framework Preset: Next.js
Root Directory: MiniJobZ
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3. **Add Environment Variables**
Copy each variable above and add them in Vercel:
- Click "Environment Variables" 
- Add each KEY=VALUE pair
- **Important:** Set environment for "Production", "Preview", and "Development"

### 4. **Update NEXTAUTH_URL**
After deployment, update `NEXTAUTH_URL` with your actual Vercel URL:
```bash
NEXTAUTH_URL=https://your-actual-app-name.vercel.app
APP_URL=https://your-actual-app-name.vercel.app
```

### 5. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Your app will be live!

## 🔧 **If Build Fails:**
Common fixes:
1. Make sure "MiniJobZ" is set as root directory
2. All environment variables are added
3. Database schema is deployed in Supabase

## 🎯 **After Successful Deployment:**
1. Visit your app URL
2. Run database schema in Supabase (if not done)
3. Create admin account
4. Test all features

Your MiniJobZ Cyprus Jobs platform will be live! 🎉
