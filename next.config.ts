import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: '*.zohocdn.com' },
      { protocol: 'https', hostname: '*.zoho.com' },
    ],
  },
  // Lover One campaign: static pages in public/lover-one
  async rewrites() {
    return [
      { source: '/lover-one', destination: '/lover-one/index.html' },
      { source: '/lover-one/note', destination: '/lover-one/note.html' },
    ];
  },
};

export default nextConfig;
