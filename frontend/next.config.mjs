/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Turbopack for build - use webpack instead
  experimental: {
    turbo: undefined
  }
};

export default nextConfig;
