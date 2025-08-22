# 🇨🇾 Cyprus Jobs Platform

A modern, GDPR-compliant job board platform built specifically for the Cyprus job market. Built with Next.js 15, Supabase, and TypeScript for enterprise-grade performance and security.

## ✨ Platform Features

### 🎯 For Job Seekers
- **Smart Job Search** - Advanced filtering with location, salary, and skills
- **AI-Powered Recommendations** - Personalized job suggestions
- **Profile Management** - Complete professional profile with CV upload
- **Application Tracking** - Track all your job applications in one place
- **Job Alerts** - Get notified about relevant opportunities
- **Saved Jobs** - Bookmark interesting positions

### 🏢 For Employers
- **Job Posting Management** - Easy-to-use job posting interface
- **Applicant Tracking System** - Manage applications efficiently
- **Company Profile** - Showcase your company brand
- **Premium Features** - Featured and urgent job listings
- **Analytics Dashboard** - Track job performance and applications

### 🔒 Enterprise Features
- **GDPR Compliant** - Complete data protection compliance
- **Multi-language Support** - English and Greek language support
- **Advanced Security** - Row Level Security (RLS) with Supabase
- **Real-time Updates** - Live notifications and updates
- **Audit Logging** - Complete action tracking for compliance

## 🚀 Technology Stack

### 🎯 Core Framework
- **⚡ Next.js 15** - App Router with TypeScript
- **🗄️ Supabase** - PostgreSQL database with real-time features
- **🎨 Tailwind CSS** - Utility-first styling with shadcn/ui components
- **🔐 Supabase Auth** - Secure authentication with OAuth support

### 🧩 Key Integrations
- **💳 Stripe** - Payment processing for premium features
- **📧 Email System** - Job alerts and notifications
- **📁 File Storage** - Secure CV and company logo storage
- **🔍 Full-text Search** - Advanced job search capabilities

## 🏗️ Architecture

### Database Schema
- **Users & Roles** - Job seekers, employers, and admin roles
- **Jobs & Applications** - Complete job lifecycle management
- **Skills & Matching** - Skill-based job matching system
- **Payments & Subscriptions** - Stripe-based monetization
- **GDPR Compliance** - Data retention and consent management

### Security Features
- **Row Level Security** - Database-level access control
- **GDPR Compliance** - Data export and deletion capabilities
- **Audit Logging** - Complete action tracking
- **File Security** - Secure storage with access controls

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd MiniJobZ

# Install dependencies
npm install

# Set up environment variables
cp .env.template .env.local
# Update .env.local with your Supabase and Stripe credentials

# Run database migrations
# See SUPABASE_SETUP.md for detailed instructions

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

## ▶️ Run Development Server Directly

From repository root:
```bash
cd MiniJobZ
npm install   # first time only
npm run dev
```

Or (now supported) from repository root without changing directory:
```bash
npm install        # installs root + workspace (first time)
npm run dev
```

If you created scripts earlier:
```bash
./scripts/run-dev.sh
# or
./start-dev.sh
```

### 🔍 One-Step: Analyze then Run Dev
From repository root:
```bash
bash scripts/analyze-and-dev.sh
```
Does:
- Ensures .env.local (creates with placeholders if absent)
- Installs dependencies if needed
- Runs analysis (outputs in ./reports)
- Launches dev server (http://localhost:3000)

### 🧱 Full Local Mode (Supabase + Next.js)

Start everything (Docker + Supabase + migrations + Next):
```bash
npm run dev:local
# or
bash scripts/dev-local.sh
```

Seed sample data (after local stack up):
```bash
npm run seed
```

Troubleshoot:
```bash
supabase stop   # then re-run dev:local
```

## 📚 Documentation

- **[Migration Guide](MIGRATION_COMPLETION_REPORT.md)** - Complete migration status and details
- **[Supabase Setup](SUPABASE_SETUP.md)** - Step-by-step Supabase configuration
- **[Testing Checklist](TESTING_CHECKLIST.md)** - Comprehensive testing guide

## 🌍 Cyprus Job Market Focus

This platform is specifically designed for the Cyprus job market with:

- **Local Requirements** - Cyprus-specific job categories and requirements
- **Bilingual Support** - Greek and English language support  
- **Local Compliance** - GDPR and Cyprus employment law compliance
- **Currency Support** - EUR currency with Cyprus salary ranges
- **Location Awareness** - Cyprus cities and regions

## 📊 Current Status

### ✅ Migration Complete (95%)
- Database migrated to Supabase PostgreSQL
- All API endpoints operational
- Authentication system migrated
- File storage system implemented
- GDPR compliance features active

### 🔄 In Progress (5%)
- Stripe payment configuration
- Final testing and deployment
- Multi-language UI completion

## 🤝 Contributing

This is a production platform for the Cyprus job market. For development:

1. Follow the setup instructions in `SUPABASE_SETUP.md`
2. Run the testing checklist before deployment
3. Ensure GDPR compliance for any data-related changes

## 🧪 Local Development & Testing

Quick start (remote Supabase):
```bash
./local-dev.sh --remote \
  --url https://YOUR_PROJECT_ID.supabase.co \
  --anon YOUR_ANON_KEY \
  --service YOUR_SERVICE_ROLE_KEY
```

Run with local Supabase (requires Supabase CLI + Docker):
```bash
./local-dev.sh --local
```

Make targets:
```bash
make setup      # install deps + basic validation
make dev        # start next dev server
make test       # run smoke tests (requires dev server)
make audit      # dependency / security audit
make analyze    # repo inventory & metrics
```

Smoke test after starting dev:
```bash
make test
```

Generated artifacts go to reports/.

Environment:
- Copy .env.template → .env.local (script will assist).
- Stripe keys required only for payment flows (tests skip if missing).

Troubleshooting:
- Delete .next/ if stale types.
- If Supabase local ports busy: supabase stop; retry.
- Add --verbose to local-dev.sh for debug.

## 📞 Support

For technical issues or platform support, please refer to the documentation or create an issue.

---

**Built for Cyprus 🇨🇾 | Powered by Next.js + Supabase**
