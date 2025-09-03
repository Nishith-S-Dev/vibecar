/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false,
    serverActions: {
      bodySizeLimit: "10mb", // increase limit to 10mb (adjust as needed)
    },
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