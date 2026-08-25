import type { NextConfig } from "next";

const gatewayUrl = (process.env.GATEWAY_URL ?? "http://localhost:8000").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${gatewayUrl}/api/v1/:path*`,
      },
      {
        source: "/api/planwith-fo-grade/:path*",
        destination: `${gatewayUrl}/api/planwith-fo-grade/:path*`,
      },
      {
        source: "/api/planwith-fo-membership/:path*",
        destination: `${gatewayUrl}/api/planwith-fo-membership/:path*`,
      },
    ];
  },
};

export default nextConfig;
