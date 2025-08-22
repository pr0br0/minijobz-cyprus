"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Upload, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Download,
  FileText,
  Star,
  Clock,
  Euro,
  Building2
} from "lucide-react";
import Link from "next/link";
import CitySelector from "@/components/ui/CitySelector";
import { CyprusCity } from "@/lib/constants/cities";

interface JobSeekerProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location: string;
  country: string;
  bio?: string;
  title?: string;
  experience?: number;
  education?: string;
  cvUrl?: string;
  cvFileName?: string;
  cvUploadedAt?: string;
  profileVisibility: "PUBLIC" | "PRIVATE" | "RECRUITERS_ONLY";
  skills: Array<{
    id: string;
    name: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  }>;
}

interface RecommendedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  remote: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  featured: boolean;
  urgent: boolean;
  matchScore: number;
  employer: {
    id: string;
    companyName: string;
    logo: string | null;
    industry: string;
  };
  skills: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    applications: number;
  };
}

function RecommendedJobs() {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const response = await fetch("/api/jobs/recommendations");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        setError("Failed to fetch recommendations");
      }
    } catch (err) {
      setError("An error occurred while fetching recommendations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchRecommendedJobs} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No recommendations yet
        </h3>
        <p className="text-gray-600 mb-4">
          Complete your profile and add skills to get personalized job recommendations.
        </p>
        <Link href="/jobs">
          <Button>Browse All Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-yellow-600">
                      {job.matchScore}% match
                    </span>
                  </div>
                </div>
                <CardDescription className="text-lg font-medium text-blue-600 mb-2">
                  {job.employer.companyName}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location} • {job.remote}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {job.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                {job.urgent && <Badge className="bg-red-500">Urgent</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm line-clamp-2">
                {job.description}
              </p>
              
              {job.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Required Skills:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill.id} variant="outline" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {job.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.employer.industry}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job._count.applications} {job._count.applications === 1 ? "application" : "applications"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/jobs/${job.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                  <Link href={`/jobs/${job.id}#apply`}>
                    <Button size="sm" variant="outline">Apply Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center pt-4">
        <Link href="/jobs">
          <Button variant="outline">
            View All Jobs <Briefcase className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: "BEGINNER" as const });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "" as CyprusCity | "",
    bio: "",
    title: "",
    experience: "",
    education: "",
    profileVisibility: "PUBLIC" as const,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "JOB_SEEKER") {
      router.push("/dashboard/employer");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/job-seeker/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || "",
          location: data.location,
          bio: data.bio || "",
          title: data.title || "",
          experience: data.experience?.toString() || "",
          education: data.education || "",
          profileVisibility: data.profileVisibility,
        });
      } else {
        setError("Failed to fetch profile");
      }
    } catch (error) {
      setError("An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/job-seeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully");
        setEditing(false);
        fetchProfile();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size must be less than 10MB");
      return;
    }

    if (!file.type.includes("pdf") && !file.type.includes("document")) {
      setError("Only PDF and Word documents are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await fetch("/api/job-seeker/upload-cv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess("CV uploaded successfully");
        fetchProfile();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to upload CV");
      }
    } catch (error) {
      setError("An error occurred while uploading CV");
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;

    try {
      const response = await fetch("/api/job-seeker/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSkill),
      });

      if (response.ok) {
        setSuccess("Skill added successfully");
        setNewSkill({ name: "", level: "BEGINNER" });
        fetchProfile();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add skill");
      }
    } catch (error) {
      setError("An error occurred while adding skill");
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const response = await fetch(`/api/job-seeker/skills/${skillId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Skill removed successfully");
        fetchProfile();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove skill");
      }
    } catch (error) {
      setError("An error occurred while removing skill");
    }
  };

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    
    let completeness = 0;
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.location,
      profile.bio,
      profile.title,
      profile.experience,
      profile.education,
      profile.phone,
      profile.cvUrl,
    ];

    completeness = (fields.filter(field => field && field.toString().trim() !== "").length / fields.length) * 100;
    
    // Add bonus for skills
    if (profile.skills.length > 0) {
      completeness += 10;
    }

    return Math.min(completeness, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Cyprus Jobs
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard/job-seeker" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
                  Browse Jobs
                </Link>
                <Link href="/applications" className="text-gray-600 hover:text-blue-600">
                  My Applications
                </Link>
                <Link href="/job-alerts" className="text-gray-600 hover:text-blue-600">
                  Job Alerts
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Summary</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>
                <CardDescription>
                  Manage your job seeker profile and CV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Completeness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Profile Completeness</span>
                    <span className="text-sm text-gray-600">{Math.round(getProfileCompleteness())}%</span>
                  </div>
                  <Progress value={getProfileCompleteness()} className="h-2" />
                </div>

                {/* Quick Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{profile?.firstName} {profile?.lastName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{profile?.title || "No title set"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{profile?.location}, {profile?.country}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{session?.user?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                {/* CV Status */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CV</span>
                    {profile?.cvUrl ? (
                      <Badge variant="secondary">Uploaded</Badge>
                    ) : (
                      <Badge variant="outline">Not uploaded</Badge>
                    )}
                  </div>
                  {profile?.cvUrl && (
                    <div className="text-xs text-gray-600 mb-2">
                      {profile.cvFileName} • {new Date(profile.cvUploadedAt!).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCVUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("cv-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {profile?.cvUrl ? "Update CV" : "Upload CV"}
                    </Button>
                    {profile?.cvUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile Visibility</span>
                    <Badge variant={profile?.profileVisibility === "PUBLIC" ? "default" : "secondary"}>
                      {profile?.profileVisibility}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="recommendations">For You</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal and professional information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          disabled={!editing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          disabled={!editing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        placeholder="Software Engineer, Marketing Manager, etc."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label>Location *</Label>
                      <CitySelector
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                        placeholder="Select city..."
                        showPopular={true}
                        showDistricts={true}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+357 99 123456"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => setFormData({ ...formData, experience: value })}
                        disabled={!editing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Entry Level (0-1 years)</SelectItem>
                          <SelectItem value="2">Junior (2-3 years)</SelectItem>
                          <SelectItem value="4">Mid-level (4-6 years)</SelectItem>
                          <SelectItem value="7">Senior (7-10 years)</SelectItem>
                          <SelectItem value="11">Expert (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        placeholder="Bachelor's, Master's, PhD, etc."
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!editing}
                        rows={4}
                      />
                    </div>

                    {editing && (
                      <div className="flex gap-4">
                        <Button onClick={handleSaveProfile} disabled={saving}>
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                    <CardDescription>
                      Add and manage your professional skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add New Skill */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-4">Add New Skill</h4>
                      <div className="flex gap-4">
                        <Input
                          placeholder="Skill name (e.g., JavaScript, Project Management)"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        />
                        <Select
                          value={newSkill.level}
                          onValueChange={(value: any) => setNewSkill({ ...newSkill, level: value })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                            <SelectItem value="EXPERT">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAddSkill}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Current Skills */}
                    <div>
                      <h4 className="font-medium mb-4">Your Skills</h4>
                      {profile?.skills && profile.skills.length > 0 ? (
                        <div className="grid gap-3">
                          {profile.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{skill.name}</span>
                                <Badge variant="outline">{skill.level}</Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveSkill(skill.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No skills added yet. Add your first skill above!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Recommended Jobs For You
                    </CardTitle>
                    <CardDescription>
                      Personalized job recommendations based on your profile, skills, and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecommendedJobs />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Privacy & GDPR Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your privacy preferences and data rights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Visibility */}
                    <div>
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      <Select
                        value={formData.profileVisibility}
                        onValueChange={(value: any) => setFormData({ ...formData, profileVisibility: value })}
                        disabled={!editing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">
                            Public - Visible to everyone
                          </SelectItem>
                          <SelectItem value="PRIVATE">
                            Private - Only visible to you
                          </SelectItem>
                          <SelectItem value="RECRUITERS_ONLY">
                            Recruiters Only - Visible to employers
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600 mt-1">
                        Control who can see your profile information
                      </p>
                    </div>

                    {/* Data Rights */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Your Data Rights</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Download My Data</span>
                            <p className="text-sm text-gray-600">Export all your personal data</p>
                          </div>
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Delete My Account</span>
                            <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                          </div>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* GDPR Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">GDPR Compliance</h4>
                      <p className="text-sm text-blue-800">
                        We comply with EU General Data Protection Regulation (GDPR). You have the right to access, 
                        rectify, erase, restrict processing, and portability of your personal data.
                      </p>
                    </div>

                    {editing && (
                      <div className="flex gap-4">
                        <Button onClick={handleSaveProfile} disabled={saving}>
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}