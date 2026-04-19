import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // AWS Amplifyを使用する場合はコメントアウトまたは削除を推奨します
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
