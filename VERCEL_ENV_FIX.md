# 🔧 Vercel Environment Variables - Direct Values

## Add these EXACT values in Vercel Environment Variables:

### **DO NOT use secret references - use direct values:**

**Variable:** `NEXT_PUBLIC_SUPABASE_URL`
**Value:** `https://hquysongotmqmpglgkvd.supabase.co`

**Variable:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdXlzb25nb3RtcW1wZ2xna3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDM2MzYsImV4cCI6MjA3MTQ3OTYzNn0.fMUpF7ns1sfjRCr3lKa4-PDw084F4Eb7ILjyVcCP5BA`

**Variable:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdXlzb25nb3RtcW1wZ2xna3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkwMzYzNiwiZXhwIjoyMDcxNDc5NjM2fQ.ri6rcoPRtUH2Efab1L5yTGytp02YjjCWqSJMTO92Mgk`

**Variable:** `DATABASE_URL`
**Value:** `postgresql://postgres:1234567qwertyu!@db.hquysongotmqmpglgkvd.supabase.co:5432/postgres`

**Variable:** `NEXTAUTH_SECRET`
**Value:** `MRS4wU8YLTcWl7nscpsGFNDGA3vQV9M4Kr8uekBuAG0=`

**Variable:** `NEXTAUTH_URL`
**Value:** `https://your-app-name.vercel.app` (update after deployment)

**Variable:** `APP_URL`
**Value:** `https://your-app-name.vercel.app` (update after deployment)

## 📋 Instructions:

1. **Go to Environment Variables section in Vercel**
2. **Click "Add New"** for each variable
3. **Type the exact variable name** (left column)  
4. **Paste the exact value** (right column)
5. **Select "Production, Preview, Development"** for all
6. **Click "Add"** for each one

## ⚠️ Important:
- Don't use secret references like `${{ secrets.supabase_url }}`
- Use the direct values as shown above
- Make sure there are no extra spaces or quotes
- Select all environments (Production, Preview, Development)

After adding all variables, try deploying again! 🚀
