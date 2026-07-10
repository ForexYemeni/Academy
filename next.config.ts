import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow Server Actions to work behind proxies/gateways where the
  // public `origin` differs from the internal `x-forwarded-host`.
  // This is required for preview environments (e.g. *.space-z.ai) and
  // any deployment behind a reverse proxy (Caddy, nginx, Vercel, etc.).
  serverActions: {
    allowedOrigins: [
      "localhost:3000",
      "127.0.0.1:3000",
      // Wildcard patterns for preview environments
      "*.space-z.ai",
      "*.vercel.app",
      // Allow any forwarded host (the gateway sets x-forwarded-host)
      "*",
    ],
  },
};

export default nextConfig;
