import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Use string literals instead of missing enum constants (Supabase table values)
const EMPLOYER_ROLE = 'EMPLOYER';
const DEFAULT_JOB_STATUS = 'DRAFT';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
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
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile || profile.role !== EMPLOYER_ROLE) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Get employer profile
    const { data: employer, error: employerError } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (employerError || !employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from("jobs")
      .select(`
        id,
        title,
        location,
        remote,
        type,
        salary_min,
        salary_max,
        salary_currency,
        status,
        created_at,
        published_at,
        expires_at,
        featured,
        urgent,
        applications (count)
      `, { count: "exact" })
      .eq("employer_id", employer.id);

    // Add status filter if not "all"
    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Add sorting
    const validSortColumns = ["title", "published_at", "created_at"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    query = query.order(sortColumn, { ascending: sortOrder === "asc" });

    const { data: jobs, error: jobsError } = await query;

    if (jobsError) {
      console.error("Error fetching employer jobs:", jobsError);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    // Transform the response
    const transformedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      location: job.location,
      remote: job.remote,
      type: job.type,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: job.salary_currency,
      status: job.status,
      createdAt: job.created_at,
      publishedAt: job.published_at,
      expiresAt: job.expires_at,
      featured: job.featured,
      urgent: job.urgent,
      _count: {
        applications: job.applications?.length || 0,
      },
    }));

    return NextResponse.json({
      jobs: transformedJobs,
    });
  } catch (error) {
    console.error("Error fetching employer jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
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
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile || profile.role !== EMPLOYER_ROLE) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      remote,
      type,
      salaryMin,
      salaryMax,
      salaryCurrency,
      applicationEmail,
      applicationUrl,
      expiresAt,
      featured,
      urgent,
      skills,
    } = body;

    // Validate required fields
    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get employer profile
    const { data: employer, error: employerError } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (employerError || !employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Validate salary currency (must be EUR for Cyprus)
    if (salaryCurrency && salaryCurrency !== "EUR") {
      return NextResponse.json(
        { error: "Salary must be in EUR (Euro) for Cyprus jobs" },
        { status: 400 }
      );
    }

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        employer_id: employer.id,
        title,
        description,
        requirements: requirements || null,
        responsibilities: responsibilities || null,
        location,
        remote,
        type,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        salary_currency: salaryCurrency || "EUR",
        application_email: applicationEmail || null,
        application_url: applicationUrl || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        featured: featured || false,
        urgent: urgent || false,
  status: DEFAULT_JOB_STATUS,
      })
      .select()
      .single();

    if (jobError) {
      console.error("Error creating job:", jobError);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        // Find or create skill
        const { data: skill, error: skillError } = await supabase
          .from("skills")
          .upsert({
            name: skillName.trim(),
            category: "General",
          })
          .select()
          .single();

        if (skillError) {
          console.error("Error creating skill:", skillError);
          continue;
        }

        // Associate skill with job
        await supabase.from("job_skills").insert({
          job_id: job.id,
          skill_id: skill.id,
        });
      }
    }

    // Log the job creation for audit trail
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "JOB_CREATED",
      entity_type: "Job",
      entity_id: job.id,
      changes: JSON.stringify({
        title,
        location,
        type,
        status: job.status,
      }),
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      id: job.id,
      title: job.title,
      status: job.status,
      message: "Job created successfully",
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}