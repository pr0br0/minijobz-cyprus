"use client";

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFocusVisible, useScreenReader } from '@/hooks/useAccessibility';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  announcement?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    disabled,
    loading = false,
    loadingText = "Loading...",
    icon,
    iconPosition = "left",
    announcement,
    onClick,
    ...props
  }, ref) => {
    const isFocusVisible = useFocusVisible();
    const { announceChange } = useScreenReader();
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      
      setIsPressed(true);
      
      if (announcement) {
        announceChange(announcement);
      }
      
      if (onClick) {
        onClick(e);
      }
      
      // Reset pressed state after animation
      setTimeout(() => setIsPressed(false), 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const mouseEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        e.currentTarget.dispatchEvent(mouseEvent);
      }
    };

    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative overflow-hidden
          ${isFocusVisible ? "ring-2 ring-blue-500 ring-offset-2" : ""}
          ${isPressed ? "scale-95" : ""}
          transition-all duration-200
        `}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/50 flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* Button content */}
        <span className={`flex items-center ${loading ? "invisible" : "visible"}`}>
          {icon && iconPosition === "left" && (
            <span className="mr-2" aria-hidden="true">
              {icon}
            </span>
          )}
          <span>{loading ? loadingText : children}</span>
          {icon && iconPosition === "right" && (
            <span className="ml-2" aria-hidden="true">
              {icon}
            </span>
          )}
        </span>

        {/* Screen reader only status */}
        {loading && (
          <span className="sr-only" aria-live="polite">
            {loadingText}
          </span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";