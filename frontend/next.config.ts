import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode for Leaflet SSR compat
  reactStrictMode: false,
  // Transpile leaflet for Next.js
  transpilePackages: ["leaflet", "react-leaflet"],
};

export default nextConfig;
