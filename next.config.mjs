/** @type {import('next').NextConfig} */
const posthogRegion = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '').includes('eu') ? 'eu' : 'us'
const nextConfig = {
  skipTrailingSlashRedirect: true,

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'fonestack.com.ng' }],
        destination: 'https://www.fonestack.com.ng/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'fonestack.vercel.app' }],
        destination: 'https://www.fonestack.com.ng/:path*',
        permanent: true,
      },
    ];
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: `https://${posthogRegion}-assets.i.posthog.com/static/:path*`,
      },
      {
        source: '/ingest/:path*',
        destination: `https://${posthogRegion}.i.posthog.com/:path*`,
      },
    ];
  },

  // Output configuration
  output: 'standalone',
  
  // Disable x-powered-by
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
  
  // SWC minification
  swcMinify: true,
};

export default nextConfig;