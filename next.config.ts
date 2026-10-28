import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets parallel verification builds use their own folder (NEXT_DIST_DIR=.next-xyz).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
