"use client";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CitySelector from "@/components/ui/CitySelector";
import { CyprusCity } from "@/lib/constants/cities";
import { useRouter } from "next/navigation";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<CyprusCity | "">("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (location) params.append("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8" role="search">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="sr-only" htmlFor="job-search">Search jobs</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="job-search"
              placeholder="Job title, keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="md:w-64">
          <label className="sr-only" htmlFor="location-select">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <CitySelector
              value={location}
              onValueChange={setLocation}
              placeholder="Select location..."
              className="pl-10 h-12"
            />
          </div>
        </div>
        <Button onClick={handleSearch} size="lg" className="h-12 px-8" aria-label="Search jobs">
          Search Jobs
        </Button>
      </div>
    </div>
  );
}
