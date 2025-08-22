-- Row Level Security Policies for GDPR Compliance

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Job Seekers table policies
DROP POLICY IF EXISTS "Job seekers can view own profile" ON job_seekers;
CREATE POLICY "Job seekers can view own profile" ON job_seekers
    FOR SELECT USING (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Job seekers can update own profile" ON job_seekers;
CREATE POLICY "Job seekers can update own profile" ON job_seekers
    FOR UPDATE USING (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Job seekers can insert own profile" ON job_seekers;
CREATE POLICY "Job seekers can insert own profile" ON job_seekers
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Public can view public profiles" ON job_seekers;
CREATE POLICY "Public can view public profiles" ON job_seekers
    FOR SELECT USING (
        profile_visibility = 'PUBLIC'
    );

DROP POLICY IF EXISTS "Recruiters can view recruiter-only profiles" ON job_seekers;
CREATE POLICY "Recruiters can view recruiter-only profiles" ON job_seekers
    FOR SELECT USING (
        profile_visibility = 'RECRUITERS_ONLY' AND
        auth.uid() IN (
            SELECT user_id FROM employers
        )
    );

DROP POLICY IF EXISTS "Admins can manage all job seeker profiles" ON job_seekers;
CREATE POLICY "Admins can manage all job seeker profiles" ON job_seekers
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Employers table policies
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
CREATE POLICY "Employers can view own profile" ON employers
    FOR SELECT USING (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
CREATE POLICY "Employers can update own profile" ON employers
    FOR UPDATE USING (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile" ON employers
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Public can view all employer profiles" ON employers;
CREATE POLICY "Public can view all employer profiles" ON employers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all employer profiles" ON employers;
CREATE POLICY "Admins can manage all employer profiles" ON employers
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Companies table policies
DROP POLICY IF EXISTS "Employers can view own company" ON companies;
CREATE POLICY "Employers can view own company" ON companies
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "Employers can update own company" ON companies;
CREATE POLICY "Employers can update own company" ON companies
    FOR UPDATE USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "Employers can insert own company" ON companies;
CREATE POLICY "Employers can insert own company" ON companies
    FOR INSERT WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "Public can view all companies" ON companies;
CREATE POLICY "Public can view all companies" ON companies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;
CREATE POLICY "Admins can manage all companies" ON companies
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Jobs table policies
DROP POLICY IF EXISTS "Public can view published jobs" ON jobs;
CREATE POLICY "Public can view published jobs" ON jobs
    FOR SELECT USING (
        status = 'PUBLISHED' AND
        (expires_at IS NULL OR expires_at > now())
    );

DROP POLICY IF EXISTS "Employers can view own jobs" ON jobs;
CREATE POLICY "Employers can view own jobs" ON jobs
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "Employers can manage own jobs" ON jobs;
CREATE POLICY "Employers can manage own jobs" ON jobs
    FOR ALL USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs" ON jobs
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Skills table policies
DROP POLICY IF EXISTS "Public can view all skills" ON skills;
CREATE POLICY "Public can view all skills" ON skills
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage skills" ON skills;
CREATE POLICY "Admins can manage skills" ON skills
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Job Seeker Skills table policies
DROP POLICY IF EXISTS "Job seekers can view own skills" ON job_seeker_skills;
CREATE POLICY "Job seekers can view own skills" ON job_seeker_skills
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Job seekers can manage own skills" ON job_seeker_skills;
CREATE POLICY "Job seekers can manage own skills" ON job_seeker_skills
    FOR ALL USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Public can view skills for public profiles" ON job_seeker_skills;
CREATE POLICY "Public can view skills for public profiles" ON job_seeker_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM job_seekers 
            WHERE id = job_seeker_id AND profile_visibility = 'PUBLIC'
        )
    );

DROP POLICY IF EXISTS "Recruiters can view skills for recruiter profiles" ON job_seeker_skills;
CREATE POLICY "Recruiters can view skills for recruiter profiles" ON job_seeker_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM job_seekers 
            WHERE id = job_seeker_id AND profile_visibility = 'RECRUITERS_ONLY'
        ) AND
        auth.uid() IN (
            SELECT user_id FROM employers
        )
    );

-- Job Skills table policies
DROP POLICY IF EXISTS "Public can view job skills for published jobs" ON job_skills;
CREATE POLICY "Public can view job skills for published jobs" ON job_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE id = job_id AND status = 'PUBLISHED' AND
            (expires_at IS NULL OR expires_at > now())
        )
    );

DROP POLICY IF EXISTS "Employers can manage own job skills" ON job_skills;
CREATE POLICY "Employers can manage own job skills" ON job_skills
    FOR ALL USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = (
                SELECT employer_id FROM jobs WHERE id = job_id
            )
        )
    );

