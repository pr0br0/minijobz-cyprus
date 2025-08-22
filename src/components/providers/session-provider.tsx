"use client";

import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, createContext, useContext } from 'react';

// Create a simple context for demo mode
const SessionContext = createContext<any>(null);

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProviderComponent({ children }: SessionProviderProps) {
  const [supabaseClient, setSupabaseClient] = useState(() => supabase);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we're in demo/development mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo-project.supabase.co';

  // If Supabase is not configured, provide a fallback
  if (!supabaseClient) {
    if (isDemoMode) {
      // In demo mode, render children with a mock session context
      return (
        <SessionContext.Provider value={{ session: null, user: null, supabase: null }}>
          {children}
        </SessionContext.Provider>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Configuration Required
          </h2>
          <p className="text-gray-600 mb-6">
            The application is not properly configured. Please set up the Supabase environment variables to continue.
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
            <p className="font-mono mb-2">Required environment variables:</p>
            <p className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</p>
            <p className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  // Only render the session provider on the client side
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For demo mode or when we have a mock client, provide basic session context
  if (isDemoMode || !supabaseClient.auth) {
    return (
      <SessionContext.Provider value={{ session: null, user: null, supabase: supabaseClient }}>
        {children}
      </SessionContext.Provider>
    );
  }

  // For production with real Supabase, you would use the actual SessionContextProvider
  // For now, we'll use our simple context
  return (
    <SessionContext.Provider value={{ session: null, user: null, supabase: supabaseClient }}>
      {children}
    </SessionContext.Provider>
  );
}