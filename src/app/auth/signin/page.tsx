"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Building, User, Chrome } from "lucide-react";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"JOB_SEEKER" | "EMPLOYER">("JOB_SEEKER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        // Get user session to check role
        const session = await getSession();
        if (session?.user?.role === "JOB_SEEKER") {
          router.push("/dashboard/job-seeker");
        } else if (session?.user?.role === "EMPLOYER") {
          router.push("/dashboard/employer");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = (userRole: "JOB_SEEKER" | "EMPLOYER") => {
    setLoading(true);
    signIn("google", { 
      callbackUrl: userRole === "JOB_SEEKER" ? "/dashboard/job-seeker" : "/dashboard/employer" 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cyprus Jobs</h1>
          <p className="text-gray-600">Welcome back! Sign in to your account</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your account type to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="job-seeker" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="job-seeker" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Job Seeker
                </TabsTrigger>
                <TabsTrigger value="employer" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Employer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="job-seeker" className="space-y-4">
                <div className="space-y-4">
                  {/* Google OAuth */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGoogleSignIn("JOB_SEEKER")}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Chrome className="w-4 h-4 mr-2" />
                    )}
                    Continue with Google
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

                  {/* Email/Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-job-seeker">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <Input
                          id="email-job-seeker"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-job-seeker">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <Input
                          id="password-job-seeker"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gdpr-consent-job-seeker"
                        checked={gdprConsent}
                        onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                      />
                      <Label htmlFor="gdpr-consent-job-seeker" className="text-sm">
                        I agree to the{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms of Service
                        </Link>
                      </Label>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || !gdprConsent}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Sign In as Job Seeker
                    </Button>
                  </form>

                  <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account?</span>
                    <Link
                      href="/auth/signup?role=JOB_SEEKER"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="employer" className="space-y-4">
                <div className="space-y-4">
                  {/* Google OAuth */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGoogleSignIn("EMPLOYER")}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Chrome className="w-4 h-4 mr-2" />
                    )}
                    Continue with Google
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

                  {/* Email/Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-employer">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <Input
                          id="email-employer"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-employer">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <Input
                          id="password-employer"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gdpr-consent-employer"
                        checked={gdprConsent}
                        onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                      />
                      <Label htmlFor="gdpr-consent-employer" className="text-sm">
                        I agree to the{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms of Service
                        </Link>
                      </Label>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || !gdprConsent}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Sign In as Employer
                    </Button>
                  </form>

                  <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account?</span>
                    <Link
                      href="/auth/signup?role=EMPLOYER"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* GDPR Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            This platform is GDPR compliant. Your data is protected under EU privacy laws.
            <br />
            By signing in, you agree to our data processing practices.
          </p>
        </div>
      </div>
    </div>
  );
}