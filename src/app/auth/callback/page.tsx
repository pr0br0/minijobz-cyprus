'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the code from the URL
                const code = searchParams.get('code');
                const next = searchParams.get('next') || '/';

                if (code) {
                    // Exchange the code for a session
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    
                    if (error) {
                        console.error('Auth callback error:', error);
                        setStatus('error');
                        setMessage('Authentication failed. Please try again.');
                        return;
                    }

                    if (data.session) {
                        setStatus('success');
                        setMessage('Authentication successful! Redirecting...');
                        
                        // Redirect after a short delay
                        setTimeout(() => {
                            router.push(next);
                        }, 2000);
                    }
                } else {
                    setStatus('error');
                    setMessage('No authentication code found.');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage('An unexpected error occurred.');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    // If we already have a session, redirect
    useEffect(() => {
        if (session) {
            const next = searchParams.get('next') || '/';
            router.push(next);
        }
    }, [session, router, searchParams]);

    const handleRetry = () => {
        router.push('/auth/signin');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && (
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-12 w-12 text-red-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'loading' && 'Authenticating...'}
                        {status === 'success' && 'Success!'}
                        {status === 'error' && 'Authentication Error'}
                    </CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'error' && (
                        <div className="space-y-4">
                            <Button 
                                onClick={handleRetry} 
                                className="w-full"
                                variant="outline"
                            >
                                Try Again
                            </Button>
                            <Button 
                                onClick={() => router.push('/')} 
                                className="w-full"
                            >
                                Go to Homepage
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}