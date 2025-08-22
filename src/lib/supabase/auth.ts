import { supabase } from './client';
import { UserRoleEnum } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: typeof UserRoleEnum[keyof typeof UserRoleEnum];
  avatar?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class SupabaseAuth {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(email: string, password: string, role: typeof UserRoleEnum[keyof typeof UserRoleEnum], userData?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    companyName?: string;
    industry?: string;
    website?: string;
  }) {
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: userData?.name || `${userData?.firstName} ${userData?.lastName}`.trim(),
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: userData?.name || `${userData?.firstName} ${userData?.lastName}`.trim(),
          role,
          avatar: data.user.user_metadata.avatar_url,
          email_verified: data.user.email_confirmed_at !== null,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Note: We don't throw here as the auth user was created successfully
      }

      // Create role-specific profile
      if (role === UserRoleEnum.JOB_SEEKER && userData) {
        const { error: jobSeekerError } = await supabase
          .from('job_seekers')
          .insert({
            user_id: data.user.id,
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            phone: userData.phone || null,
            location: userData.location || null,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
          });

        if (jobSeekerError) {
          console.error('Error creating job seeker profile:', jobSeekerError);
        }
      } else if (role === UserRoleEnum.EMPLOYER && userData) {
        const { error: employerError } = await supabase
          .from('employers')
          .insert({
            user_id: data.user.id,
            company_name: userData.companyName || '',
            industry: userData.industry || null,
            website: userData.website || null,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
          });

        if (employerError) {
          console.error('Error creating employer profile:', employerError);
        }
      }

      return {
        user: data.user,
        session: data.session,
        message: 'Account created successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Update last login time
      if (data.user) {
        await supabase
          .from('users')
          .update({ 
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Get user profile from the users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, name, avatar')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
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
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get the current session
   */
  static async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }

      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      return {
        user,
        accessToken: session.access_token,
        refreshToken: session.refresh_token!,
        expiresAt: session.expires_at!,
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { message: 'Password reset email sent successfully' };
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { message: 'Password updated successfully' };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userData: {
    name?: string;
    avatar?: string;
  }) {
    const { error } = await supabase.auth.updateUser({
      data: userData,
    });

    if (error) {
      throw error;
    }

    // Also update the users table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (userData.name) updateData.name = userData.name;
      if (userData.avatar) updateData.avatar = userData.avatar;

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
    }

    return { message: 'Profile updated successfully' };
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(role: typeof UserRoleEnum[keyof typeof UserRoleEnum]): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Handle OAuth callback
   */
  static async handleOAuthCallback(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      throw error;
    }

    // Create or update user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name || data.user.user_metadata.full_name,
          role: data.user.user_metadata.role || UserRoleEnum.JOB_SEEKER,
          avatar: data.user.user_metadata.avatar_url,
          email_verified: data.user.email_confirmed_at !== null,
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error upserting user profile:', profileError);
      }

      // Create role-specific profile if it doesn't exist
      const userRole = data.user.user_metadata.role || UserRoleEnum.JOB_SEEKER;
      
      if (userRole === UserRoleEnum.JOB_SEEKER) {
        const { error: checkError } = await supabase
          .from('job_seekers')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Job seeker profile doesn't exist, create it
          await supabase
            .from('job_seekers')
            .insert({
              user_id: data.user.id,
              first_name: data.user.user_metadata.given_name || '',
              last_name: data.user.user_metadata.family_name || '',
              created_at: data.user.created_at,
              updated_at: new Date().toISOString(),
            });
        }
      } else if (userRole === UserRoleEnum.EMPLOYER) {
        const { error: checkError } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Employer profile doesn't exist, create it
          await supabase
            .from('employers')
            .insert({
              user_id: data.user.id,
              company_name: data.user.user_metadata.name || data.user.user_metadata.full_name || '',
              created_at: data.user.created_at,
              updated_at: new Date().toISOString(),
            });
        }
      }
    }

    return data;
  }
}