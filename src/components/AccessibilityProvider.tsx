"use client";

import { useEffect, useState } from 'react';
import { useReducedMotion, useHighContrast } from '@/hooks/useAccessibility';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "x-large">("normal");
  const [highContrastMode, setHighContrastMode] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const systemHighContrast = useHighContrast();

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.classList.remove("text-normal", "text-large", "text-x-large");
    root.classList.add(`text-${fontSize}`);
    
    // High contrast
    if (highContrastMode || systemHighContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Reduced motion
    if (prefersReducedMotion) {
      root.classList.add("reduce-motion");
    }
  }, [fontSize, highContrastMode, systemHighContrast, prefersReducedMotion]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1: Normal font size
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setFontSize("normal");
      }
      // Alt + 2: Large font size
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setFontSize("large");
      }
      // Alt + 3: Extra large font size
      if (e.altKey && e.key === "3") {
        e.preventDefault();
        setFontSize("x-large");
      }
      // Alt + C: Toggle high contrast
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        setHighContrastMode(prev => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
  {/* SkipLinks temporarily disabled (original component commented out in hook file) */}
      
      {/* Accessibility Controls */}
      <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-gray-700">Accessibility:</span>
          
          <button
            onClick={() => setFontSize("normal")}
            className={`px-2 py-1 rounded ${
              fontSize === "normal" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Normal font size (Alt+1)"
          >
            A
          </button>
          
          <button
            onClick={() => setFontSize("large")}
            className={`px-2 py-1 rounded text-lg ${
              fontSize === "large" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Large font size (Alt+2)"
          >
            A
          </button>
          
          <button
            onClick={() => setFontSize("x-large")}
            className={`px-2 py-1 rounded text-xl ${
              fontSize === "x-large" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Extra large font size (Alt+3)"
          >
            A
          </button>
          
          <div className="w-px h-4 bg-gray-300"></div>
          
          <button
            onClick={() => setHighContrastMode(prev => !prev)}
            className={`px-2 py-1 rounded ${
              highContrastMode ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Toggle high contrast mode (Alt+C)"
          >
            ◐
          </button>
        </div>
      </div>

      {/* Main content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Global styles for accessibility */}
      <style jsx global>{`
        /* Font size classes */
        .text-normal {
          font-size: 16px;
        }
        .text-large {
          font-size: 18px;
        }
        .text-x-large {
          font-size: 20px;
        }

        /* High contrast mode */
        .high-contrast {
          --background: 000000;
          --foreground: #ffffff;
          --muted: #ffffff;
          --muted-foreground: #000000;
          --accent: #ffffff;
          --accent-foreground: #000000;
          --border: #ffffff;
          --input: #ffffff;
          --ring: #ffffff;
        }

        .high-contrast body {
          background-color: #000000 !important;
          color: #ffffff !important;
        }

        .high-contrast .bg-white {
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 2px solid #ffffff !important;
        }

        .high-contrast .bg-gray-50 {
          background-color: #000000 !important;
          color: #ffffff !important;
        }

        .high-contrast .text-gray-900 {
          color: #ffffff !important;
        }

        .high-contrast .text-gray-600 {
          color: #ffffff !important;
        }

        .high-contrast .border-gray-200 {
          border-color: #ffffff !important;
        }

        .high-contrast button {
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 2px solid #ffffff !important;
        }

        .high-contrast button:hover {
          background-color: #ffffff !important;
          color: #000000 !important;
        }

        .high-contrast input,
        .high-contrast textarea,
        .high-contrast select {
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 2px solid #ffffff !important;
        }

        /* Reduced motion */
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        /* Focus visible */
        .focus-visible:focus {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }

        /* Screen reader only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Skip links */
        .sr-only:focus:not(.sr-only) {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }

        /* Landmarks */
        [role="navigation"] {
          outline: none;
        }

        [role="main"] {
          outline: none;
        }

        [role="complementary"] {
          outline: none;
        }

        /* Color contrast indicators */
        .contrast-indicator {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 9999;
        }
      `}</style>
    </>
  );
}