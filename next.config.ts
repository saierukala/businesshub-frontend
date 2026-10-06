import type { NextConfig } from "next";

// Where the Express API runs. The browser never calls it directly: it calls /api/*
// on this app, and Next forwards the request. Same origin = httpOnly cookies just work.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

// Browser hardening for every page. (A Content-Security-Policy needs per-request nonces for Next's inline scripts: left for later.)
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" }, // nobody may embed the app in a frame (clickjacking)
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  devIndicators: false, // hides the round "N" badge in the corner while developing (real errors still show)
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
