"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKeyboardNavigation, useFocusManagement, useScreenReader } from "@/hooks/useAccessibility";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  description?: string;
  badge?: number;
  children?: NavItem[];
}

interface AccessibleNavigationProps {
  items: NavItem[];
  logo?: React.ReactNode;
  userMenu?: React.ReactNode;
  mobileMenu?: React.ReactNode;
}

export function AccessibleNavigation({
  items,
  logo,
  userMenu,
  mobileMenu,
}: AccessibleNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const { saveFocus, restoreFocus } = useFocusManagement();
  const { announceChange } = useScreenReader();
  const { focusedIndex, setFocusedIndex, handleKeyDown } = useKeyboardNavigation();

  const allItems = items.flatMap(item => [item, ...(item.children || [])]);

  const toggleSubmenu = (itemLabel: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
        announceChange(`Submenu for ${itemLabel} collapsed`);
      } else {
        newSet.add(itemLabel);
        announceChange(`Submenu for ${itemLabel} expanded`);
      }
      return newSet;
    });
  };

  const handleItemKeyDown = (
    e: React.KeyboardEvent,
    item: NavItem,
    index: number,
    isSubItem: boolean = false
  ) => {
    if (item.children && !isSubItem) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        toggleSubmenu(item.label);
        setFocusedIndex(index);
      } else if (e.key === "ArrowLeft" && expandedItems.has(item.label)) {
        e.preventDefault();
        toggleSubmenu(item.label);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = item.href;
    }
  };

  const renderNavItem = (item: NavItem, index: number, isSubItem: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const isFocused = focusedIndex === index;

    return (
      <motion.div
        key={item.href}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        <div
          role={hasChildren ? "button" : "link"}
          tabIndex={0}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? "true" : undefined}
          aria-describedby={item.description ? `nav-desc-${index}` : undefined}
          className={`
            flex items-center justify-between w-full px-4 py-2 rounded-lg
            transition-colors duration-200
            ${isFocused ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}
            ${isSubItem ? "ml-6 text-sm" : ""}
          `}
          onKeyDown={(e) => handleItemKeyDown(e, item, index, isSubItem)}
          onFocus={() => setFocusedIndex(index)}
          onClick={() => {
            if (hasChildren && !isSubItem) {
              toggleSubmenu(item.label);
            } else {
              window.location.href = item.href;
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <Badge className="bg-red-500 text-white text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="text-gray-400"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        {/* Description for screen readers */}
        {item.description && (
          <div
            id={`nav-desc-${index}`}
            className="sr-only"
          >
            {item.description}
          </div>
        )}

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children.map((child, childIndex) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      saveFocus();
      setIsMenuOpen(false);
      announceChange("Navigation menu closed");
    } else {
      setIsMenuOpen(true);
      announceChange("Navigation menu opened");
    }
  };

  useEffect(() => {
    if (!isMenuOpen) {
      restoreFocus();
    }
  }, [isMenuOpen, restoreFocus]);

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        toggleMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            {logo}
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              {items.map((item, index) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    aria-describedby={item.description ? `nav-desc-${index}` : undefined}
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.children && (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </Link>
                  
                  {/* Description for screen readers */}
                  {item.description && (
                    <div
                      id={`nav-desc-${index}`}
                      className="sr-only"
                    >
                      {item.description}
                    </div>
                  )}

                  {/* Dropdown submenu */}
                  {item.children && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {userMenu}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-200"
          >
            <div className="p-4 space-y-2">
              {items.map((item, index) => renderNavItem(item, index))}
              
              {/* Mobile user menu */}
              {mobileMenu && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {mobileMenu}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
    </nav>
  );
}