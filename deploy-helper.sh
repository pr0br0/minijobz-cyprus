#!/bin/bash

# MiniJobZ Deployment Helper Script
# This script helps you prepare for deployment

echo "🚀 MiniJobZ Cyprus Jobs Platform - Deployment Helper"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the MiniJobZ directory"
    exit 1
fi

# Check if project builds successfully
echo "🔧 Step 1: Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the issues before deploying."
    exit 1
fi

# Check if tests pass
echo ""
echo "🧪 Step 2: Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ Tests passed!"
else
    echo "❌ Tests failed. Please fix the issues before deploying."
    exit 1
fi

# Generate NextAuth secret if needed
echo ""
echo "🔑 Step 3: NextAuth Secret Generation"
echo "Your NextAuth secret (add this to environment variables):"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo ""

# Check for environment variables template
echo "📋 Step 4: Environment Variables"
if [ -f ".env.example" ]; then
    echo "✅ .env.example found - use this as your template"
    echo "📝 Remember to set these in your Vercel dashboard:"
    echo "   - Database credentials (Supabase)"
    echo "   - NextAuth URL and secret"
    echo "   - SMTP email settings"
    echo "   - Stripe payment keys"
    echo "   - App URL and admin email"
else
    echo "⚠️  .env.example not found"
fi

# Check deployment configuration
echo ""
echo "⚙️  Step 5: Deployment Configuration"
if [ -f "vercel.json" ]; then
    echo "✅ Vercel configuration found"
else
    echo "⚠️  vercel.json not found - will use defaults"
fi

if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions CI/CD configured"
else
    echo "⚠️  GitHub Actions not found"
fi

# Final deployment checklist
echo ""
echo "📝 DEPLOYMENT CHECKLIST:"
echo "========================"
echo "Before deploying to production, make sure:"
echo ""
echo "Database Setup:"
echo "  [ ] Supabase project created"
echo "  [ ] Database migrations applied"
echo "  [ ] RLS policies configured"
echo ""
echo "Environment Variables (in Vercel):"
echo "  [ ] NEXT_PUBLIC_SUPABASE_URL"
echo "  [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  [ ] SUPABASE_SERVICE_ROLE_KEY"
echo "  [ ] NEXTAUTH_URL (your production URL)"
echo "  [ ] NEXTAUTH_SECRET (generated above)"
echo "  [ ] SMTP_* email settings"
echo "  [ ] STRIPE_* payment keys"
echo "  [ ] APP_URL (your production URL)"
echo "  [ ] ADMIN_EMAIL"
echo ""
echo "Third-party Services:"
echo "  [ ] Stripe account configured"
echo "  [ ] Email service (Gmail/SendGrid) set up"
echo "  [ ] Domain name configured (optional)"
echo ""
echo "Deployment Platform:"
echo "  [ ] GitHub repository up to date"
echo "  [ ] Vercel project connected to GitHub"
echo "  [ ] All environment variables added to Vercel"
echo ""
echo "🎯 Next Steps:"
echo "1. Follow the detailed DEPLOYMENT_GUIDE.md"
echo "2. Set up your Supabase database"
echo "3. Configure environment variables in Vercel"
echo "4. Deploy via Vercel dashboard"
echo "5. Test all functionality on production"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "✨ Ready to deploy your Cyprus Jobs Platform!"
