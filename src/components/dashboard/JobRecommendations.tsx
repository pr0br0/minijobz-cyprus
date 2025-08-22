"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, MapPin, Briefcase, Euro, Clock, Star, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remote: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  description: string;
  requirements: string | null;
  featured: boolean;
  urgent: boolean;
  applicationCount: number;
  createdAt: string;
  employer: {
    companyName: string;
    logo: string | null;
  };
}

interface Recommendation {
  jobId: string;
  relevanceScore: number;
  matchReasons: string[];
  skillMatch: string;
  experienceMatch: string;
  locationMatch: string;
  suggestions: string[];
  job: Job;
}

interface JobRecommendationsProps {
  limit?: number;
}

export default function JobRecommendations({ limit = 5 }: JobRecommendationsProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (session) {
      fetchRecommendations();
    }
  }, [session]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/jobs/recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations.slice(0, limit));
      setInsights(data.insights || "");
      setFallback(data.fallback || false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Unable to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Job Recommendations
          </CardTitle>
          <CardDescription>
            Sign in to get personalized job recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/signin">
            <Button className="w-full">Sign In to Get Recommendations</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Job Recommendations
                {fallback && (
                  <Badge variant="outline" className="ml-2">
                    Basic Matching
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Personalized job recommendations based on your profile and preferences
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecommendations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* AI Insights */}
      {insights && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />
              Career Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">{insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded mt-4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.jobId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{recommendation.job.title}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`text-sm font-medium ${getScoreColor(recommendation.relevanceScore)}`}
                      >
                        {getScoreLabel(recommendation.relevanceScore)} ({recommendation.relevanceScore}%)
                      </Badge>
                      {recommendation.job.featured && (
                        <Badge className="bg-yellow-500">Featured</Badge>
                      )}
                      {recommendation.job.urgent && (
                        <Badge className="bg-red-500">Urgent</Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">
                      {recommendation.job.company} • {recommendation.job.location}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{recommendation.job.type}</Badge>
                    {recommendation.job.remote === 'REMOTE' && (
                      <Badge variant="outline">Remote</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Match Analysis */}
                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Why this job matches you:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {recommendation.matchReasons.slice(0, 3).map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Skills:</span>
                      <p className="text-gray-600">{recommendation.skillMatch}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p className="text-gray-600">{recommendation.experienceMatch}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-600">{recommendation.locationMatch}</p>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {recommendation.job.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {recommendation.job.location}
                  </div>
                  {recommendation.job.salaryMin && recommendation.job.salaryMax && (
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {recommendation.job.salaryMin.toLocaleString()} - {recommendation.job.salaryMax.toLocaleString()} {recommendation.job.salaryCurrency}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recommendation.job.applicationCount} applications
                  </div>
                </div>

                {/* Suggestions */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Application suggestions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.suggestions.slice(0, 3).map((suggestion, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href={`/jobs/${recommendation.jobId}`}>
                    <Button className="flex-1">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href={`/jobs/${recommendation.jobId}#apply`}>
                    <Button variant="outline">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Recommendations */}
      {!loading && !error && recommendations.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recommendations Available
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't find personalized recommendations for you at the moment. 
                This might be because you've already applied to all matching jobs or your profile needs more details.
              </p>
              <Link href="/dashboard/job-seeker">
                <Button>Update Your Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}