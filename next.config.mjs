/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kkrnobrskcdwdrouqnwm.supabase.co",
      },
    ],
  },
};

// Move async function outside of object
export async function headers() {
  return [
    {
      source: "/embed",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "frame-src 'self' https://vibecar.created.app",
        },
      ],
    },
  ];
}

export default nextConfig;