import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface CompaniesQuery {
  page?: string;
  limit?: string;
  search?: string;
  industry?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query: CompaniesQuery = Object.fromEntries(searchParams.entries());

    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search filter
    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { industry: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Industry filter
    if (query.industry) {
      where.industry = { contains: query.industry, mode: "insensitive" };
    }

    // Location filter
    if (query.location) {
      where.jobs = { some: { location: { contains: query.location, mode: "insensitive" } } };
    }

    // Build order by clause
    let orderBy: any = { createdAt: query.sortOrder === "asc" ? "asc" : "desc" };
    
    if (query.sortBy) {
      switch (query.sortBy) {
        case "name":
          orderBy = { companyName: query.sortOrder === "asc" ? "asc" : "desc" };
          break;
        case "jobs":
          orderBy = { jobs: { _count: query.sortOrder === "asc" ? "asc" : "desc" } };
          break;
        case "date":
        default:
          orderBy = { createdAt: query.sortOrder === "asc" ? "asc" : "desc" };
          break;
      }
    }

    // Fetch companies with filters and pagination
    const [companies, total] = await Promise.all([
      db.employer.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              location: true,
            },
            where: {
              status: "PUBLISHED",
            },
            take: 3, // Limit to 3 recent jobs for preview
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              jobs: {
                where: {
                  status: "PUBLISHED",
                },
              },
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      db.employer.count({ where }),
    ]);

    // Transform the response
    const transformedCompanies = companies.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      description: c.description,
      industry: c.industry,
      website: c.website,
      logo: c.logo,
      // Map address/city into a single location field for UI convenience
      location: c.city || c.address || c.country,
      size: c.size, // enum CompanySize | null
      createdAt: c.createdAt.toISOString(),
      email: c.user.email,
      recentJobs: c.jobs.map((j) => ({ id: j.id, title: j.title, createdAt: j.createdAt.toISOString(), location: j.location })),
      counts: { activeJobs: c._count.jobs },
    }));

    // Get unique industries for filtering
    const industries = await db.employer.findMany({
      select: {
        industry: true,
      },
      where: {
        industry: {
          not: null,
        },
      },
      distinct: ["industry"],
    });

    // Get unique locations for filtering
    const locations = await db.job.findMany({
      select: {
        location: true,
      },
      where: {
        status: "PUBLISHED",
      },
      distinct: ["location"],
    });

    return NextResponse.json({
      companies: transformedCompanies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        industries: industries.map((i) => i.industry).filter(Boolean),
        locations: locations.map((l) => l.location).filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}