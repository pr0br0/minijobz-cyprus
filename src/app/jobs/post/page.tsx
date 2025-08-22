"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  MapPin, 
  Euro, 
  Clock, 
  Building, 
  Users, 
  Eye,
  Star,
  AlertTriangle,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  Info,
  Edit
} from "lucide-react";
import Link from "next/link";
import CitySelector from "@/components/ui/CitySelector";
import { CyprusCity } from "@/lib/constants/cities";

interface Skill {
  id: string;
  name: string;
  category?: string;
}

interface CompanyProfile {
  companyName: string;
  description?: string;
  industry?: string;
  logo?: string;
  website?: string;
  city?: string;
}

export default function PostJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "" as CyprusCity | "",
  remote: "ONSITE" as "ONSITE" | "HYBRID" | "REMOTE",
    type: "FULL_TIME" as const,
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "EUR",
    applicationEmail: "",
    applicationUrl: "",
    expiresAt: "",
    featured: false,
    urgent: false,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?role=EMPLOYER");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "EMPLOYER") {
      router.push("/dashboard/job-seeker");
      return;
    }

    if (status === "authenticated") {
      fetchCompanyProfile();
      fetchSkills();
    }
  }, [status, session, router]);

  const fetchCompanyProfile = async () => {
    try {
      const response = await fetch("/api/employer/profile");
      if (response.ok) {
        const data = await response.json();
        setCompanyProfile(data);
        
        // Pre-fill contact email if not set
        if (!formData.applicationEmail) {
          setFormData(prev => ({
            ...prev,
            applicationEmail: data.contactEmail,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
    }
  };

  const fetchSkills = async () => {
    try {
      // For now, we'll use some default skills
      // In a real application, you'd fetch these from the database
      const defaultSkills: Skill[] = [
        { id: "1", name: "JavaScript", category: "Programming" },
        { id: "2", name: "Python", category: "Programming" },
        { id: "3", name: "Java", category: "Programming" },
        { id: "4", name: "React", category: "Frontend" },
        { id: "5", name: "Node.js", category: "Backend" },
        { id: "6", name: "Project Management", category: "Management" },
        { id: "7", name: "Communication", category: "Soft Skills" },
        { id: "8", name: "Leadership", category: "Management" },
        { id: "9", name: "Marketing", category: "Marketing" },
        { id: "10", name: "Sales", category: "Sales" },
        { id: "11", name: "Customer Service", category: "Service" },
        { id: "12", name: "Data Analysis", category: "Analytics" },
      ];
      setAvailableSkills(defaultSkills);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = (skillName: string) => {
    if (skillName && !selectedSkills.includes(skillName)) {
      setSelectedSkills(prev => [...prev, skillName]);
    }
  };

  const removeSkill = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillName));
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "description",
      "location",
      "type",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    // Validate salary (at least one field required and must be EUR)
    if (!formData.salaryMin && !formData.salaryMax) {
      setError("Salary information is required (at least minimum or maximum)");
      return false;
    }

    if (formData.salaryCurrency !== "EUR") {
      setError("Salary must be in EUR (Euro)");
      return false;
    }

    if (formData.salaryMin && formData.salaryMax && parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
      setError("Minimum salary cannot be greater than maximum salary");
      return false;
    }

    // Validate application method
    if (!formData.applicationEmail && !formData.applicationUrl) {
      setError("At least one application method (email or URL) is required");
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          status: "DRAFT",
          skills: selectedSkills,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Job saved as draft successfully!");
        setTimeout(() => {
          router.push("/dashboard/employer");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save job");
      }
    } catch (error) {
      setError("An error occurred while saving the job");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setPublishing(true);
    setError("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
          skills: selectedSkills,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Job published successfully!");
        setTimeout(() => {
          router.push("/dashboard/employer");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to publish job");
      }
    } catch (error) {
      setError("An error occurred while publishing the job");
    } finally {
      setPublishing(false);
    }
  };

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `€${parseInt(min).toLocaleString()} - €${parseInt(max).toLocaleString()}`;
    if (min) return `€${parseInt(min).toLocaleString()}+`;
    if (max) return `Up to €${parseInt(max).toLocaleString()}`;
    return "";
  };

  const getExpiryDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job posting form...</p>
        </div>
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
                <Link href="/dashboard/employer" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/jobs/post" className="text-gray-600 hover:text-blue-600">
                  Post a Job
                </Link>
                <Link href="/jobs/manage" className="text-gray-600 hover:text-blue-600">
                  Manage Jobs
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.email}
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
                <p className="text-gray-600 mt-2">
                  Create a job posting to attract top talent in Cyprus
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? "Edit" : "Preview"}
                </Button>
                <Link href="/dashboard/employer">
                  <Button variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>

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

          {previewMode ? (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{formData.type.replace("_", " ")}</Badge>
                      <Badge variant={formData.remote === "REMOTE" ? "default" : "secondary"}>
                        {formData.remote}
                      </Badge>
                      {formData.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                      {formData.urgent && <Badge variant="destructive">Urgent</Badge>}
                    </div>
                    <CardTitle className="text-2xl">{formData.title || "Job Title"}</CardTitle>
                    <CardDescription className="text-xl text-blue-600">
                      {companyProfile?.companyName || "Company Name"}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{formData.location || "Location"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Euro className="w-5 h-5 mr-2" />
                    <span>{formatSalary(formData.salaryMin, formData.salaryMax)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>{formData.type.replace("_", " ")}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                    <div className="prose max-w-none text-gray-700">
                      {formData.description ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: formData.description.replace(/\n/g, '<br>') 
                        }} />
                      ) : (
                        <p className="text-gray-500">Job description will appear here...</p>
                      )}
                    </div>
                  </div>

                  {formData.responsibilities && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Responsibilities</h3>
                      <div className="text-gray-700">
                        <div dangerouslySetInnerHTML={{ 
                          __html: formData.responsibilities.replace(/\n/g, '<br>') 
                        }} />
                      </div>
                    </div>
                  )}

                  {formData.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                      <div className="text-gray-700">
                        <div dangerouslySetInnerHTML={{ 
                          __html: formData.requirements.replace(/\n/g, '<br>') 
                        }} />
                      </div>
                    </div>
                  )}

                  {selectedSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t">
                    <Button onClick={() => setPreviewMode(false)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Continue Editing
                    </Button>
                    <Button onClick={handlePublish} disabled={publishing}>
                      {publishing ? "Publishing..." : "Publish Job"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Progress Steps */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    {[1, 2, 3].map((stepNumber) => (
                      <div key={stepNumber} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {stepNumber}
                        </div>
                        <div className={`ml-2 text-sm ${
                          step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-600'
                        }`}>
                          {stepNumber === 1 ? 'Job Details' : stepNumber === 2 ? 'Requirements' : 'Publishing'}
                        </div>
                        {stepNumber < 3 && (
                          <div className={`ml-4 w-16 h-0.5 ${
                            step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 1: Job Details */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                      Basic information about the job position
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Senior Software Engineer"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Location *</Label>
                        <CitySelector
                          value={formData.location}
                          onValueChange={(value) => handleInputChange("location", value)}
                          placeholder="Select city..."
                          showPopular={true}
                          showDistricts={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Employment Type *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleInputChange("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                            <SelectItem value="FREELANCE">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="remote">Work Type</Label>
                        <Select
                          value={formData.remote}
                          onValueChange={(value) => handleInputChange("remote", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ONSITE">On-site</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                            <SelectItem value="REMOTE">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="salaryMin">Minimum Salary (EUR) *</Label>
                        <Input
                          id="salaryMin"
                          type="number"
                          placeholder="e.g., 30000"
                          value={formData.salaryMin}
                          onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryMax">Maximum Salary (EUR)</Label>
                        <Input
                          id="salaryMax"
                          type="number"
                          placeholder="e.g., 50000"
                          value={formData.salaryMax}
                          onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryCurrency">Currency</Label>
                        <Select
                          value={formData.salaryCurrency}
                          onValueChange={(value) => handleInputChange("salaryCurrency", value)}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-600 mt-1">Salary must be in EUR for Cyprus jobs</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Job Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={6}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Be specific about the role, company culture, and expectations
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={() => setStep(2)}>
                        Next: Requirements
                      </Button>
                      <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                        {saving ? "Saving..." : "Save Draft"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Requirements */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements & Skills</CardTitle>
                    <CardDescription>
                      Specify the requirements and skills needed for this position
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="responsibilities">Key Responsibilities</Label>
                      <Textarea
                        id="responsibilities"
                        placeholder="List the main responsibilities and day-to-day tasks..."
                        value={formData.responsibilities}
                        onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="requirements">Requirements & Qualifications</Label>
                      <Textarea
                        id="requirements"
                        placeholder="List the required skills, experience, and qualifications..."
                        value={formData.requirements}
                        onChange={(e) => handleInputChange("requirements", e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Required Skills</Label>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Select
                            value={newSkill}
                            onValueChange={(value) => setNewSkill(value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSkills.map((skill) => (
                                <SelectItem key={skill.id} value={skill.name}>
                                  {skill.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={() => {
                              if (newSkill) {
                                addSkill(newSkill);
                                setNewSkill("");
                              }
                            }}
                            disabled={!newSkill || selectedSkills.includes(newSkill)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>

                        {selectedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedSkills.map((skill, index) => (
                              <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                <span className="text-sm">{skill}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 h-4 w-4 p-0 hover:bg-blue-200"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Previous
                      </Button>
                      <Button onClick={() => setStep(3)}>
                        Next: Publishing Options
                      </Button>
                      <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                        {saving ? "Saving..." : "Save Draft"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Publishing Options */}
              {step === 3 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Settings</CardTitle>
                      <CardDescription>
                        Configure how candidates can apply to this job
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="applicationEmail">Application Email</Label>
                          <Input
                            id="applicationEmail"
                            type="email"
                            placeholder="applications@company.com"
                            value={formData.applicationEmail}
                            onChange={(e) => handleInputChange("applicationEmail", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="applicationUrl">Application URL</Label>
                          <Input
                            id="applicationUrl"
                            placeholder="https://company.com/careers/apply"
                            value={formData.applicationUrl}
                            onChange={(e) => handleInputChange("applicationUrl", e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Provide at least one application method (email or URL)
                      </p>

                      <div>
                        <Label htmlFor="expiresAt">Job Expiry Date</Label>
                        <Select
                          value={formData.expiresAt}
                          onValueChange={(value) => handleInputChange("expiresAt", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select expiry date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={getExpiryDate(30)}>30 days from now</SelectItem>
                            <SelectItem value={getExpiryDate(60)}>60 days from now</SelectItem>
                            <SelectItem value={getExpiryDate(90)}>90 days from now</SelectItem>
                            <SelectItem value="">Never expires</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Promotion Options</CardTitle>
                      <CardDescription>
                        Increase visibility for your job posting
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-500 mr-3" />
                          <div>
                            <div className="font-medium">Featured Job</div>
                            <div className="text-sm text-gray-600">
                              Get 3x more views and appear at the top of search results
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€20</div>
                          <Checkbox
                            checked={formData.featured}
                            onCheckedChange={(checked) => handleInputChange("featured", checked)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                          <div>
                            <div className="font-medium">Urgent Job</div>
                            <div className="text-sm text-gray-600">
                              Highlight urgent hiring needs to attract immediate applicants
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€10</div>
                          <Checkbox
                            checked={formData.urgent}
                            onCheckedChange={(checked) => handleInputChange("urgent", checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Review & Publish</CardTitle>
                      <CardDescription>
                        Review your job posting before publishing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Title:</span>
                          <span className="ml-2 font-medium">{formData.title || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium">{formData.location || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">{formData.type.replace("_", " ")}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Salary:</span>
                          <span className="ml-2 font-medium">{formatSalary(formData.salaryMin, formData.salaryMax)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Skills:</span>
                          <span className="ml-2 font-medium">{selectedSkills.length} selected</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Application Method:</span>
                          <span className="ml-2 font-medium">
                            {formData.applicationEmail ? "Email" : ""}
                            {formData.applicationEmail && formData.applicationUrl ? " & " : ""}
                            {formData.applicationUrl ? "URL" : ""}
                            {!formData.applicationEmail && !formData.applicationUrl ? "Not set" : ""}
                          </span>
                        </div>
                      </div>

                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          By publishing this job, you agree to our Terms of Service and GDPR compliance requirements.
                          All salary information must be in EUR (Euro) as required by Cyprus job board regulations.
                        </AlertDescription>
                      </Alert>

                      <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setStep(2)}>
                          Previous
                        </Button>
                        <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                          {saving ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button onClick={() => setPreviewMode(true)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button onClick={handlePublish} disabled={publishing}>
                          {publishing ? "Publishing..." : "Publish Job"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}