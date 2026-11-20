import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos are shrunk in the browser first; this leaves room for a receipt or product photo plus form fields.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
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
