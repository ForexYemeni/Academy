import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    // Server Actions configuration:
    // - bodySizeLimit: allow larger payloads for audio recordings (base64-encoded
    //   audio can easily exceed the default 1MB limit — a 2-minute Opus recording
    //   at 128kbps is ~1.9MB raw, ~2.5MB base64-encoded).
    // - allowedOrigins: allow Server Actions to work behind proxies/gateways where
    //   the public `origin` differs from the internal `x-forwarded-host`. Required
    //   for preview environments (e.g. *.space-z.ai) and any deployment behind a
    //   reverse proxy (Caddy, nginx, Vercel, etc.).
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.space-z.ai",
        "*.vercel.app",
        "*",
      ],
    },
  },
};

export default nextConfig;