DROP POLICY IF EXISTS "Admins can manage all job skills" ON job_skills;
CREATE POLICY "Admins can manage all job skills" ON job_skills
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Applications table policies
DROP POLICY IF EXISTS "Job seekers can view own applications" ON applications;
CREATE POLICY "Job seekers can view own applications" ON applications
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Job seekers can create applications" ON applications;
CREATE POLICY "Job seekers can create applications" ON applications
    FOR INSERT WITH CHECK (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Guests can create applications" ON applications;
CREATE POLICY "Guests can create applications" ON applications
    FOR INSERT WITH CHECK (
        guest_email IS NOT NULL
    );

DROP POLICY IF EXISTS "Employers can view applications for own jobs" ON applications;
CREATE POLICY "Employers can view applications for own jobs" ON applications
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = (
                SELECT employer_id FROM jobs WHERE id = job_id
            )
        )
    );

DROP POLICY IF EXISTS "Employers can manage applications for own jobs" ON applications;
CREATE POLICY "Employers can manage applications for own jobs" ON applications
    FOR UPDATE USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = (
                SELECT employer_id FROM jobs WHERE id = job_id
            )
        )
    );

DROP POLICY IF EXISTS "Admins can manage all applications" ON applications;
CREATE POLICY "Admins can manage all applications" ON applications
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Saved Jobs table policies
DROP POLICY IF EXISTS "Job seekers can view own saved jobs" ON saved_jobs;
CREATE POLICY "Job seekers can view own saved jobs" ON saved_jobs
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Job seekers can manage own saved jobs" ON saved_jobs;
CREATE POLICY "Job seekers can manage own saved jobs" ON saved_jobs
    FOR ALL USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Admins can manage all saved jobs" ON saved_jobs;
CREATE POLICY "Admins can manage all saved jobs" ON saved_jobs
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Job Alerts table policies
DROP POLICY IF EXISTS "Job seekers can view own job alerts" ON job_alerts;
CREATE POLICY "Job seekers can view own job alerts" ON job_alerts
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Job seekers can manage own job alerts" ON job_alerts;
CREATE POLICY "Job seekers can manage own job alerts" ON job_alerts
    FOR ALL USING (
        auth.uid() = (
            SELECT user_id FROM job_seekers WHERE id = job_seeker_id
        )
    );

DROP POLICY IF EXISTS "Admins can manage all job alerts" ON job_alerts;
CREATE POLICY "Admins can manage all job alerts" ON job_alerts
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Payments table policies
DROP POLICY IF EXISTS "Employers can view own payments" ON payments;
CREATE POLICY "Employers can view own payments" ON payments
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "System can insert payments" ON payments;
CREATE POLICY "System can insert payments" ON payments
    FOR INSERT USING (true); -- Will be managed by backend functions

DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Subscriptions table policies
DROP POLICY IF EXISTS "Employers can view own subscriptions" ON subscriptions;
CREATE POLICY "Employers can view own subscriptions" ON subscriptions
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM employers WHERE id = employer_id
        )
    );

DROP POLICY IF EXISTS "System can insert subscriptions" ON subscriptions;
CREATE POLICY "System can insert subscriptions" ON subscriptions
    FOR INSERT USING (true); -- Will be managed by backend functions

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Consent Logs table policies
DROP POLICY IF EXISTS "Users can view own consent logs" ON consent_logs;
CREATE POLICY "Users can view own consent logs" ON consent_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert consent logs" ON consent_logs;
CREATE POLICY "System can insert consent logs" ON consent_logs
    FOR INSERT USING (true); -- Will be managed by backend functions

DROP POLICY IF EXISTS "Admins can manage all consent logs" ON consent_logs;
CREATE POLICY "Admins can manage all consent logs" ON consent_logs
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Audit Logs table policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT USING (true); -- Will be managed by backend functions

DROP POLICY IF EXISTS "Admins can manage all audit logs" ON audit_logs;
CREATE POLICY "Admins can manage all audit logs" ON audit_logs
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Newsletter Subscribers table policies
DROP POLICY IF EXISTS "Public can view newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Public can view newsletter subscribers" ON newsletter_subscribers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can manage newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "System can manage newsletter subscribers" ON newsletter_subscribers
    FOR ALL USING (true); -- Will be managed by backend functions

DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Saved Searches table policies
DROP POLICY IF EXISTS "Users can view own saved searches" ON saved_searches;
CREATE POLICY "Users can view own saved searches" ON saved_searches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own saved searches" ON saved_searches;
CREATE POLICY "Users can manage own saved searches" ON saved_searches
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all saved searches" ON saved_searches;
CREATE POLICY "Admins can manage all saved searches" ON saved_searches
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );

-- Recent Searches table policies
DROP POLICY IF EXISTS "Users can view own recent searches" ON recent_searches;
CREATE POLICY "Users can view own recent searches" ON recent_searches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recent searches" ON recent_searches;
CREATE POLICY "Users can insert own recent searches" ON recent_searches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recent searches" ON recent_searches;
CREATE POLICY "Users can delete own recent searches" ON recent_searches
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all recent searches" ON recent_searches;
CREATE POLICY "Admins can manage all recent searches" ON recent_searches
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'ADMIN'
        )
    );