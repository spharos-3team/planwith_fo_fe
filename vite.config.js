import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },
      "/oauth2": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/files": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader(
              "X-Gateway-Internal-Token",
              process.env.GATEWAY_INTERNAL_TOKEN || "local-gateway-internal-token"
            );
          });
        },
      },
    },
  },
});
