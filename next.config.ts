import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // no global /login -> /admin redirect; keep auth flow explicit to avoid redirect loops
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
