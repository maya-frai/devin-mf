import type { NextConfig } from "next";

// Every page reads the demo user cookie and the in-memory store, so render
// everything at request time. Cache Components is not needed for this PoC.
const nextConfig: NextConfig = {
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
