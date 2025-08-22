import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile || profile.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get job seeker profile
    const { data: jobSeeker, error: jobSeekerError } = await supabase
      .from("job_seekers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (jobSeekerError || !jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    // Get applications with job and employer details
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        status,
        applied_at,
        cover_letter,
        jobs (
          id,
          title,
          type,
          location,
          salary_min,
          salary_max,
          employers:employers!jobs_employer_id_fkey (
            id,
            company_name,
            users:users!employers_user_id_fkey (
              email
            )
          )
        )
      `)
      .eq("job_seeker_id", jobSeeker.id)
      .order("applied_at", { ascending: false });

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // Transform the data for the frontend
    const transformedApplications = (applications || []).map(app => ({
      id: app.id,
      jobId: app.job_id,
      jobTitle: app.jobs?.title,
      companyName: app.jobs?.employers?.company_name,
      companyLocation: app.jobs?.location,
      status: app.status,
      appliedAt: app.applied_at,
      coverLetter: app.cover_letter,
      jobType: app.jobs?.type,
      salary: app.jobs?.salary_min && app.jobs?.salary_max 
        ? `€${app.jobs.salary_min} - €${app.jobs.salary_max}` 
        : app.jobs?.salary_min 
        ? `€${app.jobs.salary_min}+` 
        : app.jobs?.salary_max 
        ? `Up to €${app.jobs.salary_max}` 
        : undefined,
    }));

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile || profile.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, coverLetter } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job seeker profile exists
    const { data: jobSeeker, error: jobSeekerError } = await supabase
      .from("job_seekers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (jobSeekerError || !jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    // Check if job exists and is active
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        employer:employers!jobs_employer_id_fkey (
          id,
          company_name,
          user:users!employers_user_id_fkey (
            email
          )
        )
      `)
      .eq("id", jobId)
      .eq("status", "PUBLISHED")
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found or is no longer active" },
        { status: 404 }
      );
    }

    // Check if already applied to this job
    const { data: existingApplication, error: existingError } = await supabase
      .from("applications")
      .select("id")
      .eq("job_seeker_id", jobSeeker.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert({
        job_seeker_id: jobSeeker.id,
        job_id: jobId,
        cover_letter: coverLetter || null,
        status: "PENDING",
        applied_at: new Date().toISOString(),
      })
      .select(`
        *,
        job:jobs!applications_job_id_fkey (
          *,
          employer:employers!jobs_employer_id_fkey (
            *,
            user:users!employers_user_id_fkey (
              email
            )
          )
        )
      `)
      .single();

    if (applicationError) {
      console.error("Error creating application:", applicationError);
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }

    // Log the application for audit trail
    await supabase
      .from("audit_logs")
      .insert({
        user_id: user.id,
        action: "JOB_APPLICATION_CREATED",
        entity_type: "Application",
        entity_id: application.id,
        changes: JSON.stringify({
          jobId: jobId,
          jobTitle: job.title,
          companyName: job.employer?.company_name,
        }),
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      });

    return NextResponse.json({
      id: application.id,
      jobId: application.job_id,
      jobTitle: application.job?.title,
      companyName: application.job?.employer?.company_name,
      companyLocation: application.job?.location,
      status: application.status,
      appliedAt: application.applied_at,
      coverLetter: application.cover_letter,
      jobType: application.job?.type,
      salary: application.job?.salary_min && application.job?.salary_max 
        ? `€${application.job.salary_min} - €${application.job.salary_max}` 
        : application.job?.salary_min 
        ? `€${application.job.salary_min}+` 
        : application.job?.salary_max 
        ? `Up to €${application.job.salary_max}` 
        : undefined,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}