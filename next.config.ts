import type { NextConfig } from "next";

// Where the Express API runs. The browser never calls it directly: it calls /api/*
// on this app, and Next forwards the request. Same origin = httpOnly cookies just work.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
