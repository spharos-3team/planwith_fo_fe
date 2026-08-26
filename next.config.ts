import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stomp/stompjs"],
  // Do not add rewrites() here. /api/v1 is handled only by
  // src/app/api/v1/[...path]/route.ts so Authorization is not stripped.
};

export default nextConfig;
