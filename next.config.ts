import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Experimental features for better Edge Runtime compatibility
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default withNextIntl(nextConfig);
