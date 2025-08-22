"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Building2, 
  MapPin, 
  Users, 
  Globe, 
  Calendar, 
  Briefcase,
  Star,
  ArrowRight,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Company {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  website: string;
  logo: string | null;
  location: string;
  size: string;
  founded: number | null;
  createdAt: string;
  email: string;
  recentJobs: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  _count: {
    activeJobs: number;
  };
}

export default function CompaniesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get("industry") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "date");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    industries: [] as string[],
    locations: [] as string[],
  });

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchCompanies();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedIndustry, selectedLocation]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedIndustry) params.append("industry", selectedIndustry);
      if (selectedLocation) params.append("location", selectedLocation);

      const response = await fetch(`/api/companies?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
        setTotalPages(data.totalPages);
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCompanies();
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedIndustry) params.append("industry", selectedIndustry);
    if (selectedLocation) params.append("location", selectedLocation);
    if (sortBy !== "date") params.append("sortBy", sortBy);
    if (sortOrder !== "desc") params.append("sortOrder", sortOrder);
    
    const newURL = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newURL);
  };

  useEffect(() => {
    updateURLParams();
  }, [searchTerm, selectedIndustry, selectedLocation, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600 mt-1">Discover employers hiring in Cyprus</p>
            </div>
            {session?.user?.role === "EMPLOYER" && (
              <Link href="/dashboard/employer">
                <Button>
                  <Building2 className="w-4 h-4 mr-2" />
                  Your Company Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All industries</SelectItem>
                      {filters.industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
                      {filters.locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Added</SelectItem>
                      <SelectItem value="name">Company Name</SelectItem>
                      <SelectItem value="jobs">Number of Jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search companies by name, industry, or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>
              </CardContent>
            </Card>

            {/* Companies Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : companies.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {companies.map((company) => (
                    <Card key={company.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {company.logo ? (
                              <img
                                src={company.logo}
                                alt={company.companyName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl">{company.companyName}</CardTitle>
                              <CardDescription className="text-sm">
                                {company.industry}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {company._count.activeJobs} {company._count.activeJobs === 1 ? "Job" : "Jobs"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {company.description || "No description available."}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {company.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {company.location}
                              </div>
                            )}
                            {company.size && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {company.size}
                              </div>
                            )}
                          </div>

                          {company.recentJobs.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Recent Jobs:
                              </h4>
                              <div className="space-y-1">
                                {company.recentJobs.slice(0, 2).map((job) => (
                                  <Link
                                    key={job.id}
                                    href={`/jobs/${job.id}`}
                                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {job.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Link href={`/companies/${company.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                View Profile
                              </Button>
                            </Link>
                            <Link href={`/jobs?company=${company.id}`} className="flex-1">
                              <Button className="w-full">
                                View Jobs <Briefcase className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10 h-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No companies found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or check back later for new companies.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedIndustry("");
                      setSelectedLocation("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}