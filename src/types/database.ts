export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// NOTE: Removed redundant primitive union type aliases (UserRole, JobStatus, ApplicationStatus, ProfileVisibility)
// to avoid duplicate identifier conflicts with the exported Database enum-based types declared later.

// Enum values for runtime use
export const UserRoleEnum = {
  JOB_SEEKER: 'JOB_SEEKER',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'ADMIN',
} as const;

export const JobStatusEnum = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  EXPIRED: 'EXPIRED',
  CLOSED: 'CLOSED',
  PAUSED: 'PAUSED',
} as const;

export const ApplicationStatusEnum = {
  APPLIED: 'APPLIED',
  VIEWED: 'VIEWED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  OFFERED: 'OFFERED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export const ProfileVisibilityEnum = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  RECRUITERS_ONLY: 'RECRUITERS_ONLY',
} as const;

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    email_verified: boolean;
                    name: string | null;
                    avatar: string | null;
                    role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
                    created_at: string;
                    updated_at: string;
                    last_login_at: string | null;
                    data_retention_consent: boolean;
                    marketing_consent: boolean;
                    job_alert_consent: boolean;
                    deleted_at: string | null;
                };
                Insert: {
                    id: string;
                    email: string;
                    email_verified?: boolean;
                    name?: string | null;
                    avatar?: string | null;
                    role?: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
                    created_at?: string;
                    updated_at?: string;
                    last_login_at?: string | null;
                    data_retention_consent?: boolean;
                    marketing_consent?: boolean;
                    job_alert_consent?: boolean;
                    deleted_at?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    email_verified?: boolean;
                    name?: string | null;
                    avatar?: string | null;
                    role?: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
                    created_at?: string;
                    updated_at?: string;
                    last_login_at?: string | null;
                    data_retention_consent?: boolean;
                    marketing_consent?: boolean;
                    job_alert_consent?: boolean;
                    deleted_at?: string | null;
                };
            };
            job_seekers: {
                Row: {
                    id: string;
                    user_id: string;
                    first_name: string;
                    last_name: string;
                    phone: string | null;
                    location: string;
                    country: string;
                    bio: string | null;
                    title: string | null;
                    experience: number | null;
                    education: string | null;
                    cv_url: string | null;
                    cv_file_name: string | null;
                    cv_uploaded_at: string | null;
                    profile_visibility: 'PUBLIC' | 'PRIVATE' | 'RECRUITERS_ONLY';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    first_name: string;
                    last_name: string;
                    phone?: string | null;
                    location: string;
                    country?: string;
                    bio?: string | null;
                    title?: string | null;
                    experience?: number | null;
                    education?: string | null;
                    cv_url?: string | null;
                    cv_file_name?: string | null;
                    cv_uploaded_at?: string | null;
                    profile_visibility?: 'PUBLIC' | 'PRIVATE' | 'RECRUITERS_ONLY';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    first_name?: string;
                    last_name?: string;
                    phone?: string | null;
                    location?: string;
                    country?: string;
                    bio?: string | null;
                    title?: string | null;
                    experience?: number | null;
                    education?: string | null;
                    cv_url?: string | null;
                    cv_file_name?: string | null;
                    cv_uploaded_at?: string | null;
                    profile_visibility?: 'PUBLIC' | 'PRIVATE' | 'RECRUITERS_ONLY';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            employers: {
                Row: {
                    id: string;
                    user_id: string;
                    company_name: string;
                    description: string | null;
                    website: string | null;
                    industry: string | null;
                    size: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null;
                    logo: string | null;
                    contact_name: string | null;
                    contact_email: string | null;
                    contact_phone: string | null;
                    address: string | null;
                    city: string | null;
                    postal_code: string | null;
                    country: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    company_name: string;
                    description?: string | null;
                    website?: string | null;
                    industry?: string | null;
                    size?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null;
                    logo?: string | null;
                    contact_name?: string | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    address?: string | null;
                    city?: string | null;
                    postal_code?: string | null;
                    country?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    company_name?: string;
                    description?: string | null;
                    website?: string | null;
                    industry?: string | null;
                    size?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null;
                    logo?: string | null;
                    contact_name?: string | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    address?: string | null;
                    city?: string | null;
                    postal_code?: string | null;
                    country?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            companies: {
                Row: {
                    id: string;
                    employer_id: string;
                    description: string | null;
                    mission: string | null;
                    values: string | null;
                    benefits: string | null;
                    linkedin: string | null;
                    facebook: string | null;
                    twitter: string | null;
                    instagram: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    employer_id: string;
                    description?: string | null;
                    mission?: string | null;
                    values?: string | null;
                    benefits?: string | null;
                    linkedin?: string | null;
                    facebook?: string | null;
                    twitter?: string | null;
                    instagram?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    employer_id?: string;
                    description?: string | null;
                    mission?: string | null;
                    values?: string | null;
                    benefits?: string | null;
                    linkedin?: string | null;
                    facebook?: string | null;
                    twitter?: string | null;
                    instagram?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            jobs: {
                Row: {
                    id: string;
                    employer_id: string;
                    title: string;
                    description: string;
                    requirements: string | null;
                    responsibilities: string | null;
                    location: string;
                    remote: 'ONSITE' | 'HYBRID' | 'REMOTE';
                    country: string;
                    type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
                    salary_min: number | null;
                    salary_max: number | null;
                    salary_currency: string;
                    application_email: string | null;
                    application_url: string | null;
                    status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'PAUSED';
                    featured: boolean;
                    urgent: boolean;
                    expires_at: string | null;
                    published_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    employer_id: string;
                    title: string;
                    description: string;
                    requirements?: string | null;
                    responsibilities?: string | null;
                    location: string;
                    remote?: 'ONSITE' | 'HYBRID' | 'REMOTE';
                    country?: string;
                    type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
                    salary_min?: number | null;
                    salary_max?: number | null;
                    salary_currency?: string;
                    application_email?: string | null;
                    application_url?: string | null;
                    status?: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'PAUSED';
                    featured?: boolean;
                    urgent?: boolean;
                    expires_at?: string | null;
                    published_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    employer_id?: string;
                    title?: string;
                    description?: string;
                    requirements?: string | null;
                    responsibilities?: string | null;
                    location?: string;
                    remote?: 'ONSITE' | 'HYBRID' | 'REMOTE';
                    country?: string;
                    type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
                    salary_min?: number | null;
                    salary_max?: number | null;
                    salary_currency?: string;
                    application_email?: string | null;
                    application_url?: string | null;
                    status?: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'PAUSED';
                    featured?: boolean;
                    urgent?: boolean;
                    expires_at?: string | null;
                    published_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            skills: {
                Row: {
                    id: string;
                    name: string;
                    category: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    category?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    category?: string | null;
                    created_at?: string;
                };
            };
            job_seeker_skills: {
                Row: {
                    id: string;
                    job_seeker_id: string;
                    skill_id: string;
                    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
                };
                Insert: {
                    id?: string;
                    job_seeker_id: string;
                    skill_id: string;
                    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
                };
                Update: {
                    id?: string;
                    job_seeker_id?: string;
                    skill_id?: string;
                    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
                };
            };
            job_skills: {
                Row: {
                    id: string;
                    job_id: string;
                    skill_id: string;
                };
                Insert: {
                    id?: string;
                    job_id: string;
                    skill_id: string;
                };
                Update: {
                    id?: string;
                    job_id?: string;
                    skill_id?: string;
                };
            };
            applications: {
                Row: {
                    id: string;
                    job_seeker_id: string | null;
                    job_id: string;
                    guest_email: string | null;
                    guest_name: string | null;
                    guest_phone: string | null;
                    cover_letter: string | null;
                    cover_letter_url: string | null;
                    cv_url: string | null;
                    status: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
                    applied_at: string;
                    viewed_at: string | null;
                    responded_at: string | null;
                    notes: string | null;
                };
                Insert: {
                    id?: string;
                    job_seeker_id?: string | null;
                    job_id: string;
                    guest_email?: string | null;
                    guest_name?: string | null;
                    guest_phone?: string | null;
                    cover_letter?: string | null;
                    cover_letter_url?: string | null;
                    cv_url?: string | null;
                    status?: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
                    applied_at?: string;
                    viewed_at?: string | null;
                    responded_at?: string | null;
                    notes?: string | null;
                };
                Update: {
                    id?: string;
                    job_seeker_id?: string | null;
                    job_id?: string;
                    guest_email?: string | null;
                    guest_name?: string | null;
                    guest_phone?: string | null;
                    cover_letter?: string | null;
                    cover_letter_url?: string | null;
                    cv_url?: string | null;
                    status?: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
                    applied_at?: string;
                    viewed_at?: string | null;
                    responded_at?: string | null;
                    notes?: string | null;
                };
            };
            saved_jobs: {
                Row: {
                    id: string;
                    job_seeker_id: string;
                    job_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    job_seeker_id: string;
                    job_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    job_seeker_id?: string;
                    job_id?: string;
                    created_at?: string;
                };
            };
            job_alerts: {
                Row: {
                    id: string;
                    job_seeker_id: string;
                    title: string | null;
                    location: string | null;
                    industry: string | null;
                    job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | null;
                    salary_min: number | null;
                    salary_max: number | null;
                    email_alerts: boolean;
                    sms_alerts: boolean;
                    frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
                    active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    job_seeker_id: string;
                    title?: string | null;
                    location?: string | null;
                    industry?: string | null;
                    job_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | null;
                    salary_min?: number | null;
                    salary_max?: number | null;
                    email_alerts?: boolean;
                    sms_alerts?: boolean;
                    frequency?: 'INSTANT' | 'DAILY' | 'WEEKLY';
                    active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    job_seeker_id?: string;
                    title?: string | null;
                    location?: string | null;
                    industry?: string | null;
                    job_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | null;
                    salary_min?: number | null;
                    salary_max?: number | null;
                    email_alerts?: boolean;
                    sms_alerts?: boolean;
                    frequency?: 'INSTANT' | 'DAILY' | 'WEEKLY';
                    active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            payments: {
                Row: {
                    id: string;
                    employer_id: string;
                    job_id: string | null;
                    amount: number;
                    currency: string;
                    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
                    stripe_payment_intent_id: string | null;
                    stripe_customer_id: string | null;
                    type: 'JOB_POSTING' | 'SUBSCRIPTION' | 'FEATURED_JOB' | 'URGENT_JOB';
                    subscription_id: string | null;
                    plan_type: 'BASIC' | 'PREMIUM' | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    employer_id: string;
                    job_id?: string | null;
                    amount: number;
                    currency?: string;
                    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
                    stripe_payment_intent_id?: string | null;
                    stripe_customer_id?: string | null;
                    type: 'JOB_POSTING' | 'SUBSCRIPTION' | 'FEATURED_JOB' | 'URGENT_JOB';
                    subscription_id?: string | null;
                    plan_type?: 'BASIC' | 'PREMIUM' | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    employer_id?: string;
                    job_id?: string | null;
                    amount?: number;
                    currency?: string;
                    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
                    stripe_payment_intent_id?: string | null;
                    stripe_customer_id?: string | null;
                    type?: 'JOB_POSTING' | 'SUBSCRIPTION' | 'FEATURED_JOB' | 'URGENT_JOB';
                    subscription_id?: string | null;
                    plan_type?: 'BASIC' | 'PREMIUM' | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    employer_id: string;
                    plan: 'BASIC' | 'PREMIUM';
                    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
                    starts_at: string;
                    ends_at: string;
                    cancelled_at: string | null;
                    stripe_subscription_id: string | null;
                    stripe_customer_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    employer_id: string;
                    plan: 'BASIC' | 'PREMIUM';
                    status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
                    starts_at?: string;
                    ends_at: string;
                    cancelled_at?: string | null;
                    stripe_subscription_id?: string | null;
                    stripe_customer_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    employer_id?: string;
                    plan?: 'BASIC' | 'PREMIUM';
                    status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
                    starts_at?: string;
                    ends_at?: string;
                    cancelled_at?: string | null;
                    stripe_subscription_id?: string | null;
                    stripe_customer_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            consent_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    consent_type: 'DATA_RETENTION' | 'MARKETING' | 'JOB_ALERTS' | 'COOKIES' | 'ANALYTICS';
                    action: 'GRANTED' | 'REVOKED';
                    ip_address: string | null;
                    user_agent: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    consent_type: 'DATA_RETENTION' | 'MARKETING' | 'JOB_ALERTS' | 'COOKIES' | 'ANALYTICS';
                    action: 'GRANTED' | 'REVOKED';
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    consent_type?: 'DATA_RETENTION' | 'MARKETING' | 'JOB_ALERTS' | 'COOKIES' | 'ANALYTICS';
                    action?: 'GRANTED' | 'REVOKED';
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
            };
            audit_logs: {
                Row: {
                    id: string;
                    user_id: string | null;
                    action: string;
                    entity_type: string;
                    entity_id: string | null;
                    changes: string | null;
                    ip_address: string | null;
                    user_agent: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    action: string;
                    entity_type: string;
                    entity_id?: string | null;
                    changes?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    action?: string;
                    entity_type?: string;
                    entity_id?: string | null;
                    changes?: string | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
            };
            newsletter_subscribers: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    preferences: string | null;
                    active: boolean;
                    subscribed_at: string;
                    unsubscribed_at: string | null;
                    data_retention_consent: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name?: string | null;
                    preferences?: string | null;
                    active?: boolean;
                    subscribed_at?: string;
                    unsubscribed_at?: string | null;
                    data_retention_consent?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    preferences?: string | null;
                    active?: boolean;
                    subscribed_at?: string;
                    unsubscribed_at?: string | null;
                    data_retention_consent?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            saved_searches: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    query: string | null;
                    location: string | null;
                    filters: string;
                    alert_enabled: boolean;
                    alert_frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
                    last_used: string | null;
                    job_count: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    query?: string | null;
                    location?: string | null;
                    filters: string;
                    alert_enabled?: boolean;
                    alert_frequency?: 'INSTANT' | 'DAILY' | 'WEEKLY';
                    last_used?: string | null;
                    job_count?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    query?: string | null;
                    location?: string | null;
                    filters?: string;
                    alert_enabled?: boolean;
                    alert_frequency?: 'INSTANT' | 'DAILY' | 'WEEKLY';
                    last_used?: string | null;
                    job_count?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            recent_searches: {
                Row: {
                    id: string;
                    user_id: string;
                    query: string | null;
                    location: string | null;
                    filters: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    query?: string | null;
                    location?: string | null;
                    filters?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    query?: string | null;
                    location?: string | null;
                    filters?: string | null;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            user_role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
            profile_visibility: 'PUBLIC' | 'PRIVATE' | 'RECRUITERS_ONLY';
            company_size: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
            remote_type: 'ONSITE' | 'HYBRID' | 'REMOTE';
            employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
            job_status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'PAUSED';
            skill_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
            application_status: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
            alert_frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
            payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
            payment_type: 'JOB_POSTING' | 'SUBSCRIPTION' | 'FEATURED_JOB' | 'URGENT_JOB';
            subscription_plan: 'BASIC' | 'PREMIUM';
            subscription_status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
            consent_type: 'DATA_RETENTION' | 'MARKETING' | 'JOB_ALERTS' | 'COOKIES' | 'ANALYTICS';
            consent_action: 'GRANTED' | 'REVOKED';
        };
    };
}

// Export enum types for easier use
export type UserRole = Database['public']['Enums']['user_role'];
export type ProfileVisibility = Database['public']['Enums']['profile_visibility'];
export type CompanySize = Database['public']['Enums']['company_size'];
export type RemoteType = Database['public']['Enums']['remote_type'];
export type EmploymentType = Database['public']['Enums']['employment_type'];
export type JobStatus = Database['public']['Enums']['job_status'];
export type SkillLevel = Database['public']['Enums']['skill_level'];
export type ApplicationStatus = Database['public']['Enums']['application_status'];
export type AlertFrequency = Database['public']['Enums']['alert_frequency'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentType = Database['public']['Enums']['payment_type'];
export type SubscriptionPlan = Database['public']['Enums']['subscription_plan'];
export type SubscriptionStatus = Database['public']['Enums']['subscription_status'];
export type ConsentType = Database['public']['Enums']['consent_type'];
export type ConsentAction = Database['public']['Enums']['consent_action'];

// Export table row types for easier use
export type UserProfile = Database['public']['Tables']['users']['Row'];
export type JobSeekerProfile = Database['public']['Tables']['job_seekers']['Row'];
export type EmployerProfile = Database['public']['Tables']['employers']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type Skill = Database['public']['Tables']['skills']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];