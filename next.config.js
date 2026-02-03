/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // React strict mode for better error catching
  reactStrictMode: true,
  // Reduce bundle size
  swcMinify: true,
};

module.exports = nextConfig;
