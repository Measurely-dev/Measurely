/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'media.measurely.dev',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Optional: adds AVIF and WebP support
    minimumCacheTTL: 60 * 60 * 24, // Cache images for 24 hours
  },
  trailingSlash: true, // Ensures URLs end with a trailing slash
};

export default nextConfig;
