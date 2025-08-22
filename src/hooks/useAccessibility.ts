"use client";

import { useEffect, useState, useRef } from "react";

// Keyboard navigation utilities
export const useKeyboardNavigation = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (
    event: React.KeyboardEvent,
    itemsLength: number,
    onEnter?: (index: number) => void
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex(prev => (prev < itemsLength - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : itemsLength - 1));
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && onEnter) {
          onEnter(focusedIndex);
        }
        break;
      case "Escape":
        event.preventDefault();
        setFocusedIndex(-1);
        break;
    }
  };

  return { focusedIndex, setFocusedIndex, handleKeyDown };
};

// Focus management utilities
export const useFocusManagement = () => {
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    lastFocusedRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  };

  return { saveFocus, restoreFocus, trapFocus };
};

// Screen reader announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const announceChange = (message: string) => {
    announce(message, "assertive");
  };

  const announceInfo = (message: string) => {
    announce(message, "polite");
  };

  return { announce, announceChange, announceInfo };
};

// Reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

// High contrast mode detection
export const useHighContrast = () => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      
      const backgroundColor = computedStyle.backgroundColor;
      const textColor = computedStyle.color;
      
      // Simple contrast check
      const isHighContrast = 
        backgroundColor === "rgb(0, 0, 0)" && textColor === "rgb(255, 255, 255)" ||
        backgroundColor === "rgb(255, 255, 255)" && textColor === "rgb(0, 0, 0)";
      
      setHighContrast(isHighContrast);
    };

    checkHighContrast();
    
    // Create an observer to detect theme changes
    const observer = new MutationObserver(checkHighContrast);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, []);

  return highContrast;
};

// Skip links component - Temporarily commented out due to linting issue
// export const SkipLinks = () => {
//   const links = [
//     { href: "#main-content", label: "Skip to main content" },
//     { href: "#navigation", label: "Skip to navigation" },
//     { href: "#search", label: "Skip to search" },
//   ];

//   return (
//     <nav className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-white shadow-lg p-2">
//       {links.map((link) => (
//         <a
//           key={link.href}
//           href={link.href}
//           className="block px-4 py-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           {link.label}
//         </a>
//       ))}
//     </nav>
//   );
// };

// Accessible form utilities
export const useFormAccessibility = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getFieldError = (fieldName: string) => errors[fieldName];
  const setFieldError = (fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };
  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const getAriaDescribedBy = (fieldName: string) => {
    const errorIds = [];
    if (errors[fieldName]) {
      errorIds.push(`${fieldName}-error`);
    }
    return errorIds.length > 0 ? errorIds.join(" ") : undefined;
  };

  return {
    errors,
    getFieldError,
    setFieldError,
    clearFieldError,
    getAriaDescribedBy,
  };
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color library
  const getLuminance = (color: string): number => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(val => 
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsWCAG_AA = (contrastRatio: number): boolean => {
  return contrastRatio >= 4.5;
};

export const meetsWCAG_AAA = (contrastRatio: number): boolean => {
  return contrastRatio >= 7;
};

// Accessible modal utilities
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { saveFocus, restoreFocus, trapFocus } = useFocusManagement();
  const { announceChange } = useScreenReader();

  const open = () => {
    saveFocus();
    setIsOpen(true);
    announceChange("Modal opened");
  };

  const close = () => {
    setIsOpen(false);
    restoreFocus();
    announceChange("Modal closed");
  };

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      return cleanup;
    }
  }, [isOpen, trapFocus]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    modalRef,
  };
};

// Focus visible utility
export const useFocusVisible = () => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleMouseDown = () => {
      setIsFocused(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsFocused(true);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return isFocused;
};