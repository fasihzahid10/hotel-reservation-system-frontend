/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Only used when NEXT_PUBLIC_API_URL is /api (browser hits same origin; Next proxies here).
    const target = process.env.BACKEND_PROXY_URL || 'http://127.0.0.1:4000';
    return [{ source: '/api/:path*', destination: `${target.replace(/\/$/, '')}/api/:path*` }];
  },
};

export default nextConfig;
