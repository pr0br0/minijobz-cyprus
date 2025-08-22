import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { JobStatus } from "@/types/database";

export async function GET() {
  try {
    // Get various platform statistics
    const [
      totalJobsCount,
      activeJobsCount,
      totalCompaniesCount,
      totalJobSeekersCount,
      recentApplicationsCount,
      featuredJobsCount,
      urgentJobsCount
    ] = await Promise.all([
      // Total jobs ever posted
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      
      // Active jobs (published and not expired)
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
  .eq('status', 'PUBLISHED')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()),
      
      // Total companies (employers)
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      
      // Total job seekers
      supabase.from('job_seekers').select('*', { count: 'exact', head: true }),
      
      // Applications in the last 30 days
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('applied_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Featured jobs
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true)
  .eq('status', 'PUBLISHED')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()),
      
      // Urgent jobs
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('urgent', true)
  .eq('status', 'PUBLISHED')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()),
    ]);

    const totalJobs = totalJobsCount.count || 0;
    const activeJobs = activeJobsCount.count || 0;
    const totalCompanies = totalCompaniesCount.count || 0;
    const totalJobSeekers = totalJobSeekersCount.count || 0;
    const recentApplications = recentApplicationsCount.count || 0;
    const featuredJobs = featuredJobsCount.count || 0;
    const urgentJobs = urgentJobsCount.count || 0;

    // Calculate success rate (applications per job)
    const successRate = activeJobs > 0 ? Math.round((recentApplications / activeJobs) * 100) : 0;

    // Get jobs by type distribution using raw SQL for group by
    const { data: jobsByTypeData } = await supabase.rpc('exec_sql', {
      query: `
        SELECT type, COUNT(*) as count
        FROM jobs 
        WHERE status = 'PUBLISHED' 
        AND (expires_at IS NULL OR expires_at > NOW())
        GROUP BY type
        ORDER BY count DESC
      `
    });

    const jobsByType = (jobsByTypeData || []).map((item: any) => ({
      type: item.type,
      _count: { type: parseInt(item.count) }
    }));

    // Get top locations using raw SQL
    const { data: topLocationsData } = await supabase.rpc('exec_sql', {
      query: `
        SELECT location, COUNT(*) as count
        FROM jobs 
        WHERE status = 'PUBLISHED' 
        AND (expires_at IS NULL OR expires_at > NOW())
        GROUP BY location
        ORDER BY count DESC
        LIMIT 5
      `
    });

    const topLocations = (topLocationsData || []).map((item: any) => ({
      location: item.location,
      _count: { location: parseInt(item.count) }
    }));

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [
      newJobsThisWeekCount,
      newCompaniesThisWeekCount,
      newApplicationsThisWeekCount
    ] = await Promise.all([
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)
  .eq('status', 'PUBLISHED'),
      
      supabase
        .from('employers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('applied_at', sevenDaysAgo),
    ]);

    const newJobsThisWeek = newJobsThisWeekCount.count || 0;
    const newCompaniesThisWeek = newCompaniesThisWeekCount.count || 0;
    const newApplicationsThisWeek = newApplicationsThisWeekCount.count || 0;

    return NextResponse.json({
      overview: {
        totalJobs,
        activeJobs,
        totalCompanies,
        totalJobSeekers,
        successRate,
      },
      featured: {
        featuredJobs,
        urgentJobs,
      },
      activity: {
        recentApplications,
        newJobsThisWeek,
        newCompaniesThisWeek,
        newApplicationsThisWeek,
      },
      distribution: {
        jobsByType,
        topLocations,
      },
    });
  } catch (error) {
    console.error("Error fetching platform statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}