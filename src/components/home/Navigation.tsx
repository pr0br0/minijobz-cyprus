"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Navigation() {
  const { user } = useSupabaseUser();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleDashboardRedirect = () => {
    if ((user as any)?.role === "JOB_SEEKER") router.push("/dashboard/job-seeker");
    else if ((user as any)?.role === "EMPLOYER") router.push("/dashboard/employer");
  };

  return (
    <nav className="bg-white shadow-sm border-b" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl" aria-hidden>🇨🇾</span>
          <h1 className="text-xl font-bold text-gray-900">
            <Link href="/" aria-label="Cyprus Jobs Home">Cyprus Jobs</Link>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleDashboardRedirect} aria-label="Dashboard">
                <User className="w-4 h-4 mr-2" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/auth/signup"><Button size="sm">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
