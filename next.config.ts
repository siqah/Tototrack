import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // maplibre-gl uses browser APIs — keep it client-side only
    config.resolve.alias = {
      ...config.resolve.alias,
      "maplibre-gl": "maplibre-gl",
    };
    return config;
  },
};

export default nextConfig;
