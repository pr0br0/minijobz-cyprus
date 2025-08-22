# Cyprus Jobs Platform - Migration Steps Guide

## Overview
This guide outlines the remaining steps to complete the migration from Prisma/SQLite to Supabase/PostgreSQL for Cyprus Jobs Platform.

## High Priority Tasks

### 1. Run SQL Migrations in Supabase Dashboard ✅ IN PROGRESS

**Steps:**
1. Log in to Supabase dashboard
2. Navigate to your project
3. Go to SQL Editor
4. Execute migrations in order:
   - First run `001_initial_schema.sql`
   - Then run `002_rls_policies.sql`
   - Finally run `003_exec_sql_function.sql`

**Migration Files Location:**
- `/supabase/migrations/001_initial_schema.sql`
- `/supabase/migrations/002_rls_policies.sql`
- `/supabase/migrations/003_exec_sql_function.sql`

### 2. Update Environment Variables with Supabase Credentials

**Steps:**
1. Create a new Supabase project if not already done
2. Get the following credentials from Supabase dashboard:
   - Project URL
   - Anon Key
   - Service Role Key
3. Update `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configure Stripe Payment Integration

**Steps:**
1. Create a Stripe account
2. Get test API keys:
   - Publishable Key
   - Secret Key
   - Webhook Secret
3. Update `.env.local` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Configure webhook endpoints in Stripe dashboard:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

## Medium Priority Tasks

### 4. Deploy to Vercel

**Steps:**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - All Supabase credentials
   - Stripe credentials
   - Other required environment variables
3. Set up custom domain if needed
4. Configure deployment settings

### 5. Test All Functionality

**Test Checklist:**
- [ ] User registration and login
- [ ] Job seeker profile creation
- [ ] Employer profile creation
- [ ] Job posting and management
- [ ] Job search and filtering
- [ ] Job applications
- [ ] CV uploads
- [ ] Payment processing
- [ ] GDPR compliance features
- [ ] Admin dashboard
- [ ] Email notifications

## Low Priority Tasks

### 6. Multi-language Support

**Steps:**
1. Implement Greek language support
2. Add language switcher
3. Translate all UI elements
4. Test both languages

## Post-Migration Tasks

### 1. Data Migration (If needed)
If you have existing data in SQLite, you'll need to migrate it to PostgreSQL:
1. Export data from SQLite
2. Transform data to match PostgreSQL schema
3. Import data to Supabase
4. Verify data integrity

### 2. Performance Optimization
1. Monitor query performance
2. Optimize slow queries
3. Add additional indexes if needed
4. Set up caching strategies

### 3. Security Review
1. Review RLS policies
2. Test security boundaries
3. Audit user permissions
4. Verify GDPR compliance

### 4. Backup Strategy
1. Set up automated backups
2. Test backup restoration
3. Document backup procedures

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure project is active

2. **Permission Errors**
   - Review RLS policies
   - Check user roles
   - Verify authentication state

3. **Payment Issues**
   - Verify Stripe configuration
   - Check webhook endpoints
   - Test with test cards

4. **Performance Issues**
   - Monitor database queries
   - Check for missing indexes
   - Optimize large queries

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## Next Steps

After completing these steps, your Cyprus Jobs Platform will be fully migrated to Supabase/PostgreSQL with enhanced security, scalability, and GDPR compliance.