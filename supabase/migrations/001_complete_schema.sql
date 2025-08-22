-- MiniJobZ Cyprus Jobs Platform - Production Database Setup
-- This file contains the complete database schema for production deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('JOB_SEEKER', 'EMPLOYER', 'ADMIN');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'EXPIRED', 'CLOSED');
CREATE TYPE application_status AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFER_MADE', 'HIRED', 'REJECTED');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP');
CREATE TYPE experience_level AS ENUM ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE');
CREATE TYPE alert_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING');

-- Users table (extends NextAuth users)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    name VARCHAR(255),
    image TEXT,
    role user_role DEFAULT 'JOB_SEEKER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    gdpr_consent BOOLEAN DEFAULT FALSE,
    gdpr_consent_date TIMESTAMP
);

-- Job seekers profile
CREATE TABLE job_seekers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(100),
    bio TEXT,
    cv_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    experience_level experience_level,
    salary_expectation_min INTEGER,
    salary_expectation_max INTEGER,
    currency VARCHAR(3) DEFAULT 'EUR',
    available_from DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employers profile
CREATE TABLE employers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    company_description TEXT,
    company_website TEXT,
    company_logo TEXT,
    company_size VARCHAR(50),
    industry VARCHAR(100),
    location VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    tax_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    location VARCHAR(100),
    remote_work BOOLEAN DEFAULT FALSE,
    employment_type employment_type NOT NULL,
    experience_level experience_level,
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(3) DEFAULT 'EUR',
    status job_status DEFAULT 'DRAFT',
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    featured BOOLEAN DEFAULT FALSE,
    urgent BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job skills (many-to-many)
CREATE TABLE job_skills (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Job seeker skills (many-to-many)
CREATE TABLE job_seeker_skills (
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    PRIMARY KEY (job_seeker_id, skill_id)
);

-- Applications table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    cover_letter TEXT,
    cv_url TEXT,
    status application_status DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(job_id, job_seeker_id)
);

-- Saved jobs
CREATE TABLE saved_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, job_seeker_id)
);

-- Job alerts
CREATE TABLE job_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    keywords TEXT,
    location VARCHAR(100),
    employment_type employment_type,
    salary_min INTEGER,
    salary_max INTEGER,
    frequency alert_frequency DEFAULT 'WEEKLY',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions (for premium features)
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    status subscription_status,
    plan_name VARCHAR(100),
    plan_price INTEGER, -- in cents
    currency VARCHAR(3) DEFAULT 'EUR',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search analytics
CREATE TABLE search_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    query TEXT,
    filters JSONB,
    results_count INTEGER,
    clicked_job_id UUID REFERENCES jobs(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GDPR data requests
CREATE TABLE gdpr_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'export', 'delete'
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    data_url TEXT -- for export requests
);

-- Create indexes for performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_featured ON jobs(featured) WHERE featured = true;
CREATE INDEX idx_applications_job_seeker ON applications(job_seeker_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Full-text search indexes
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_skills_search ON skills USING gin(to_tsvector('english', name));

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN');

-- RLS Policies for job_seekers
CREATE POLICY "Job seekers can view own profile" ON job_seekers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Job seekers can update own profile" ON job_seekers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Employers can view job seeker profiles" ON job_seekers FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'EMPLOYER')
);

-- RLS Policies for employers
CREATE POLICY "Employers can view own profile" ON employers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Employers can update own profile" ON employers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view employer basic info" ON employers FOR SELECT USING (true);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view published jobs" ON jobs FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Employers can manage own jobs" ON jobs FOR ALL USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
);

-- RLS Policies for applications
CREATE POLICY "Job seekers can view own applications" ON applications FOR SELECT USING (
    job_seeker_id IN (SELECT id FROM job_seekers WHERE user_id = auth.uid())
);
CREATE POLICY "Job seekers can create applications" ON applications FOR INSERT WITH CHECK (
    job_seeker_id IN (SELECT id FROM job_seekers WHERE user_id = auth.uid())
);
CREATE POLICY "Employers can view applications for their jobs" ON applications FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE employer_id IN (
        SELECT id FROM employers WHERE user_id = auth.uid()
    ))
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_seekers_updated_at BEFORE UPDATE ON job_seekers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('TypeScript', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('Python', 'Programming'),
('Java', 'Programming'),
('SQL', 'Database'),
('PostgreSQL', 'Database'),
('MongoDB', 'Database'),
('AWS', 'Cloud'),
('Docker', 'DevOps'),
('Git', 'Tools'),
('Project Management', 'Soft Skills'),
('Communication', 'Soft Skills'),
('Leadership', 'Soft Skills'),
('Marketing', 'Business'),
('Sales', 'Business'),
('Customer Service', 'Business'),
('Accounting', 'Finance'),
('Data Analysis', 'Analytics');

-- Create a function for full-text search
CREATE OR REPLACE FUNCTION search_jobs(
    search_query TEXT,
    job_location TEXT DEFAULT NULL,
    job_employment_type employment_type DEFAULT NULL,
    min_salary INTEGER DEFAULT NULL,
    max_salary INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    location VARCHAR,
    employment_type employment_type,
    salary_min INTEGER,
    salary_max INTEGER,
    company_name VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j.employment_type,
        j.salary_min,
        j.salary_max,
        e.company_name,
        j.created_at
    FROM jobs j
    JOIN employers e ON j.employer_id = e.id
    WHERE j.status = 'PUBLISHED'
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        AND (search_query IS NULL OR to_tsvector('english', j.title || ' ' || j.description) @@ plainto_tsquery('english', search_query))
        AND (job_location IS NULL OR j.location ILIKE '%' || job_location || '%')
        AND (job_employment_type IS NULL OR j.employment_type = job_employment_type)
        AND (min_salary IS NULL OR j.salary_min >= min_salary)
        AND (max_salary IS NULL OR j.salary_max <= max_salary)
    ORDER BY 
        CASE WHEN search_query IS NOT NULL THEN ts_rank(to_tsvector('english', j.title || ' ' || j.description), plainto_tsquery('english', search_query)) END DESC,
        j.featured DESC,
        j.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMIT;
