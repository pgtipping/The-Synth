/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your non-sensitive config here
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'],
  },
  // Add other configuration options
};

module.exports = nextConfig;
