import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow HMR through the loopback preview proxy (127.0.0.1).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
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
