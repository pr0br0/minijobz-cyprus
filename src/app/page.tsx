// Refactored: Shifted most client logic into modular components to reduce bundle size of root page
// and improve maintainability. This page is now a Server Component wrapper that renders
// smaller client components where necessary.

import { Suspense } from "react";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { Button } from "@/components/ui/button";
import { Search, Shield, Euro, Clock } from "lucide-react";
import { Navigation } from "@/components/home/Navigation";
import { PlatformStats } from "@/components/home/PlatformStats";
import { QuickCategories } from "@/components/home/QuickCategories";

const FEATURES = [
  { icon: <Search className="w-8 h-8 text-blue-600" aria-hidden /> , title: "Smart Job Search", desc: "Advanced filters and AI-powered recommendations to find your perfect job match." },
  { icon: <Shield className="w-8 h-8 text-green-600" aria-hidden /> , title: "GDPR Compliant", desc: "Your data is protected with EU privacy standards and full control over your information." },
  { icon: <Euro className="w-8 h-8 text-yellow-600" aria-hidden /> , title: "Transparent Pricing", desc: "Clear pricing with no hidden fees. Pay-per-post or affordable subscription plans." },
  { icon: <Clock className="w-8 h-8 text-purple-600" aria-hidden /> , title: "Instant Applications", desc: "Apply to jobs with one click and track your application status in real-time." },
];

function Features() {
  return (
    <section className="py-16 bg-white" aria-labelledby="why-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="why-title" className="text-3xl font-bold text-gray-900 mb-4">Why Choose Cyprus Jobs?</h2>
          <p className="text-gray-600">The most trusted job platform in Cyprus</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
          {FEATURES.map(f => (
            <div key={f.title} role="listitem" className="text-center">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12" aria-labelledby="footer-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="footer-heading" className="sr-only">Footer</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl" aria-hidden>🇨🇾</span>
              <h3 className="text-xl font-bold">Cyprus Jobs</h3>
            </div>
            <p className="text-gray-400 mb-4">The leading job platform connecting talent with opportunities across Cyprus.</p>
            <div className="text-sm text-gray-400">Platform Status: Development Mode</div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/jobs" className="hover:text-white">Browse Jobs</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white">Create Profile</Link></li>
              <li><Link href="/job-alerts" className="hover:text-white">Job Alerts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/jobs/post" className="hover:text-white">Post a Job</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white">Employer Signup</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation />
      <main>
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto text-center">
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Find Your Dream Job in <span className="text-blue-600">Cyprus</span></h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">Connect with top employers and discover opportunities across Cyprus. The leading job platform trusted by thousands of professionals.</p>
            <HeroSearch />
            <QuickCategories />
          </div>
        </section>
        <PlatformStats />
        <section className="py-16 bg-gray-50" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="featured-heading" className="text-3xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
              <p className="text-gray-600">Top opportunities from leading employers in Cyprus</p>
            </div>
            <Suspense fallback={<div className="text-center">Loading jobs…</div>}>
              <FeaturedJobs />
            </Suspense>
            <div className="text-center">
              <Link href="/jobs"><Button size="lg" variant="outline">View All Jobs</Button></Link>
            </div>
          </div>
        </section>
        <Features />
      </main>
      <Footer />
    </div>
  );
}