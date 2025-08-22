"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useFocusVisible } from "@/hooks/useAccessibility";

interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({
  children,
  interactive = false,
  selected = false,
  onSelect,
  ariaLabel,
  ariaDescribedBy,
  className = ""
  }, ref) => {
    const isFocusVisible = useFocusVisible();

    const handleClick = () => {
      if (interactive && onSelect) {
        onSelect();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSelect?.();
      }
    };

    const cardProps = interactive
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": ariaLabel,
          "aria-describedby": ariaDescribedBy,
          "aria-pressed": selected,
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          cursor: "pointer",
        }
      : {
          role: "article",
          "aria-label": ariaLabel,
          "aria-describedby": ariaDescribedBy,
        };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={interactive ? { y: -5 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        className={`
          relative
          ${interactive ? "hover:shadow-lg" : ""}
          ${selected ? "ring-2 ring-blue-500" : ""}
          ${isFocusVisible && interactive ? "ring-2 ring-blue-500 ring-offset-2" : ""}
          ${className}
        `}
  {...cardProps}
      >
        <Card className={`h-full ${interactive ? "cursor-pointer transition-all duration-200" : ""}`}>
          {children}
        </Card>
        
        {/* Selection indicator */}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

AccessibleCard.displayName = "AccessibleCard";