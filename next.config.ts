import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Fix for client-side builds by providing fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        dns: false,
        tls: false,
        buffer: require.resolve('buffer'),
      };
    }
    return config;
  },
  // Optimize bundle by marking server-only packages as external
  serverExternalPackages: [
    'pdf-parse',
    'mammoth',
    'xlsx',
    'sharp'
  ],
};

export default nextConfig;
