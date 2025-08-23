-- Complete Database Schema for MiniJobZ Cyprus Jobs Platform
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS public.job_alerts CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'employer', 'admin')),
  phone VARCHAR(20),
  location VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  linkedin VARCHAR(255),
  github VARCHAR(255),
  skills TEXT[],
  experience_level VARCHAR(50) DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead')),
  preferred_job_types TEXT[],
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,
  currency VARCHAR(10) DEFAULT 'EUR',
  available_for_work BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'employers_only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  industry VARCHAR(255),
  size_category VARCHAR(50) DEFAULT 'startup' CHECK (size_category IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  employee_count INTEGER,
  founded_year INTEGER,
  location VARCHAR(255),
  headquarters VARCHAR(255),
  culture_values TEXT[],
  benefits TEXT[],
  tech_stack TEXT[],
  social_media JSONB DEFAULT '{}',
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  location VARCHAR(255),
  location_type VARCHAR(20) DEFAULT 'office' CHECK (location_type IN ('office', 'remote', 'hybrid')),
  employment_type VARCHAR(20) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
  experience_level VARCHAR(20) DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR(10) DEFAULT 'EUR',
  salary_period VARCHAR(20) DEFAULT 'annual' CHECK (salary_period IN ('hourly', 'daily', 'weekly', 'monthly', 'annual')),
  skills_required TEXT[],
  skills_preferred TEXT[],
  categories TEXT[],
  tags TEXT[],
  application_deadline DATE,
  application_url TEXT,
  application_email VARCHAR(255),
  contact_person VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'closed', 'archived')),
  featured BOOLEAN DEFAULT false,
  urgent BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE public.job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  additional_documents JSONB DEFAULT '[]',
  application_answers JSONB DEFAULT '{}',
  notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Job Alerts table
CREATE TABLE public.job_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  keywords TEXT[],
  location VARCHAR(255),
  employment_types TEXT[],
  experience_levels TEXT[],
  salary_min INTEGER,
  categories TEXT[],
  companies TEXT[],
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('immediate', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_featured ON public.jobs(featured) WHERE featured = true;
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_companies_verification_status ON public.companies(verification_status);
CREATE INDEX idx_companies_created_by ON public.companies(created_by);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users policies
CREATE POLICY "Users can view public profiles" ON public.users FOR SELECT USING (
  profile_visibility = 'public' OR 
  auth.uid() = id OR
  (profile_visibility = 'employers_only' AND EXISTS (
    SELECT 1 FROM public.companies WHERE created_by = auth.uid()
  ))
);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can view verified companies" ON public.companies FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "Users can create companies" ON public.companies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Company creators can update their companies" ON public.companies FOR UPDATE USING (auth.uid() = created_by);

-- Jobs policies
CREATE POLICY "Anyone can view published jobs" ON public.jobs FOR SELECT USING (status = 'published');
CREATE POLICY "Company members can manage their jobs" ON public.jobs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = jobs.company_id 
    AND created_by = auth.uid()
  )
);

-- Job applications policies
CREATE POLICY "Users can view their own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Company owners can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.jobs j 
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = job_applications.job_id 
    AND c.created_by = auth.uid()
  )
);
CREATE POLICY "Company owners can update applications for their jobs" ON public.job_applications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.jobs j 
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = job_applications.job_id 
    AND c.created_by = auth.uid()
  )
);

-- Job alerts policies
CREATE POLICY "Users can manage their own job alerts" ON public.job_alerts FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data for testing
INSERT INTO public.users (id, email, full_name, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@cyprusjobs.com', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database schema created successfully! 🎉' as message;
