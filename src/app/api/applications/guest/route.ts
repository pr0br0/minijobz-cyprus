import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { JobStatus } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, email, name, phone, coverLetter, cvUrl } = body;

    // Validate required fields
    if (!jobId || !email) {
      return NextResponse.json(
        { error: "Job ID and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if the job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:employers!jobs_employer_id_fkey (
          id,
          company_name,
          email
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

  if (job.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if the job has expired
    if (job.expires_at && new Date(job.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This job has expired and is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if the user has already applied to this job with this email
    const { data: existingApplication, error: existingError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .or(`guest_email.eq.${email},job_seeker.user.email.eq.${email}`)
      .maybeSingle();

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    // Create the guest application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        guest_email: email,
        guest_name: name || null,
        guest_phone: phone || null,
        cover_letter: coverLetter || null,
        cv_url: cvUrl || null,
        status: "APPLIED",
        applied_at: new Date().toISOString(),
      })
      .select()
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
      .from('audit_logs')
      .insert({
        user_id: null, // Guest application
        action: "GUEST_APPLICATION_SUBMITTED",
        entity_type: "Application",
        entity_id: application.id,
        changes: JSON.stringify({
          jobId,
          jobTitle: job.title,
          companyName: job.employer?.company_name,
          guestEmail: email,
          guestName: name,
        }),
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      });

    // Send notification to employer (in a real app, this would send an email)
    // For now, we'll just log it
    console.log(`Guest application notification: ${name || email} applied for ${job.title} at ${job.employer?.company_name}`);

    return NextResponse.json({
      message: "Application submitted successfully!",
      applicationId: application.id,
      jobTitle: job.title,
      companyName: job.employer?.company_name,
    });
  } catch (error) {
    console.error("Error submitting guest application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Fetch guest applications for the given email
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!applications_job_id_fkey (
          *,
          employer:employers!jobs_employer_id_fkey (
            id,
            company_name,
            logo,
            industry
          )
        )
      `)
      .eq('guest_email', email)
      .order('applied_at', { ascending: false });

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // Transform the response
    const transformedApplications = (applications || []).map((app: any) => ({
      id: app.id,
      jobTitle: app.job?.title,
      companyName: app.job?.employer?.company_name,
      companyLogo: app.job?.employer?.logo,
      industry: app.job?.employer?.industry,
      location: app.job?.location,
      type: app.job?.type,
      salaryMin: app.job?.salary_min,
      salaryMax: app.job?.salary_max,
      status: app.status,
      appliedAt: app.applied_at,
      viewedAt: app.viewed_at,
      respondedAt: app.responded_at,
      coverLetter: app.cover_letter,
      cvUrl: app.cv_url,
    }));

    return NextResponse.json({
      applications: transformedApplications,
      total: transformedApplications.length,
    });
  } catch (error) {
    console.error("Error fetching guest applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}