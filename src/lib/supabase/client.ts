import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
function isValidSupabaseUrl(url: string | undefined): boolean {
    return !!(url && url.startsWith('https://') && url !== 'your-supabase-project-url');
}

function isValidSupabaseKey(key: string | undefined): boolean {
    return !!(key && key !== 'your-supabase-anon-key' && key !== 'your-supabase-service-key');
}

// For development, we'll create mock clients that don't actually connect
function createMockClient() {
    return {
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signIn: async () => ({ data: { user: null }, error: new Error('Mock auth - not implemented') }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ 
                data: { 
                    subscription: { 
                        unsubscribe: () => {
                            console.log('Mock auth state change unsubscribed');
                        } 
                    } 
                } 
            }),
        },
        from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ data: null, error: new Error('Mock database - not implemented') }),
            update: () => ({ data: null, error: new Error('Mock database - not implemented') }),
            delete: () => ({ data: null, error: new Error('Mock database - not implemented') }),
        }),
    };
}

if (!isValidSupabaseUrl(supabaseUrl) || !isValidSupabaseKey(supabaseAnonKey)) {
    console.warn('Supabase environment variables are not properly configured.');
    if (supabaseUrl === 'https://demo-project.supabase.co') {
        console.log('Using demo configuration for local development');
    }
}

// Client for browser/anonymous access
export const supabase = (isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey)) 
    ? (supabaseUrl === 'https://demo-project.supabase.co' 
        ? createMockClient() as any
        : createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        }))
    : null;

// Client for server-side operations with service role
export const supabaseAdmin = (isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseServiceRoleKey)) 
    ? (supabaseUrl === 'https://demo-project.supabase.co' 
        ? createMockClient() as any
        : createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
            auth: {
                persistSession: false,
            },
        }))
    : null;

// Helper functions for common operations
export const getCurrentUser = async () => {
    if (!supabase) {
        throw new Error('Supabase client is not configured. Please check your environment variables.');
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const getCurrentSession = async () => {
    if (!supabase) {
        throw new Error('Supabase client is not configured. Please check your environment variables.');
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

// Type helpers
export type UserProfile = Database['public']['Tables']['users']['Row'];
export type JobSeekerProfile = Database['public']['Tables']['job_seekers']['Row'];
export type EmployerProfile = Database['public']['Tables']['employers']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type Skill = Database['public']['Tables']['skills']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

// Join types for common queries
export type JobWithEmployer = Job & {
    employer: EmployerProfile & {
        company?: Database['public']['Tables']['companies']['Row'];
    };
    skills: Array<{
        skill: Skill;
    }>;
    _count: {
        applications: number;
    };
};

export type ApplicationWithDetails = Application & {
    job: JobWithEmployer;
    job_seeker?: JobSeekerProfile;
};

export type JobSeekerWithSkills = JobSeekerProfile & {
    user: UserProfile;
    skills: Array<{
        skill: Skill;
        level: Database['public']['Enums']['skill_level'];
    }>;
};