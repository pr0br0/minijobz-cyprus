/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['prisma']
  },
  images: {
    domains: ['localhost', 'cyprusjobs.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/jobs/search',
        destination: '/jobs',
        permanent: true
      },
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true
      }
    ];
  },
  // Enable compression
  compress: true,
  // Power efficient bundling
  swcMinify: true,
  // Enable React strict mode
  reactStrictMode: true,
  // Optimize bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  }
};

module.exports = nextConfig;
