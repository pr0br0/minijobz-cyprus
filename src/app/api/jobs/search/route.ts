import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockJobs, filterMockJobs } from "@/lib/mocks/jobs";
import { JobStatus, RemoteType, EmploymentType } from "@/types/database";

interface SearchQuery {
  page?: string;
  limit?: string;
  query?: string;
  location?: string;
  remoteType?: string;
  jobType?: string;
  salaryRange?: string;
  experience?: string;
  industry?: string;
  skills?: string;
  education?: string;
  languages?: string;
  benefits?: string;
  companySize?: string;
  featured?: string;
  urgent?: string;
  sortBy?: string;
  sortOrder?: string;
  postedWithin?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery: SearchQuery = Object.fromEntries(searchParams.entries());

    // MOCK MODE: if env flag set or supabase not configured, return mock data
    const mockEnabled = process.env.MOCK_JOBS === '1' || !supabase;
    if (mockEnabled) {
      const all = filterMockJobs(searchParams);
      const page = parseInt(searchQuery.page || '1');
      const limit = parseInt(searchQuery.limit || '12');
      const offset = (page - 1) * limit;
      const slice = all.slice(offset, offset + limit);
      const transformedJobs = slice.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        remote: job.remote,
        type: job.type,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryCurrency: job.salary_currency,
        createdAt: job.created_at,
        expiresAt: job.expires_at,
        featured: job.featured,
        urgent: job.urgent,
        employer: {
          id: job.employer.id,
          companyName: job.employer.company_name,
          logo: job.employer.logo,
        },
        skills: job.job_skills.map(js => ({ id: js.skill.id, name: js.skill.name })),
        _count: { applications: job.applications_count[0]?.count || 0 },
      }));
      return NextResponse.json({
        jobs: transformedJobs,
        total: all.length,
        page,
        limit,
        totalPages: Math.ceil(all.length / limit),
        mock: true,
      });
    }

    const page = parseInt(searchQuery.page || "1");
    const limit = parseInt(searchQuery.limit || "12");
    const offset = (page - 1) * limit;

    // Build the query using Supabase query builder
    let supabaseQuery = supabase
      .from('jobs')
      .select(`
        *,
        employer:employers!jobs_employer_id_fkey (
          id,
          company_name,
          logo,
          industry
        ),
        job_skills (
          skill:skills (
            id,
            name
          )
        ),
        applications_count:applications(count)
      `, { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    // Text search
    if (searchQuery.query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${searchQuery.query}%,description.ilike.%${searchQuery.query}%,requirements.ilike.%${searchQuery.query}%,responsibilities.ilike.%${searchQuery.query}%`);
    }

    // Location filter
    if (searchQuery.location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${searchQuery.location}%`);
    }

    // Remote type filter
    if (searchQuery.remoteType) {
      const remoteTypes = searchQuery.remoteType.split(",");
      supabaseQuery = supabaseQuery.in('remote', remoteTypes);
    }

    // Job type filter
    if (searchQuery.jobType) {
      const jobTypes = searchQuery.jobType.split(",");
      supabaseQuery = supabaseQuery.in('type', jobTypes);
    }

    // Salary range filter
    if (searchQuery.salaryRange) {
      const [min, max] = searchQuery.salaryRange.split(",").map(Number);
      supabaseQuery = supabaseQuery.gte('salary_min', min).lte('salary_max', max);
    }

    // Skills filter
    if (searchQuery.skills) {
      const skillNames = searchQuery.skills.split(",").map(skill => skill.trim());
      // This is more complex with Supabase, we'll handle it with a separate query
    }

    // Posted within filter
    if (searchQuery.postedWithin) {
      const now = new Date();
      let dateFilter: Date;
      
      switch (searchQuery.postedWithin) {
        case "today":
          dateFilter = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          dateFilter = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          dateFilter = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "3months":
          dateFilter = new Date(now.setMonth(now.getMonth() - 3));
          break;
        default:
          dateFilter = new Date(now.setDate(now.getDate() - 7));
      }
      
      supabaseQuery = supabaseQuery.gte('created_at', dateFilter.toISOString());
    }

    // Industry filter
    if (searchQuery.industry) {
      const industries = searchQuery.industry.split(",");
      supabaseQuery = supabaseQuery.in('employer.industry', industries);
    }

    // Featured filter
    if (searchQuery.featured === "true") {
      supabaseQuery = supabaseQuery.eq('featured', true);
    }

    // Urgent filter
    if (searchQuery.urgent === "true") {
      supabaseQuery = supabaseQuery.eq('urgent', true);
    }

    // Build order by clause
    if (searchQuery.sortBy) {
      switch (searchQuery.sortBy) {
        case "date":
          supabaseQuery = supabaseQuery.order('created_at', { 
            ascending: searchQuery.sortOrder === "asc" 
          });
          break;
        case "salary":
          supabaseQuery = supabaseQuery.order('salary_min', { 
            ascending: searchQuery.sortOrder === "asc" 
          }).order('salary_max', { 
            ascending: searchQuery.sortOrder === "asc" 
          });
          break;
        case "relevance":
          supabaseQuery = supabaseQuery.order('featured', { ascending: false })
                     .order('urgent', { ascending: false })
                     .order('created_at', { ascending: false });
          break;
        case "location":
          supabaseQuery = supabaseQuery.order('location', { 
            ascending: searchQuery.sortOrder === "asc" 
          });
          break;
        case "deadline":
          supabaseQuery = supabaseQuery.order('expires_at', { 
            ascending: searchQuery.sortOrder === "asc" 
          });
          break;
        default:
          supabaseQuery = supabaseQuery.order('featured', { ascending: false })
                     .order('urgent', { ascending: false })
                     .order('created_at', { ascending: false });
      }
    } else {
      supabaseQuery = supabaseQuery.order('featured', { ascending: false })
                 .order('urgent', { ascending: false })
                 .order('created_at', { ascending: false });
    }

    // Execute the query with pagination
    const { data: jobs, error, count } = await supabaseQuery.range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    // Transform the response
    const transformedJobs = (jobs || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      remote: job.remote,
      type: job.type,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: job.salary_currency,
      createdAt: job.created_at,
      expiresAt: job.expires_at,
      featured: job.featured,
      urgent: job.urgent,
      employer: {
        id: job.employer?.id,
        companyName: job.employer?.company_name,
        logo: job.employer?.logo,
      },
      skills: (job.job_skills || []).map((js: any) => ({
        id: js.skill?.id,
        name: js.skill?.name,
      })),
      _count: {
        applications: job.applications_count?.[0]?.count || 0,
      },
    }));

    return NextResponse.json({
      jobs: transformedJobs,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error searching jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}