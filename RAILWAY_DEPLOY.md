# Railway Deployment Guide for MiniJobZ Cyprus

## 🚀 Quick Deploy to Railway

### 1. Login to Railway
```bash
railway login
```

### 2. Initialize Project
```bash
railway init
```

### 3. Set Environment Variables
```bash
# Supabase Configuration
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
railway variables set DATABASE_URL=your_postgres_url

# NextAuth Configuration
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXTAUTH_SECRET=your_generated_secret

# Email Configuration (Optional)
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=your_email@gmail.com
railway variables set SMTP_PASS=your_app_password
```

### 4. Deploy
```bash
railway up
```

## 🔧 Environment Variables Required

Copy from `.env.local` and set each variable:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 📦 What's Configured

✅ Build command: `npm run build`
✅ Start command: `npm start`
✅ Node.js environment
✅ Automatic deployments from GitHub
✅ SSL certificate (HTTPS)

## 🎯 After Deployment

1. **Set up Supabase database** (if not done)
2. **Run migrations** in Supabase dashboard
3. **Test the application**
4. **Create admin account**

Your app will be live at: `https://your-project-name.railway.app`
