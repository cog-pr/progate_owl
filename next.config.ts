import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.3.16", "localhost"],
  images: {
    unoptimized: true,
    remotePatterns: [
      // S3 bucket pattern (update with actual bucket when available)
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
