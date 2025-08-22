"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Lock, User, Building, MapPin, Phone, Chrome, Shield, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "JOB_SEEKER";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Job Seeker Form State
  const [jobSeekerData, setJobSeekerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    bio: "",
    title: "",
    experience: "",
    education: "",
  });

  // Employer Form State
  const [employerData, setEmployerData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    industry: "",
    description: "",
    address: "",
    city: "",
    postalCode: "",
    companySize: "",
  });

  // GDPR Consent State
  const [gdprConsents, setGdprConsents] = useState({
    dataRetention: false,
    marketing: false,
    jobAlerts: false,
    terms: false,
  });

  const handleJobSeekerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (jobSeekerData.password !== jobSeekerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!gdprConsents.terms) {
      setError("You must agree to the Terms of Service");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register/job-seeker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...jobSeekerData,
          gdprConsents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Please check your email to verify your account.");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (employerData.password !== employerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!gdprConsents.terms) {
      setError("You must agree to the Terms of Service");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register/employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...employerData,
          gdprConsents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Please check your email to verify your account.");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = (userRole: "JOB_SEEKER" | "EMPLOYER") => {
    setLoading(true);
    // This would be handled by NextAuth.js Google provider
    // For now, we'll redirect to sign in
    router.push(`/auth/signin?role=${userRole}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cyprus Jobs</h1>
          <p className="text-gray-600">Create your account and start your journey</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={defaultRole === "EMPLOYER" ? "employer" : "job-seeker"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="job-seeker" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Job Seeker Account
            </TabsTrigger>
            <TabsTrigger value="employer" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Employer Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-seeker">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Registration Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Seeker Registration</CardTitle>
                    <CardDescription>
                      Create your account to find jobs in Cyprus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJobSeekerSubmit} className="space-y-6">
                      {/* Google OAuth */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleGoogleSignUp("JOB_SEEKER")}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Chrome className="w-4 h-4 mr-2" />
                        )}
                        Sign up with Google
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                          </span>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={jobSeekerData.firstName}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, firstName: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={jobSeekerData.lastName}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, lastName: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email-job-seeker">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="email-job-seeker"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={jobSeekerData.email}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="phone"
                              placeholder="+357 99 123456"
                              className="pl-10"
                              value={jobSeekerData.phone}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="location"
                              placeholder="Nicosia, Limassol, Larnaca, etc."
                              className="pl-10"
                              value={jobSeekerData.location}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, location: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Professional Information</h3>
                        <div>
                          <Label htmlFor="title">Professional Title</Label>
                          <Input
                            id="title"
                            placeholder="Software Engineer, Marketing Manager, etc."
                            value={jobSeekerData.title}
                            onChange={(e) => setJobSeekerData({ ...jobSeekerData, title: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Select onValueChange={(value) => setJobSeekerData({ ...jobSeekerData, experience: value })}>
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
                            value={jobSeekerData.education}
                            onChange={(e) => setJobSeekerData({ ...jobSeekerData, education: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <textarea
                            id="bio"
                            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tell us about yourself..."
                            value={jobSeekerData.bio}
                            onChange={(e) => setJobSeekerData({ ...jobSeekerData, bio: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Password</h3>
                        <div>
                          <Label htmlFor="password-job-seeker">Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="password-job-seeker"
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10"
                              value={jobSeekerData.password}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, password: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword-job-seeker">Confirm Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="confirmPassword-job-seeker"
                              type={showConfirmPassword ? "text" : "password"}
                              className="pl-10 pr-10"
                              value={jobSeekerData.confirmPassword}
                              onChange={(e) => setJobSeekerData({ ...jobSeekerData, confirmPassword: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button type="submit" className="w-full" disabled={loading || !gdprConsents.terms}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Create Job Seeker Account
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* GDPR Consent Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      GDPR Compliance
                    </CardTitle>
                    <CardDescription>
                      We take your privacy seriously
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="dataRetention"
                          checked={gdprConsents.dataRetention}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, dataRetention: checked as boolean })}
                        />
                        <Label htmlFor="dataRetention" className="text-sm leading-relaxed">
                          I consent to data retention for 2 years as required for account functionality
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketing"
                          checked={gdprConsents.marketing}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, marketing: checked as boolean })}
                        />
                        <Label htmlFor="marketing" className="text-sm leading-relaxed">
                          I consent to receive marketing communications (optional)
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="jobAlerts"
                          checked={gdprConsents.jobAlerts}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, jobAlerts: checked as boolean })}
                        />
                        <Label htmlFor="jobAlerts" className="text-sm leading-relaxed">
                          I consent to receive job alerts via email (optional)
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={gdprConsents.terms}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, terms: checked as boolean })}
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                          I agree to the{" "}
                          <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>{" "}
                          and{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </Link>{" "}
                          *
                        </Label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Your Rights:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Access your data anytime</li>
                        <li>• Request data deletion</li>
                        <li>• Export your information</li>
                        <li>• Update your preferences</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employer">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Registration Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Employer Registration</CardTitle>
                    <CardDescription>
                      Create your company account to post jobs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEmployerSubmit} className="space-y-6">
                      {/* Google OAuth */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleGoogleSignUp("EMPLOYER")}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Chrome className="w-4 h-4 mr-2" />
                        )}
                        Sign up with Google
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                          </span>
                        </div>
                      </div>

                      {/* Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Company Information</h3>
                        <div>
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            value={employerData.companyName}
                            onChange={(e) => setEmployerData({ ...employerData, companyName: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="industry">Industry *</Label>
                          <Select onValueChange={(value) => setEmployerData({ ...employerData, industry: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="hospitality">Hospitality</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="companySize">Company Size</Label>
                          <Select onValueChange={(value) => setEmployerData({ ...employerData, companySize: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STARTUP">Startup (1-10 employees)</SelectItem>
                              <SelectItem value="SMALL">Small (11-50 employees)</SelectItem>
                              <SelectItem value="MEDIUM">Medium (51-200 employees)</SelectItem>
                              <SelectItem value="LARGE">Large (201-1000 employees)</SelectItem>
                              <SelectItem value="ENTERPRISE">Enterprise (1000+ employees)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            placeholder="https://company.com"
                            value={employerData.website}
                            onChange={(e) => setEmployerData({ ...employerData, website: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Company Description</Label>
                          <textarea
                            id="description"
                            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tell us about your company..."
                            value={employerData.description}
                            onChange={(e) => setEmployerData({ ...employerData, description: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        <div>
                          <Label htmlFor="contactName">Contact Person Name *</Label>
                          <Input
                            id="contactName"
                            value={employerData.contactName}
                            onChange={(e) => setEmployerData({ ...employerData, contactName: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="email-employer">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="email-employer"
                              type="email"
                              placeholder="contact@company.com"
                              className="pl-10"
                              value={employerData.email}
                              onChange={(e) => setEmployerData({ ...employerData, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="contactPhone">Contact Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="contactPhone"
                              placeholder="+357 99 123456"
                              className="pl-10"
                              value={employerData.contactPhone}
                              onChange={(e) => setEmployerData({ ...employerData, contactPhone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="Street address"
                            value={employerData.address}
                            onChange={(e) => setEmployerData({ ...employerData, address: e.target.value })}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="Nicosia, Limassol, etc."
                              value={employerData.city}
                              onChange={(e) => setEmployerData({ ...employerData, city: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              placeholder="1234"
                              value={employerData.postalCode}
                              onChange={(e) => setEmployerData({ ...employerData, postalCode: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Password</h3>
                        <div>
                          <Label htmlFor="password-employer">Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="password-employer"
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10"
                              value={employerData.password}
                              onChange={(e) => setEmployerData({ ...employerData, password: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword-employer">Confirm Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                              id="confirmPassword-employer"
                              type={showConfirmPassword ? "text" : "password"}
                              className="pl-10 pr-10"
                              value={employerData.confirmPassword}
                              onChange={(e) => setEmployerData({ ...employerData, confirmPassword: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button type="submit" className="w-full" disabled={loading || !gdprConsents.terms}>
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Create Employer Account
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* GDPR Consent Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      GDPR Compliance
                    </CardTitle>
                    <CardDescription>
                      We take your privacy seriously
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="dataRetention-employer"
                          checked={gdprConsents.dataRetention}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, dataRetention: checked as boolean })}
                        />
                        <Label htmlFor="dataRetention-employer" className="text-sm leading-relaxed">
                          I consent to data retention for 2 years as required for account functionality
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketing-employer"
                          checked={gdprConsents.marketing}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, marketing: checked as boolean })}
                        />
                        <Label htmlFor="marketing-employer" className="text-sm leading-relaxed">
                          I consent to receive marketing communications (optional)
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms-employer"
                          checked={gdprConsents.terms}
                          onCheckedChange={(checked) => setGdprConsents({ ...gdprConsents, terms: checked as boolean })}
                        />
                        <Label htmlFor="terms-employer" className="text-sm leading-relaxed">
                          I agree to the{" "}
                          <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>{" "}
                          and{" "}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </Link>{" "}
                          *
                        </Label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Your Rights:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Access your data anytime</li>
                        <li>• Request data deletion</li>
                        <li>• Export your information</li>
                        <li>• Update your preferences</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Employer Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Post unlimited jobs (with subscription)</li>
                        <li>• Access candidate database</li>
                        <li>• Advanced search filters</li>
                        <li>• GDPR-compliant data handling</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}