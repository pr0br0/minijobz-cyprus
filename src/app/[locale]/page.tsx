"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Euro, Users, Shield, Clock, Star, ArrowRight, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CitySelector from "@/components/ui/CitySelector";
import { CyprusCity } from "@/lib/constants/cities";

interface Job {
  id: string;
  title: string;
  location: string;
  remote: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  featured: boolean;
  urgent: boolean;
  employer: {
    id: string;
    companyName: string;
    logo: string | null;
  };
  _count: {
    applications: number;
  };
}

export default function Home() {
  const { user, loading: authLoading } = useSupabaseUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<CyprusCity | "">("");
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobSeekers: "1,000+",
    companiesHiring: "50+",
    jobsPosted: "200+",
    successRate: "85%",
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    fetchFeaturedJobs();
    fetchStats();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await fetch('/api/jobs/search?featured=true&limit=6');
      if (response.ok) {
        const data = await response.json();
        setFeaturedJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          activeJobSeekers: `${data.overview.totalJobSeekers}+`,
          companiesHiring: `${data.overview.totalCompanies}+`,
          jobsPosted: `${data.overview.activeJobs}+`,
          successRate: `${data.overview.successRate}%`,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: "Smart Job Search",
      description: "Advanced filters and AI-powered recommendations to find your perfect job match.",
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "GDPR Compliant",
      description: "Your data is protected with EU privacy standards and full control over your information.",
    },
    {
      icon: <Euro className="w-8 h-8 text-yellow-600" />,
      title: "Transparent Pricing",
      description: "Clear pricing with no hidden fees. Pay-per-post or affordable subscription plans.",
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Instant Applications",
      description: "Apply to jobs with one click and track your application status in real-time.",
    },
  ];

  const platformStats = [
    { label: "Active Job Seekers", value: stats.activeJobSeekers },
    { label: "Companies Hiring", value: stats.companiesHiring },
    { label: "Jobs Posted", value: stats.jobsPosted },
    { label: "Success Rate", value: stats.successRate },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (location) params.append('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams();
    params.append('q', category);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSubmitting(true);
    setNewsletterMessage("");

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          name: newsletterName,
          preferences: ['jobs', 'companies', 'resources'],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterMessage("Successfully subscribed! Check your email for confirmation.");
        setNewsletterEmail("");
        setNewsletterName("");
      } else {
        setNewsletterMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterMessage("An error occurred. Please try again later.");
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) {
      console.warn('Supabase client is not configured.');
      router.push("/");
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/");
    }
  };

  const handleDashboardRedirect = () => {
    if (user?.role === "JOB_SEEKER") {
      router.push("/dashboard/job-seeker");
    } else if (user?.role === "EMPLOYER") {
      router.push("/dashboard/employer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Cyprus Jobs
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
                  Browse Jobs
                </Link>
                <Link href="/companies" className="text-gray-600 hover:text-blue-600">
                  Companies
                </Link>
                <Link href="/resources" className="text-gray-600 hover:text-blue-600">
                  Resources
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {authLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {(user as any)?.name || (user as any)?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDashboardRedirect}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Job in{" "}
              <span className="text-yellow-400">Cyprus</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with top employers across the island. GDPR-compliant, secure, and free for job seekers.
            </p>
            
            {/* Job Search */}
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      className="pl-10 h-12 text-gray-900"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <CitySelector
                    value={location}
                    onValueChange={setLocation}
                    placeholder="Select location..."
                    showPopular={true}
                    showDistricts={true}
                  />
                </div>
                <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
                  Search Jobs
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Badge 
                variant="secondary" 
                className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                onClick={() => handleCategoryClick('IT & Technology')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                IT & Technology
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                onClick={() => handleCategoryClick('Marketing')}
              >
                <Users className="w-4 h-4 mr-2" />
                Marketing
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                onClick={() => handleCategoryClick('Finance')}
              >
                <Euro className="w-4 h-4 mr-2" />
                Finance
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                onClick={() => handleCategoryClick('Hospitality')}
              >
                <Star className="w-4 h-4 mr-2" />
                Hospitality
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsLoading ? (
              // Loading skeleton for stats
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center">
                  <div className="h-10 bg-gray-200 rounded mb-2 animate-pulse mx-auto w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-24"></div>
                </div>
              ))
            ) : (
              platformStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for Cyprus job market with GDPR compliance and exceptional user experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Jobs
            </h2>
            <p className="text-xl text-gray-600">
              Discover the latest opportunities from top employers in Cyprus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
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
              ))
            ) : featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{job.type}</Badge>
                        {job.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                        {job.urgent && <Badge className="bg-red-500">Urgent</Badge>}
                      </div>
                    </div>
                    <CardDescription className="text-lg font-medium text-blue-600">
                      {job.employer.companyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location} • {job.remote}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Euro className="w-4 h-4 mr-2" />
                        {job.salaryMin && job.salaryMax 
                          ? `€${job.salaryMin.toLocaleString()} - €${job.salaryMax.toLocaleString()}`
                          : job.salaryMin 
                          ? `€${job.salaryMin.toLocaleString()}+`
                          : job.salaryMax 
                          ? `Up to €${job.salaryMax.toLocaleString()}`
                          : 'Salary not specified'
                        }
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <Button className="w-full mt-4">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No featured jobs available at the moment.</p>
                <p className="text-gray-400 mt-2">Check back later for new opportunities!</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="mr-4">
                View All Jobs
              </Button>
            </Link>
            <Link href="/jobs/post">
              <Button size="lg">
                Post a Job <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from job seekers and employers who found success through our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">MK</span>
                  </div>
                </div>
                <blockquote className="text-gray-600 mb-4 italic">
                  "Found my dream job in just 2 weeks! The platform made it easy to apply and track my applications. Highly recommend!"
                </blockquote>
                <div className="font-semibold text-gray-900">Maria K.</div>
                <div className="text-sm text-gray-500">Software Developer • Nicosia</div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">TP</span>
                  </div>
                </div>
                <blockquote className="text-gray-600 mb-4 italic">
                  "As a startup, we needed to hire quickly. The platform helped us find qualified candidates and we filled our key positions in record time."
                </blockquote>
                <div className="font-semibold text-gray-900">TechPro Cyprus</div>
                <div className="text-sm text-gray-500">CEO • Limassol</div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">AP</span>
                  </div>
                </div>
                <blockquote className="text-gray-600 mb-4 italic">
                  "The GDPR compliance and privacy features gave me confidence to share my information. Great platform for Cyprus job market!"
                </blockquote>
                <div className="font-semibold text-gray-900">Andreas P.</div>
                <div className="text-sm text-gray-500">Marketing Manager • Larnaca</div>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of job seekers and employers in Cyprus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Removed undefined session guard; component should manage auth separately */}
            {true ? (
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" onClick={handleDashboardRedirect}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started as Job Seeker
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Post Your First Job
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Get the latest job opportunities and career insights delivered to your inbox
            </p>
            
            <div className="bg-white rounded-lg shadow-xl p-8">
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 text-gray-900"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Your name (optional)"
                    className="h-12 text-gray-900"
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                  disabled={newsletterSubmitting}
                >
                  {newsletterSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
              <p className="text-sm text-gray-600 mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
              {newsletterMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  newsletterMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {newsletterMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Cyprus Jobs</h3>
              <p className="text-gray-400">
                Your trusted job board for opportunities across Cyprus. GDPR-compliant and secure.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs" className="hover:text-white">Search Jobs</Link></li>
                <li><Link href="/dashboard/job-seeker" className="hover:text-white">Create Profile</Link></li>
                <li><Link href="/applications/guest" className="hover:text-white">Track Applications</Link></li>
                <li><Link href="#" className="hover:text-white">Career Resources</Link></li>
                <li><Link href="/job-alerts" className="hover:text-white">Job Alerts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs/post" className="hover:text-white">Post a Job</Link></li>
                <li><Link href="/billing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/dashboard/employer" className="hover:text-white">Employer Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white">GDPR Compliance</Link></li>
                <li><Link href="#" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cyprus Jobs. All rights reserved. | Compliant with Cyprus Data Protection Laws</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
