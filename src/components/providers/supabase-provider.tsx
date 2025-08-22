'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
    Session, 
    SupabaseClient, 
    AuthError,
    User 
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, options?: any) => Promise<{
        user: User | null;
        session: Session | null;
        error: AuthError | null;
    }>;
    signIn: (email: string, password: string) => Promise<{
        user: User | null;
        session: Session | null;
        error: AuthError | null;
    }>;
    signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{
        error: AuthError | null;
        data: any;
    }>;
    updatePassword: (password: string) => Promise<{
        error: AuthError | null;
        data: any;
    }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Create or update user profile in our database
                if (session?.user) {
                    await syncUserProfile(session.user);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const syncUserProfile = async (user: User) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email!,
                    email_verified: user.email_confirmed_at !== null,
                    name: user.user_metadata?.full_name || user.user_metadata?.name,
                    avatar: user.user_metadata?.avatar_url,
                    role: user.user_metadata?.role || 'JOB_SEEKER',
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) {
                console.error('Error syncing user profile:', error);
            }
        } catch (error) {
            console.error('Error in syncUserProfile:', error);
        }
    };

    const signUp = async (email: string, password: string, options?: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: options?.fullName,
                    role: options?.role || 'JOB_SEEKER',
                },
            },
        });

        return {
            user: data.user,
            session: data.session,
            error,
        };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {
            user: data.user,
            session: data.session,
            error,
        };
    };

    const signInWithOAuth = async (provider: 'google' | 'github') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        return { error, data };
    };

    const updatePassword = async (password: string) => {
        const { data, error } = await supabase.auth.updateUser({
            password,
        });

        return { error, data };
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}