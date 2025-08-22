import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ZAI from 'z-ai-web-dev-sdk';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user profile
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        jobSeeker: {
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    if (!user?.jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    const jobSeeker = user.jobSeeker;

    // Get all available jobs
    const allJobs = await db.job.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: {
        employer: {
          include: {
            company: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { urgent: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50 // Limit to 50 jobs for processing
    });

    // Get user's applications to exclude already applied jobs
    const userApplications = await db.application.findMany({
      where: {
        jobSeekerId: jobSeeker.id,
        status: {
          in: ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED']
        }
      },
      select: {
        jobId: true
      }
    });

    const appliedJobIds = new Set(userApplications.map(app => app.jobId));

    // Filter out already applied jobs
    const availableJobs = allJobs.filter(job => !appliedJobIds.has(job.id));

    if (availableJobs.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: "No new jobs available for recommendation"
      });
    }

    // Prepare user profile data for AI/ fallback outside try so it's in scope
    const userProfile = {
        name: jobSeeker.firstName + ' ' + jobSeeker.lastName,
        title: jobSeeker.title || '',
        experience: jobSeeker.experience || 0,
        location: jobSeeker.location,
        bio: jobSeeker.bio || '',
        skills: jobSeeker.skills.map(js => js.skill.name).join(', '),
        education: jobSeeker.education || ''
      };

    try {
      // Initialize ZAI SDK
      const zai = await ZAI.create();

      // Prepare jobs data for AI analysis
      const jobsData = availableJobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.employer.companyName,
        location: job.location,
        type: job.type,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        description: job.description,
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        skills: job.skills.map(js => js.skill.name).join(', '),
        featured: job.featured,
        urgent: job.urgent,
        applicationCount: job._count.applications
      }));

      // Create AI prompt for job recommendations
      const aiPrompt = `
You are a professional career advisor and job matching expert. Based on the job seeker's profile and available job listings, provide personalized job recommendations.

Job Seeker Profile:
- Name: ${userProfile.name}
- Current Title: ${userProfile.title}
- Experience: ${userProfile.experience} years
- Location: ${userProfile.location}
- Skills: ${userProfile.skills}
- Education: ${userProfile.education}
- Bio: ${userProfile.bio}

Available Jobs (JSON format):
${JSON.stringify(jobsData, null, 2)}

Please analyze the job seeker's profile against each job and provide:
1. A relevance score (0-100) for each job
2. Specific reasons why each job matches or doesn't match
3. Personalized recommendations for the top 5 most suitable jobs

Return your response in the following JSON format:
{
  "recommendations": [
    {
      "jobId": "job_id",
      "relevanceScore": 85,
      "matchReasons": ["Reason 1", "Reason 2", "Reason 3"],
      "skillMatch": "Specific skills that match",
      "experienceMatch": "How experience level matches",
      "locationMatch": "Location compatibility analysis",
      "suggestions": ["Application suggestion 1", "Application suggestion 2"]
    }
  ],
  "insights": "Overall career insights and advice for the job seeker"
}

Focus on providing actionable, personalized recommendations that consider skills, experience level, location preferences, and career growth opportunities.
`;

      // Get AI-powered recommendations
      const aiResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert job matching AI that provides personalized career recommendations based on detailed analysis of job seeker profiles and job requirements.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      const aiContent = aiResponse.choices[0]?.message?.content;
      
      if (!aiContent) {
        throw new Error('No response from AI service');
      }

      // Parse AI response
      let aiRecommendations;
      try {
        aiRecommendations = JSON.parse(aiContent);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to basic recommendations if AI response parsing fails
        aiRecommendations = generateFallbackRecommendations(userProfile, availableJobs);
      }

      // Enhance recommendations with full job details
      const enhancedRecommendations = aiRecommendations.recommendations
        .map((rec: any) => {
          const job = availableJobs.find(j => j.id === rec.jobId);
          if (!job) return null;

          return {
            ...rec,
            job: {
              id: job.id,
              title: job.title,
              company: job.employer.companyName,
              location: job.location,
              type: job.type,
              remote: job.remote,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              salaryCurrency: job.salaryCurrency,
              description: job.description,
              requirements: job.requirements,
              featured: job.featured,
              urgent: job.urgent,
              applicationCount: job._count.applications,
              createdAt: job.createdAt,
              employer: {
                companyName: job.employer.companyName,
                logo: job.employer.logo
              }
            }
          };
        })
        .filter(Boolean)
        .slice(0, 10); // Limit to top 10 recommendations

      return NextResponse.json({
        recommendations: enhancedRecommendations,
        insights: aiRecommendations.insights,
        generatedAt: new Date().toISOString()
      });

  } catch (aiError) {
      console.error('AI service error:', aiError);
      // Fallback to basic recommendations if AI service fails
      const fallbackRecommendations = generateFallbackRecommendations(userProfile, availableJobs);
      
      return NextResponse.json({
        recommendations: fallbackRecommendations,
        insights: "AI service temporarily unavailable. Showing basic matches based on skills and location.",
        fallback: true,
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error generating job recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fallback recommendation logic when AI service is unavailable
function generateFallbackRecommendations(userProfile: any, availableJobs: any[]) {
  const userSkills = userProfile.skills.toLowerCase().split(', ').filter(Boolean);
  const userLocation = userProfile.location.toLowerCase();
  
  const scoredJobs = availableJobs.map(job => {
    let score = 0;
    const matchReasons = [];
    
    // Skill matching (40 points)
    const jobSkills = job.skills.toLowerCase().split(', ').filter(Boolean);
    const skillMatches = userSkills.filter(skill => 
      jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    );
    
    if (skillMatches.length > 0) {
      score += Math.min(40, skillMatches.length * 10);
      matchReasons.push(`Skills match: ${skillMatches.join(', ')}`);
    }
    
    // Location matching (30 points)
    if (job.location.toLowerCase().includes(userLocation) || userLocation.includes(job.location.toLowerCase())) {
      score += 30;
      matchReasons.push('Location match');
    } else if (job.remote === 'REMOTE') {
      score += 20;
      matchReasons.push('Remote work opportunity');
    }
    
    // Experience matching (20 points)
    if (userProfile.experience >= 3 && job.title.toLowerCase().includes('senior')) {
      score += 20;
      matchReasons.push('Experience level matches senior position');
    } else if (userProfile.experience < 3 && job.title.toLowerCase().includes('junior')) {
      score += 20;
      matchReasons.push('Experience level matches entry position');
    }
    
    // Featured/urgent jobs (10 points)
    if (job.featured) score += 5;
    if (job.urgent) score += 5;
    
    return {
      jobId: job.id,
      relevanceScore: Math.min(100, score),
      matchReasons: matchReasons,
      skillMatch: skillMatches.join(', ') || 'No direct skill match',
      experienceMatch: `${userProfile.experience} years experience`,
      locationMatch: job.location,
      suggestions: [
        'Highlight relevant skills in your application',
        'Research the company culture before applying',
        'Customize your resume for this position'
      ]
    };
  });
  
  // Sort by score and take top recommendations
  return scoredJobs
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10)
    .map(rec => ({
      ...rec,
      job: availableJobs.find(job => job.id === rec.jobId)
    }))
    .filter(rec => rec.job);
}