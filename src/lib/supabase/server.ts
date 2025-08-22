import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { UserRole, UserRoleEnum } from '@/types/database';

export interface ServerAuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
}

/** Helper to check if env is configured */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    url !== 'your-supabase-project-url' &&
    key !== 'your-supabase-anon-key'
  );
}

/** Helper to check if we're using demo configuration */
export function isDemoConfiguration() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo-project.supabase.co';
}

/**
 * Create a Supabase client for server components
 */
export function createServerClient() {
  // Modified: do not throw if missing; return safe mock to allow basic dev shell to load.
  if (!isSupabaseConfigured()) {
    if (isDemoConfiguration()) {
      console.log('[supabase] Using demo configuration for development');
    } else {
      console.warn('[supabase] Environment variables missing. Running in degraded mode (no auth / DB).');
    }
    const mockError = new Error('Supabase not configured');
    const mock = {
      auth: {
        async getUser() {
          return { data: { user: null }, error: mockError };
        },
      },
      from() {
        // Minimal chainable mock
        return {
          select() { return this; },
            // @ts-ignore
          eq() { return this; },
          async single() {
            return { data: null, error: mockError };
          },
        };
      },
    } as unknown as ReturnType<typeof createSupabaseServerClient<Database>>;
    return mock;
  }

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in server component context
          }
        },
      },
    }
  );
}

/**
 * Get the current user on server side
 */
export async function getServerUser(): Promise<ServerAuthUser | null> {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user profile from the users table
    const { data: profile } = await supabase
      .from('users')
      .select('role, name, avatar')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      name: profile.name || user.user_metadata.name,
      role: profile.role,
      avatar: profile.avatar || user.user_metadata.avatar_url,
    };
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated and has required role
 */
export async function requireAuth(requiredRole?: UserRole): Promise<ServerAuthUser> {
  const user = await getServerUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

/**
 * Get user role from session
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getServerUser();
  return user?.role || null;
}

/**
 * Check if user can access employer features
 */
export async function canAccessEmployerFeatures(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === UserRoleEnum.EMPLOYER;
}

/**
 * Check if user can access job seeker features
 */
export async function canAccessJobSeekerFeatures(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === UserRoleEnum.JOB_SEEKER;
}

