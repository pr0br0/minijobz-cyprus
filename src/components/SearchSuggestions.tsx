"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Building, Briefcase, X, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

interface Suggestion {
  id: string;
  text: string;
  type: 'job' | 'skill' | 'company' | 'location';
  subtitle: string;
  highlight: string;
  url?: string;
  metadata: any;
}

interface SearchSuggestionsProps {
  onSearch?: (query: string, filters?: any) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchSuggestions({ 
  onSearch, 
  placeholder = "Search jobs, skills, companies, locations...",
  className = "" 
}: SearchSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{
    jobs: Suggestion[];
    skills: Suggestion[];
    companies: Suggestion[];
    locations: Suggestion[];
  }>({ jobs: [], skills: [], companies: [], locations: [] });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [popularSearches, setPopularSearches] = useState<{
    jobs: { text: string; count: number }[];
    skills: { text: string; count: number }[];
    companies: { text: string; count: number }[];
  }>({ jobs: [], skills: [], companies: [] });
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions based on debounced query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions({ jobs: [], skills: [], companies: [], locations: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Fetch popular searches on component mount
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=popular&limit=5`);
        if (response.ok) {
          const data = await response.json();
          // For now, we'll use mock data since the popular endpoint isn't implemented yet
          setPopularSearches({
            jobs: [
              { text: "Software Developer", count: 45 },
              { text: "Marketing Manager", count: 32 },
              { text: "Sales Executive", count: 28 },
              { text: "Project Manager", count: 25 },
              { text: "Data Analyst", count: 22 },
            ],
            skills: [
              { text: "JavaScript", count: 89 },
              { text: "Python", count: 76 },
              { text: "Communication", count: 65 },
              { text: "Leadership", count: 58 },
              { text: "Problem Solving", count: 52 },
            ],
            companies: [
              { text: "TechCorp Cyprus", count: 12 },
              { text: "Digital Solutions Ltd", count: 8 },
              { text: "Innovate Cyprus", count: 7 },
              { text: "CyprusTech", count: 6 },
              { text: "Mediterranean Tech", count: 5 },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching popular searches:", error);
      }
    };

    fetchPopularSearches();
  }, []);

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...suggestions.jobs,
      ...suggestions.skills,
      ...suggestions.companies,
      ...suggestions.locations,
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSuggestionClick(allSuggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, query]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.url) {
      router.push(suggestion.url);
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text, { type: suggestion.type });
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSearch = (searchQuery = query, filters?: any) => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery, filters);
      } else {
        const params = new URLSearchParams();
        params.append('q', searchQuery);
        if (filters?.type) {
          params.append('type', filters.type);
        }
        router.push(`/jobs?${params.toString()}`);
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'skill': return <TrendingUp className="w-4 h-4" />;
      case 'company': return <Building className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return "bg-blue-100 text-blue-800";
      case 'skill': return "bg-green-100 text-green-800";
      case 'company': return "bg-purple-100 text-purple-800";
      case 'location': return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const allSuggestions = [
    ...suggestions.jobs,
    ...suggestions.skills,
    ...suggestions.companies,
    ...suggestions.locations,
  ];

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {/* Loading State */}
            {loading && (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            )}

            {/* Suggestions */}
            {!loading && query.length >= 2 && allSuggestions.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                {allSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}`}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="font-medium text-sm truncate"
                            dangerouslySetInnerHTML={{ __html: suggestion.highlight }}
                          />
                          <Badge variant="outline" className={`text-xs ${getTypeColor(suggestion.type)}`}>
                            {suggestion.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {suggestion.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!loading && query.length < 2 && (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.jobs.slice(0, 5).map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-800"
                        onClick={() => handleSuggestionClick({
                          id: `popular-job-${index}`,
                          text: item.text,
                          type: 'job',
                          subtitle: `${item.count} applications`,
                          highlight: item.text,
                          metadata: {}
                        })}
                      >
                        {item.text}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Popular Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.skills.slice(0, 5).map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-green-100 hover:text-green-800"
                        onClick={() => handleSuggestionClick({
                          id: `popular-skill-${index}`,
                          text: item.text,
                          type: 'skill',
                          subtitle: `Used in ${item.count} jobs`,
                          highlight: item.text,
                          metadata: {}
                        })}
                      >
                        {item.text}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Top Companies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.companies.slice(0, 5).map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-purple-100 hover:text-purple-800"
                        onClick={() => handleSuggestionClick({
                          id: `popular-company-${index}`,
                          text: item.text,
                          type: 'company',
                          subtitle: `${item.count} jobs`,
                          highlight: item.text,
                          metadata: {}
                        })}
                      >
                        {item.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && query.length >= 2 && allSuggestions.length === 0 && (
              <div className="p-4 text-center">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No suggestions found</p>
                <p className="text-xs text-gray-500 mt-1">Try different keywords</p>
              </div>
            )}

            {/* Search Action */}
            {query.trim() && (
              <div className="p-3 border-t bg-gray-50">
                <Button 
                  onClick={() => handleSearch()}
                  className="w-full"
                  size="sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search for "{query}"
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// debouncing handled by shared hook