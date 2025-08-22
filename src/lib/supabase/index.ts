// Main Supabase client exports
export { supabase, supabaseAdmin } from './client';
export type {
  UserProfile,
  JobSeekerProfile,
  EmployerProfile,
  Job,
  Application,
  Skill,
  Payment,
  Subscription,
  JobWithEmployer,
  ApplicationWithDetails,
  JobSeekerWithSkills,
} from './client';

// Auth utilities exports
export { SupabaseAuth } from './auth';
export type { AuthUser, AuthSession } from './auth';

// Server-side exports (only available in Server Components)
export type {
  ServerAuthUser
} from './server';

// Note: Server functions are not exported to prevent client-side import issues
// Import them directly from './server' in Server Components only