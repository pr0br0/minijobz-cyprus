import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/";

    if (code) {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(new URL("/auth/signin?error=oauth_failed", request.url));
      }

      // Check if user has a profile, create if not
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (!existingProfile) {
          // Create profile for OAuth user
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || "",
              avatar: data.user.user_metadata?.avatar_url || null,
              role: "JOB_SEEKER", // Default role for OAuth users
            });

          if (profileError) {
            console.error("Error creating profile:", profileError);
          }

          // Create default job seeker profile
          const { error: jobSeekerError } = await supabase
            .from("job_seekers")
            .insert({
              user_id: data.user.id,
              first_name: data.user.user_metadata?.given_name || "",
              last_name: data.user.user_metadata?.family_name || "",
              location: "",
              country: "Cyprus",
              profile_visibility: "PUBLIC",
            });

          if (jobSeekerError) {
            console.error("Error creating job seeker profile:", jobSeekerError);
          }
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }

    // If no code, redirect to Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${request.nextUrl.origin}/api/auth/google?next=${next}`,
      },
    });

    if (error) {
      console.error("Error initiating Google OAuth:", error);
      return NextResponse.redirect(new URL("/auth/signin?error=oauth_failed", request.url));
    }

    return NextResponse.redirect(data.url!);
  } catch (error) {
    console.error("Error in Google OAuth:", error);
    return NextResponse.redirect(new URL("/auth/signin?error=server_error", request.url));
  }
}