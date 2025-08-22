-- Create extensions for enhanced functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create enum types
CREATE TYPE user_role AS ENUM ('JOB_SEEKER', 'EMPLOYER', 'ADMIN');
CREATE TYPE profile_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'RECRUITERS_ONLY');
CREATE TYPE company_size AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');
CREATE TYPE remote_type AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'EXPIRED', 'CLOSED', 'PAUSED');
CREATE TYPE skill_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
CREATE TYPE application_status AS ENUM ('APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE alert_frequency AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE payment_type AS ENUM ('JOB_POSTING', 'SUBSCRIPTION', 'FEATURED_JOB', 'URGENT_JOB');
CREATE TYPE subscription_plan AS ENUM ('BASIC', 'PREMIUM');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');
CREATE TYPE consent_type AS ENUM ('DATA_RETENTION', 'MARKETING', 'JOB_ALERTS', 'COOKIES', 'ANALYTICS');
CREATE TYPE consent_action AS ENUM ('GRANTED', 'REVOKED');

-- Create users table (replacing NextAuth with Supabase Auth compatible)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT false,
    name TEXT,
    avatar TEXT,
    role user_role DEFAULT 'JOB_SEEKER',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    
    -- GDPR fields
    data_retention_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    job_alert_consent BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ
);

-- Create job_seekers table
CREATE TABLE job_seekers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    location TEXT NOT NULL,
    country TEXT DEFAULT 'Cyprus',
    bio TEXT,
    
    -- Professional Information
    title TEXT,
    experience INTEGER, -- Years of experience
    education TEXT,
    
    -- CV Information
    cv_url TEXT,
    cv_file_name TEXT,
    cv_uploaded_at TIMESTAMPTZ,
    
    -- GDPR fields
    profile_visibility profile_visibility DEFAULT 'PUBLIC',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create employers table
CREATE TABLE employers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Company Information
    company_name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    industry TEXT,
    size company_size,
    logo TEXT,
    
    -- Contact Information
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    
    -- Address
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Cyprus',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE UNIQUE,
    
    description TEXT,
    mission TEXT,
    values TEXT,
    benefits TEXT,
    
    -- Social Media
    linkedin TEXT,
    facebook TEXT,
    twitter TEXT,
    instagram TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    
    -- Job Details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    
    -- Location
    location TEXT NOT NULL,
    remote remote_type DEFAULT 'ONSITE',
    country TEXT DEFAULT 'Cyprus',
    
    -- Employment Details
    type employment_type DEFAULT 'FULL_TIME',
    salary_min INTEGER, -- In EUR
    salary_max INTEGER, -- In EUR
    salary_currency TEXT DEFAULT 'EUR',
    
    -- Application Settings
    application_email TEXT,
    application_url TEXT,
    
    -- Status
    status job_status DEFAULT 'DRAFT',
    featured BOOLEAN DEFAULT false,
    urgent BOOLEAN DEFAULT false,
    
    -- Dates
    expires_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create skills table
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_seeker_skills table (Many-to-Many)
CREATE TABLE job_seeker_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level skill_level DEFAULT 'BEGINNER',
    
    UNIQUE(job_seeker_id, skill_id)
);

-- Create job_skills table (Many-to-Many)
CREATE TABLE job_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    
    UNIQUE(job_id, skill_id)
);

-- Create applications table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Guest Application Fields
    guest_email TEXT,
    guest_name TEXT,
    guest_phone TEXT,
    
    -- Application Details
    cover_letter TEXT,
    cover_letter_url TEXT,
    cv_url TEXT,
    status application_status DEFAULT 'APPLIED',
    
    -- Timestamps
    applied_at TIMESTAMPTZ DEFAULT now(),
    viewed_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    
    -- Employer Notes
    notes TEXT,
    
    UNIQUE(job_seeker_id, job_id),
    UNIQUE(guest_email, job_id)
);

-- Create saved_jobs table
CREATE TABLE saved_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(job_seeker_id, job_id)
);

-- Create job_alerts table
CREATE TABLE job_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    
    -- Alert Criteria
    title TEXT,
    location TEXT,
    industry TEXT,
    job_type employment_type,
    salary_min INTEGER,
    salary_max INTEGER,
    
    -- Notification Settings
    email_alerts BOOLEAN DEFAULT true,
    sms_alerts BOOLEAN DEFAULT false,
    frequency alert_frequency DEFAULT 'DAILY',
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount INTEGER NOT NULL, -- In cents (EUR)
    currency TEXT DEFAULT 'EUR',
    status payment_status DEFAULT 'PENDING',
    
    -- Stripe Integration
    stripe_payment_intent_id TEXT,
    stripe_customer_id TEXT,
    
    -- Payment Type
    type payment_type NOT NULL,
    
    -- Subscription Info
    subscription_id TEXT,
    plan_type subscription_plan,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    
    -- Subscription Details
    plan subscription_plan NOT NULL,
    status subscription_status DEFAULT 'ACTIVE',
    
    -- Dates
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    
    -- Stripe Integration
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create consent_logs table
CREATE TABLE consent_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Consent Details
    consent_type consent_type NOT NULL,
    action consent_action NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action Details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    changes TEXT, -- JSON string of changes
    
    -- Request Info
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    preferences TEXT, -- JSON string of preferences
    
    -- Subscription Status
    active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ,
    
    -- GDPR Compliance
    data_retention_consent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create saved_searches table
CREATE TABLE saved_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Search Details
    name TEXT NOT NULL,
    query TEXT,
    location TEXT,
    filters TEXT NOT NULL, -- JSON string of filters
    
    -- Alert Settings
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency alert_frequency DEFAULT 'DAILY',
    
    -- Usage Tracking
    last_used TIMESTAMPTZ,
    job_count INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create recent_searches table
CREATE TABLE recent_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Search Details
    query TEXT,
    location TEXT,
    filters TEXT, -- JSON string of filters
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_status_expires ON jobs(status, expires_at) WHERE status = 'PUBLISHED';
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_featured ON jobs(featured) WHERE featured = true;
CREATE INDEX idx_jobs_urgent ON jobs(urgent) WHERE urgent = true;

CREATE INDEX idx_applications_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_job_seeker_skills_job_seeker_id ON job_seeker_skills(job_seeker_id);
CREATE INDEX idx_job_seeker_skills_skill_id ON job_seeker_skills(skill_id);

CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);

CREATE INDEX idx_saved_jobs_job_seeker_id ON saved_jobs(job_seeker_id);
CREATE INDEX idx_saved_jobs_job_id ON saved_jobs(job_id);

CREATE INDEX idx_job_alerts_job_seeker_id ON job_alerts(job_seeker_id);
CREATE INDEX idx_job_alerts_active ON job_alerts(active) WHERE active = true;

CREATE INDEX idx_payments_employer_id ON payments(employer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

CREATE INDEX idx_subscriptions_employer_id ON subscriptions(employer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Create full-text search indexes
CREATE INDEX idx_jobs_search ON jobs USING gin(
    to_tsvector('english', title || ' ' || description || ' ' || requirements || ' ' || responsibilities)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seeker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;