"use client";

import { useState, useEffect } from "react";
import { Cookie, Shield, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline?: () => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    onAccept(preferences);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allPreferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    onAccept(allPreferences);
    setIsVisible(false);
  };

  const handleDecline = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(minimalPreferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    if (onDecline) {
      onDecline();
    }
    setIsVisible(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/90 backdrop-blur-sm border-t border-gray-700">
      <div className="container mx-auto max-w-6xl">
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Cookie className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-white">
                    We Value Your Privacy
                  </CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    We use cookies to enhance your experience, analyze site traffic, and serve personalized content. 
                    Your privacy is important to us.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!showDetails ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Accept All Cookies
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(true)}
                  className="border-gray-600 text-white hover:bg-gray-800 flex-1"
                >
                  Customize Preferences
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDecline}
                  className="text-gray-400 hover:text-white flex-1"
                >
                  Accept Necessary Only
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">Necessary Cookies</h4>
                          <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                            Always Required
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          Essential for the website to function properly. Includes authentication, security, and basic functionality.
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={preferences.necessary}
                      disabled
                      className="mt-1"
                    />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Info className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">Analytics Cookies</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            Optional
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          Help us understand how you use our website to improve your experience. All data is anonymized.
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => updatePreference('analytics', checked as boolean)}
                      className="mt-1"
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Cookie className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">Marketing Cookies</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            Optional
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          Used to deliver personalized advertisements and track marketing campaign effectiveness.
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => updatePreference('marketing', checked as boolean)}
                      className="mt-1"
                    />
                  </div>

                  {/* Preference Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Cookie className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">Preference Cookies</h4>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            Optional
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          Remember your preferences such as language, region, and customization options.
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={preferences.preferences}
                      onCheckedChange={(checked) => updatePreference('preferences', checked as boolean)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleAccept}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    Save Preferences
                  </Button>
                  <Button 
                    onClick={handleAcceptAll}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800 flex-1"
                  >
                    Accept All
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-white flex-1"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-400">
                By using our site, you agree to our{" "}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}