"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Euro, 
  Clock, 
  Building, 
  Filter,
  X,
  ChevronDown,
  Grid,
  List,
  Heart,
  Share2,
  Star,
  Zap,
  Users,
  Award
} from "lucide-react";
import CitySelector from "@/components/ui/CitySelector";
import { CyprusCity } from "@/lib/constants/cities";

interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface AdvancedSearchFilters {
  query: string;
  location: CyprusCity | "";
  remoteType: string[];
  jobType: string[];
  salaryRange: [number, number];
  experience: string[];
  industry: string[];
  skills: string[];
  education: string[];
  languages: string[];
  benefits: string[];
  companySize: string[];
  featured: boolean;
  urgent: boolean;
  postedWithin: string;
  sortBy: "relevance" | "date" | "salary" | "company" | "applications" | "location" | "deadline" | "distance";
  sortOrder: "asc" | "desc";
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  initialFilters?: Partial<AdvancedSearchFilters>;
}

export default function AdvancedSearch({ onFiltersChange, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: "",
    location: "",
    remoteType: [],
    jobType: [],
    salaryRange: [0, 200000],
    experience: [],
    industry: [],
    skills: [],
    education: [],
    languages: [],
    benefits: [],
    companySize: [],
    featured: false,
    urgent: false,
    postedWithin: "",
    sortBy: "relevance",
    sortOrder: "desc",
    ...initialFilters
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [popularSkills, setPopularSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Available options for filters
  const remoteOptions = [
    { value: "ONSITE", label: "On-site" },
    { value: "HYBRID", label: "Hybrid" },
    { value: "REMOTE", label: "Remote" },
  ];

  const jobTypeOptions = [
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "FREELANCE", label: "Freelance" },
  ];

  const experienceOptions = [
    { value: "0", label: "Entry Level (0-1 years)", icon: <Award className="w-4 h-4" /> },
    { value: "2", label: "Junior (2-3 years)", icon: <Users className="w-4 h-4" /> },
    { value: "4", label: "Mid-level (4-6 years)", icon: <Star className="w-4 h-4" /> },
    { value: "7", label: "Senior (7-10 years)", icon: <Zap className="w-4 h-4" /> },
    { value: "11", label: "Expert (10+ years)", icon: <Award className="w-4 h-4" /> },
  ];

  const industryOptions = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "hospitality", label: "Hospitality" },
    { value: "retail", label: "Retail" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "consulting", label: "Consulting" },
    { value: "real_estate", label: "Real Estate" },
    { value: "construction", label: "Construction" },
  ];

  const postedWithinOptions = [
    { value: "", label: "Any time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "3months", label: "Last 3 months" },
  ];

  const sortByOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "date", label: "Date Posted" },
    { value: "salary", label: "Salary" },
    { value: "company", label: "Company" },
    { value: "applications", label: "Application Count" },
    { value: "location", label: "Location" },
    { value: "deadline", label: "Application Deadline" },
    { value: "distance", label: "Distance" },
  ];

  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "certificate", label: "Certificate" },
    { value: "diploma", label: "Diploma" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "greek", label: "Greek" },
    { value: "russian", label: "Russian" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "spanish", label: "Spanish" },
    { value: "arabic", label: "Arabic" },
  ];

  const benefitsOptions = [
    { value: "health_insurance", label: "Health Insurance" },
    { value: "dental_insurance", label: "Dental Insurance" },
    { value: "vision_insurance", label: "Vision Insurance" },
    { value: "retirement_plan", label: "Retirement Plan" },
    { value: "paid_time_off", label: "Paid Time Off" },
    { value: "sick_leave", label: "Sick Leave" },
    { value: "maternity_leave", label: "Maternity Leave" },
    { value: "paternity_leave", label: "Paternity Leave" },
    { value: "flexible_hours", label: "Flexible Hours" },
    { value: "remote_work", label: "Remote Work" },
    { value: "training", label: "Training & Development" },
    { value: "gym_membership", label: "Gym Membership" },
    { value: "company_car", label: "Company Car" },
    { value: "phone_allowance", label: "Phone Allowance" },
    { value: "meal_allowance", label: "Meal Allowance" },
  ];

  const companySizeOptions = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1000+", label: "1000+ employees" },
  ];

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills);
        setPopularSkills(data.popularSkills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoadingSkills(false);
    }
  };

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayFilter = (key: keyof AdvancedSearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [key]: newArray,
      };
    });
  };

  const addSkill = (skillName: string) => {
    if (!filters.skills.includes(skillName)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skillName]
      }));
    }
  };

  const removeSkill = (skillName: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillName)
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      location: "",
      remoteType: [],
      jobType: [],
      salaryRange: [0, 200000],
      experience: [],
      industry: [],
      skills: [],
      education: [],
      languages: [],
      benefits: [],
      companySize: [],
      featured: false,
      urgent: false,
      postedWithin: "",
      sortBy: "relevance",
      sortOrder: "desc",
    });
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const activeFiltersCount = [
    filters.remoteType.length,
    filters.jobType.length,
    filters.experience.length,
    filters.industry.length,
    filters.skills.length,
    filters.education.length,
    filters.languages.length,
    filters.benefits.length,
    filters.companySize.length,
    filters.featured ? 1 : 0,
    filters.urgent ? 1 : 0,
    filters.postedWithin ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Search
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {/* Keywords */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Keywords</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Job title, keywords, or company"
                  className="pl-10"
                  value={filters.query}
                  onChange={(e) => updateFilter("query", e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Location</Label>
              <CitySelector
                value={filters.location}
                onValueChange={(value) => updateFilter("location", value)}
                placeholder="Select location..."
                showPopular={true}
                showDistricts={true}
              />
            </div>

            {/* Job Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Job Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {jobTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`job-type-${option.value}`}
                      checked={filters.jobType.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("jobType", option.value)}
                    />
                    <Label htmlFor={`job-type-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Remote Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Work Type</Label>
              <div className="flex flex-wrap gap-3">
                {remoteOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={filters.remoteType.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter("remoteType", option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            {/* Experience Level */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Experience Level</Label>
              <div className="space-y-3">
                {experienceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`exp-${option.value}`}
                      checked={filters.experience.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("experience", option.value)}
                    />
                    <div className="flex items-center space-x-2">
                      {option.icon}
                      <Label htmlFor={`exp-${option.value}`} className="text-sm font-medium">
                        {option.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Salary Range: €{filters.salaryRange[0].toLocaleString()} - €{filters.salaryRange[1].toLocaleString()}
              </Label>
              <Slider
                value={filters.salaryRange}
                onValueChange={(value) => updateFilter("salaryRange", value)}
                max={200000}
                min={0}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>€0</span>
                <span>€200,000+</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            {/* Selected Skills */}
            {filters.skills.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Selected Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer">
                      {skill}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Skills */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Popular Skills</Label>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant={filters.skills.includes(skill.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => addSkill(skill.name)}
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skill Search */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Search Skills</Label>
              <Input
                placeholder="Type to search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
              <div className="mt-3 max-h-40 overflow-y-auto border rounded-lg p-2">
                {loadingSkills ? (
                  <div className="text-center text-gray-500">Loading skills...</div>
                ) : (
                  filteredSkills.slice(0, 10).map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => addSkill(skill.name)}
                    >
                      <span className="text-sm">{skill.name}</span>
                      {skill.category && (
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            {/* Education Level */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Education Level</Label>
              <div className="grid grid-cols-2 gap-3">
                {educationOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`education-${option.value}`}
                      checked={filters.education.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("education", option.value)}
                    />
                    <Label htmlFor={`education-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Language Requirements</Label>
              <div className="grid grid-cols-2 gap-3">
                {languageOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`language-${option.value}`}
                      checked={filters.languages.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("languages", option.value)}
                    />
                    <Label htmlFor={`language-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Benefits & Perks</Label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {benefitsOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`benefits-${option.value}`}
                      checked={filters.benefits.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("benefits", option.value)}
                    />
                    <Label htmlFor={`benefits-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Size */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Company Size</Label>
              <div className="grid grid-cols-2 gap-3">
                {companySizeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`companySize-${option.value}`}
                      checked={filters.companySize.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("companySize", option.value)}
                    />
                    <Label htmlFor={`companySize-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Industry */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Industry</Label>
              <div className="grid grid-cols-2 gap-3">
                {industryOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`industry-${option.value}`}
                      checked={filters.industry.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("industry", option.value)}
                    />
                    <Label htmlFor={`industry-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Posted Within */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Posted Within</Label>
              <Select value={filters.postedWithin} onValueChange={(value) => updateFilter("postedWithin", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  {postedWithinOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filters */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Filters</Label>
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant={filters.featured ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateFilter("featured", !filters.featured)}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Featured Jobs
                </Badge>
                <Badge
                  variant={filters.urgent ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateFilter("urgent", !filters.urgent)}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Urgent Jobs
                </Badge>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Sort By</Label>
              <div className="flex gap-3">
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortByOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}