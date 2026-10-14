import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow HMR through the loopback preview proxy (127.0.0.1).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Backend API base URL — inlined into the bundle at build time so
  // client-side fetches (booking, feedback, admin) work too.
  env: {
    NEXT_API_URL: process.env.NEXT_API_URL ?? "http://localhost:8080",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
