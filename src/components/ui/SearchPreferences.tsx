"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save, 
  Search, 
  Bell, 
  BellOff, 
  Trash2, 
  Clock, 
  Settings,
  Plus,
  X
} from "lucide-react";
import { CyprusCity } from "@/lib/constants/cities";

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  location: CyprusCity | "";
  filters: any;
  alertEnabled: boolean;
  alertFrequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  createdAt: string;
  lastUsed?: string;
  jobCount?: number;
}

interface SearchPreferencesProps {
  currentFilters?: any;
  onSaveSearch?: (search: {
    name: string;
    query: string;
    location: CyprusCity | '';
    filters: any;
    alertEnabled: boolean;
    alertFrequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  }) => void;
}

export default function SearchPreferences({ currentFilters, onSaveSearch }: SearchPreferencesProps) {
  const { data: session } = useSession();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState<'INSTANT' | 'DAILY' | 'WEEKLY'>('DAILY');

  useEffect(() => {
    if (session) {
      fetchSearchData();
    }
  }, [session]);

  const fetchSearchData = async () => {
    try {
      const [savedRes, recentRes] = await Promise.all([
        fetch('/api/user/saved-searches'),
        fetch('/api/user/recent-searches')
      ]);

      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedSearches(savedData.searches || []);
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecentSearches(recentData.searches || []);
      }
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!newSearchName.trim() || !currentFilters) return;

    try {
      const searchToSave = {
        name: newSearchName.trim(),
        query: currentFilters.query || "",
        location: currentFilters.location || "",
        filters: currentFilters,
        alertEnabled,
        alertFrequency
      };

      const response = await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchToSave),
      });

      if (response.ok) {
        const created = await response.json();
  setSavedSearches(prev => [created, ...prev]);
        setNewSearchName("");
        setShowSaveDialog(false);
        if (onSaveSearch) {
          onSaveSearch(searchToSave);
        }
      }
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/user/saved-searches/${searchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      }
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleToggleAlert = async (searchId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/user/saved-searches/${searchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertEnabled: enabled }),
      });

      if (response.ok) {
        setSavedSearches(prev => 
          prev.map(search => 
            search.id === searchId 
              ? { ...search, alertEnabled: enabled }
              : search
          )
        );
      }
    } catch (error) {
      console.error('Error updating search alert:', error);
    }
  };

  const handleUseSearch = (search: SavedSearch) => {
    if (onSaveSearch) {
      onSaveSearch({
        name: search.name,
        query: search.query,
        location: search.location,
        filters: search.filters,
        alertEnabled: search.alertEnabled,
        alertFrequency: search.alertFrequency
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getFilterSummary = (filters: any) => {
    const parts = [];
    
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.location) parts.push(filters.location);
    if (filters.jobType?.length) parts.push(`${filters.jobType.length} job types`);
    if (filters.remoteType?.length) parts.push(`${filters.remoteType.length} remote types`);
    if (filters.experience?.length) parts.push(`${filters.experience.length} experience levels`);
    if (filters.skills?.length) parts.push(`${filters.skills.length} skills`);
    if (filters.salaryRange?.[1] > 0) parts.push(`Salary up to €${filters.salaryRange[1]}`);
    
    return parts.length > 0 ? parts.join(" • ") : "All jobs";
  };

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Search Preferences
          </CardTitle>
          <CardDescription>
            Sign in to save your searches and get job alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Save your search criteria and get notified when new jobs match your preferences
            </p>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Sign In to Save Searches
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Current Search */}
      {currentFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Current Search
            </CardTitle>
            <CardDescription>
              Save your current search criteria to quickly access it later
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  {getFilterSummary(currentFilters)}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alert-enabled"
                      checked={alertEnabled}
                      onCheckedChange={setAlertEnabled}
                    />
                    <Label htmlFor="alert-enabled">Enable job alerts</Label>
                  </div>
                  {alertEnabled && (
                    <Select value={alertFrequency} onValueChange={(value: 'INSTANT' | 'DAILY' | 'WEEKLY') => setAlertFrequency(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INSTANT">Instant</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <Button onClick={() => setShowSaveDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Save Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Save Search</span>
              <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-name">Search Name</Label>
                <Input
                  id="search-name"
                  placeholder="e.g., Remote Tech Jobs in Nicosia"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSearch} disabled={!newSearchName.trim()}>
                  Save Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Saved Searches & Alerts
          </CardTitle>
          <CardDescription>
            Your saved job searches with notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading saved searches...</p>
            </div>
          ) : savedSearches.length > 0 ? (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{search.name}</h3>
                      <Badge variant={search.alertEnabled ? "default" : "secondary"}>
                        {search.alertEnabled ? (
                          <>
                            <Bell className="w-3 h-3 mr-1" />
                            {search.alertFrequency}
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3 h-3 mr-1" />
                            Disabled
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getFilterSummary(search.filters)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Saved {formatDate(search.createdAt)}
                      </span>
                      {search.lastUsed && (
                        <span>Used {formatDate(search.lastUsed)}</span>
                      )}
                      {search.jobCount !== undefined && (
                        <span>{search.jobCount} jobs found</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={search.alertEnabled}
                      onCheckedChange={(checked) => handleToggleAlert(search.id, checked)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleUseSearch(search)}>
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSearch(search.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No saved searches yet. Save your current search to get started!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Searches
            </CardTitle>
            <CardDescription>
              Your recent job searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleUseSearch(search)}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {search.query || "All jobs"}
                      {search.location && ` in ${search.location}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(search.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}