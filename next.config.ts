import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbo: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
