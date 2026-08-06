import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Framework parmak izini gizle (X-Powered-By: Next.js header'ı kaldırılır)
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "static.atlascloud.ai" },
      { protocol: "https", hostname: "*.atlascloud.ai" },
    ],
  },
};

export default nextConfig;
