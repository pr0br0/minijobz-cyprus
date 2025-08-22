"use client";

import Link from "next/link";

export default function SkipLinks() {
  const links = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#navigation", label: "Skip to navigation" },
    { href: "#search", label: "Skip to search" },
  ];

  return (
    <nav className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-white shadow-lg p-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-4 py-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}