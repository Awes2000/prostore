import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  serverExternalPackages: ['@neondatabase/serverless'],
};

export default nextConfig;
