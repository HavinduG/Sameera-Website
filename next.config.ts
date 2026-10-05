import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

// Allow images from whichever WordPress host the site is pointed at.
const wpUrl = process.env.WORDPRESS_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_URL;
const wpPattern: RemotePattern[] = [];
if (wpUrl) {
  try {
    const { protocol, hostname, port } = new URL(wpUrl);
    if (hostname !== "sameera.local") {
      wpPattern.push({
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/**",
      });
    }
  } catch {
    // Ignore malformed URLs; the bundled pattern below still applies.
  }
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "sameera.local",
        port: "",
        pathname: "/**",
      },
      ...wpPattern,
    ],
  },
};

export default nextConfig;
