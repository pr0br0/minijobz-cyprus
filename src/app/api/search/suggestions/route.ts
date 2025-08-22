import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { JobStatus } from "@/types/database";

interface SuggestionRequest {
  query?: string;
  type?: 'jobs' | 'skills' | 'companies' | 'locations' | 'all';
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') || 'all') as SuggestionRequest['type'];
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        message: "Query too short. Minimum 2 characters required."
      });
    }

    const results = await Promise.all([
      type === 'all' || type === 'jobs' ? getJobSuggestions(supabase, query, limit) : Promise.resolve([]),
      type === 'all' || type === 'skills' ? getSkillSuggestions(supabase, query, limit) : Promise.resolve([]),
      type === 'all' || type === 'companies' ? getCompanySuggestions(supabase, query, limit) : Promise.resolve([]),
      type === 'all' || type === 'locations' ? getLocationSuggestions(supabase, query, limit) : Promise.resolve([]),
    ]);

    const [jobs, skills, companies, locations] = results;

    return NextResponse.json({
      suggestions: {
        jobs: jobs.slice(0, limit),
        skills: skills.slice(0, limit),
        companies: companies.slice(0, limit),
        locations: locations.slice(0, limit),
      },
      query,
      totalResults: {
        jobs: jobs.length,
        skills: skills.length,
        companies: companies.length,
        locations: locations.length,
      }
    });

  } catch (error) {
    console.error("Error generating search suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getJobSuggestions(supabase: any, query: string, limit: number) {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      location,
      type,
      employers (company_name)
    `)
  .eq("status", 'PUBLISHED')
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("featured", { ascending: false })
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching job suggestions:", error);
    return [];
  }

  return jobs.map((job: any) => ({
    id: job.id,
    text: job.title,
    type: 'job',
    subtitle: `${job.employers.company_name} • ${job.location}`,
    highlight: getHighlightedText(job.title, query),
    url: `/jobs/${job.id}`,
    metadata: {
      location: job.location,
      type: job.type,
      company: job.employers.company_name,
    }
  }));
}

async function getSkillSuggestions(supabase: any, query: string, limit: number) {
  const { data: skills, error } = await supabase
    .from("skills")
    .select(`
      id,
      name,
      category,
      job_skills (count)
    `)
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching skill suggestions:", error);
    return [];
  }

  return skills.map((skill: any) => ({
    id: skill.id,
    text: skill.name,
    type: 'skill',
    subtitle: skill.category ? `${skill.category} • Used in ${skill.job_skills?.length || 0} jobs` : `Used in ${skill.job_skills?.length || 0} jobs`,
    highlight: getHighlightedText(skill.name, query),
    metadata: {
      category: skill.category,
      usageCount: skill.job_skills?.length || 0,
    }
  }));
}

async function getCompanySuggestions(supabase: any, query: string, limit: number) {
  const { data: companies, error } = await supabase
    .from("employers")
    .select(`
      id,
      company_name,
      industry,
      logo,
      city,
      jobs (count)
    `)
    .or(`company_name.ilike.%${query}%,industry.ilike.%${query}%`)
  .eq("jobs.status", 'PUBLISHED')
    .or(`jobs.expires_at.is.null,jobs.expires_at.gte.${new Date().toISOString()}`)
    .order("company_name", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching company suggestions:", error);
    return [];
  }

  return companies.map((company: any) => ({
    id: company.id,
    text: company.company_name,
    type: 'company',
    subtitle: company.industry ? `${company.industry} • ${company.city} • ${company.jobs?.length || 0} jobs` : `${company.city} • ${company.jobs?.length || 0} jobs`,
    highlight: getHighlightedText(company.company_name, query),
    url: `/companies/${company.id}`,
    metadata: {
      industry: company.industry,
      location: company.city,
      jobCount: company.jobs?.length || 0,
      logo: company.logo,
    }
  }));
}

async function getLocationSuggestions(supabase: any, query: string, limit: number) {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("location, remote")
  .eq("status", 'PUBLISHED')
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
    .ilike("location", `%${query}%`)
    .order("location", { ascending: true })
    .limit(limit * 3);

  if (error) {
    console.error("Error fetching location suggestions:", error);
    return [];
  }

  // Group by location and count occurrences
  const locationCounts = jobs.reduce((acc: any, job: any) => {
    const location = job.location;
    if (!acc[location]) {
      acc[location] = {
        location,
        count: 0,
        remoteCount: 0,
      };
    }
    acc[location].count++;
    if (job.remote === 'REMOTE') {
      acc[location].remoteCount++;
    }
    return acc;
  }, {});

  // Convert to array and sort by count
  const locations = Object.values(locationCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, limit);

  return locations.map((loc: any) => ({
    id: loc.location,
    text: loc.location,
    type: 'location',
    subtitle: `${loc.count} job${loc.count > 1 ? 's' : ''}${loc.remoteCount > 0 ? ` • ${loc.remoteCount} remote` : ''}`,
    highlight: getHighlightedText(loc.location, query),
    metadata: {
      jobCount: loc.count,
      remoteCount: loc.remoteCount,
    }
  }));
}

function getHighlightedText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Helper function to get popular searches (for trending suggestions)
async function getPopularSearches(limit: number = 10) {
  try {
    const supabase = createServerClient();
    
    // Get most searched job titles (based on job frequency and applications)
    const { data: popularJobs, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        title,
        applications (count)
      `)
  .eq("status", 'PUBLISHED')
      .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
      .order("applications.count", { ascending: false })
      .order("title", { ascending: true })
      .limit(limit);

    // Get most popular skills
    const { data: popularSkills, error: skillsError } = await supabase
      .from("skills")
      .select(`
        name,
        job_skills (count)
      `)
      .order("job_skills.count", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit);

    // Get most active companies
    const { data: popularCompanies, error: companiesError } = await supabase
      .from("employers")
      .select(`
        company_name,
        jobs (count)
      `)
  .eq("jobs.status", 'PUBLISHED')
      .or(`jobs.expires_at.is.null,jobs.expires_at.gte.${new Date().toISOString()}`)
      .order("jobs.count", { ascending: false })
      .order("company_name", { ascending: true })
      .limit(limit);

    return {
      jobs: (popularJobs || []).map((job: any) => ({
        text: job.title,
        count: job.applications?.length || 0,
      })),
      skills: (popularSkills || []).map((skill: any) => ({
        text: skill.name,
        count: skill.job_skills?.length || 0,
      })),
      companies: (popularCompanies || []).map((company: any) => ({
        text: company.company_name,
        count: company.jobs?.length || 0,
      })),
    };
  } catch (error) {
    console.error("Error getting popular searches:", error);
    return {
      jobs: [],
      skills: [],
      companies: [],
    };
  }
}