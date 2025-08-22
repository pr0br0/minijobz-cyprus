"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  BookOpen, 
  Briefcase, 
  TrendingUp,
  Filter,
  ArrowRight,
  FileText,
  Video,
  Podcast,
  Download
} from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  imageUrl?: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "guide" | "template" | "checklist" | "ebook";
  category: string;
  downloadUrl?: string;
  externalUrl?: string;
  createdAt: string;
}

export default function ResourcesPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Mock data for blog posts
  const mockBlogPosts: BlogPost[] = [
    {
      id: "1",
      title: "How to Write a CV That Gets Noticed in Cyprus",
      excerpt: "Learn the essential tips and tricks to create a standout CV that catches employers' attention in the competitive Cyprus job market.",
      content: "Full article content...",
      category: "CV Writing",
      tags: ["CV", "Job Search", "Cyprus"],
      author: "Maria Georgiou",
      publishedAt: "2024-01-15",
      readTime: 8,
      featured: true,
      imageUrl: "/api/placeholder/600/400"
    },
    {
      id: "2",
      title: "Top 10 In-Demand Skills in Cyprus Tech Industry 2024",
      excerpt: "Discover the most sought-after technical skills that Cyprus employers are looking for this year and how to acquire them.",
      content: "Full article content...",
      category: "Skills Development",
      tags: ["Technology", "Skills", "Career"],
      author: "Andreas Constantinou",
      publishedAt: "2024-01-10",
      readTime: 12,
      featured: true,
      imageUrl: "/api/placeholder/600/400"
    },
    {
      id: "3",
      title: "Mastering the Virtual Interview: Tips for Remote Job Success",
      excerpt: "Comprehensive guide to excelling in virtual interviews, from technical setup to communication strategies.",
      content: "Full article content...",
      category: "Interview Tips",
      tags: ["Interview", "Remote Work", "Technology"],
      author: "Elena Papadopoulos",
      publishedAt: "2024-01-05",
      readTime: 10,
      featured: false
    },
    {
      id: "4",
      title: "Understanding Cyprus Labor Laws: Employee Rights and Benefits",
      excerpt: "A comprehensive overview of employment regulations, minimum wage, working hours, and employee benefits in Cyprus.",
      content: "Full article content...",
      category: "Legal",
      tags: ["Legal", "Rights", "Cyprus"],
      author: "Costas Markou",
      publishedAt: "2023-12-28",
      readTime: 15,
      featured: false
    },
    {
      id: "5",
      title: "Networking Strategies for Job Seekers in Cyprus",
      excerpt: "Learn effective networking techniques to connect with professionals and discover hidden job opportunities in Cyprus.",
      content: "Full article content...",
      category: "Networking",
      tags: ["Networking", "Career", "Strategy"],
      author: "Sophia Nikolaou",
      publishedAt: "2023-12-20",
      readTime: 7,
      featured: false
    },
    {
      id: "6",
      title: "Salary Negotiation: How to Get What You're Worth in Cyprus",
      excerpt: "Essential strategies for negotiating salary packages, benefits, and other compensation in the Cyprus job market.",
      content: "Full article content...",
      category: "Salary",
      tags: ["Salary", "Negotiation", "Career"],
      author: "Michalis Andreas",
      publishedAt: "2023-12-15",
      readTime: 9,
      featured: true
    }
  ];

  // Mock data for resources
  const mockResources: Resource[] = [
    {
      id: "1",
      title: "Cyprus CV Template",
      description: "Professional CV template optimized for Cyprus job market standards",
      type: "template",
      category: "CV Writing",
      downloadUrl: "/templates/cyprus-cv-template.docx",
      createdAt: "2024-01-01"
    },
    {
      id: "2",
      title: "Interview Preparation Checklist",
      description: "Complete checklist to ensure you're fully prepared for any job interview",
      type: "checklist",
      category: "Interview Tips",
      downloadUrl: "/resources/interview-checklist.pdf",
      createdAt: "2024-01-02"
    },
    {
      id: "3",
      title: "Job Search Strategy Guide",
      description: "Comprehensive guide to effective job searching in Cyprus",
      type: "guide",
      category: "Job Search",
      downloadUrl: "/guides/job-search-strategy.pdf",
      createdAt: "2024-01-03"
    },
    {
      id: "4",
      title: "Salary Negotiation Ebook",
      description: "Complete ebook on mastering salary negotiations",
      type: "ebook",
      category: "Salary",
      downloadUrl: "/ebooks/salary-negotiation.pdf",
      createdAt: "2024-01-04"
    },
    {
      id: "5",
      title: "LinkedIn Optimization Guide",
      description: "Step-by-step guide to optimizing your LinkedIn profile",
      type: "guide",
      category: "Networking",
      externalUrl: "https://example.com/linkedin-guide",
      createdAt: "2024-01-05"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBlogPosts(mockBlogPosts);
      setResources(mockResources);
      setLoading(false);
    }, 500);
  }, []);

  const categories = ["all", ...new Set([...blogPosts.map(p => p.category), ...resources.map(r => r.category)])];
  const types = ["all", "guide", "template", "checklist", "ebook"];

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "guide": return <BookOpen className="w-4 h-4" />;
      case "template": return <FileText className="w-4 h-4" />;
      case "checklist": return <Briefcase className="w-4 h-4" />;
      case "ebook": return <Download className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Career Resources</h1>
              <p className="text-gray-600 mt-1">
                Expert advice, guides, and tools to advance your career in Cyprus
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search articles, guides, and resources..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.filter(cat => cat !== "all").map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.filter(type => type !== "all").map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Articles */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-yellow-500">Featured</Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime} min read
                      </div>
                    </div>
                    <Button className="w-full">
                      Read Article <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="articles">Articles & Blog</TabsTrigger>
            <TabsTrigger value="resources">Downloads & Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
              <div className="text-sm text-gray-600">
                {filteredBlogPosts.length} article{filteredBlogPosts.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {filteredBlogPosts.length > 0 ? (
              <div className="grid gap-6">
                {filteredBlogPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-48 lg:h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            {post.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.publishedAt)}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 mb-4">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {post.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime} min read
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm">Read More</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Downloads & Tools</h2>
              <div className="text-sm text-gray-600">
                {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {filteredResources.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-blue-600">
                          {getTypeIcon(resource.type)}
                          <span className="text-sm font-medium capitalize">{resource.type}</span>
                        </div>
                        <Badge variant="outline">{resource.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {resource.downloadUrl && (
                          <Button size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        {resource.externalUrl && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No resources found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedType("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="pt-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                Stay Updated with Career Insights
              </h3>
              <p className="text-blue-100 mb-6">
                Get the latest career advice, job market trends, and exclusive resources delivered to your inbox.
              </p>
              <Link href="/#newsletter">
                <Button variant="secondary" size="lg">
                  Subscribe to Newsletter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}