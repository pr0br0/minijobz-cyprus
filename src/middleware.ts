import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole, UserRoleEnum } from '@/types/database';

export async function middleware(request: NextRequest) {
  // Check if Supabase environment variables are configured with actual values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your-supabase-project-url' || 
      supabaseAnonKey === 'your-supabase-anon-key' ||
      !supabaseUrl.startsWith('https://')) {
    console.warn('Supabase environment variables are not properly configured. Skipping authentication middleware.');
    return NextResponse.next({
      request,
    });
  }

  // For demo/development setup, skip authentication but allow access
  if (supabaseUrl === 'https://demo-project.supabase.co') {
    console.log('Using demo Supabase configuration - authentication disabled for development');
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/_next')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }

  // Define protected routes
  const protectedRoutes: Record<string, UserRole[]> = {
    '/dashboard': ['JOB_SEEKER', 'EMPLOYER'],
    '/dashboard/job-seeker': ['JOB_SEEKER'],
    '/dashboard/employer': ['EMPLOYER'],
    '/jobs/post': ['EMPLOYER'],
    '/jobs/manage': ['EMPLOYER'],
    '/applications': ['JOB_SEEKER'],
    '/billing': ['EMPLOYER'],
    '/admin': ['ADMIN'], // Assuming you have an admin role
  };

  const { pathname } = request.nextUrl;

  // Check if current path is protected
  const protectedPath = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (protectedPath && user) {
    // Get user profile to check role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const allowedRoles = protectedRoutes[protectedPath];
    if (!allowedRoles.includes(profile.role as UserRole)) {
      // Redirect to appropriate dashboard based on role
      if (profile.role === UserRoleEnum.JOB_SEEKER) {
        return NextResponse.redirect(new URL('/dashboard/job-seeker', request.url));
      } else if (profile.role === UserRoleEnum.EMPLOYER) {
        return NextResponse.redirect(new URL('/dashboard/employer', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};