import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_URL: process.env.API_URL || 'https://live-leaderboard-fnm0.onrender.com/api',
    SOCKET_URL: process.env.SOCKET_URL || 'https://live-leaderboard-fnm0.onrender.com',
  },
};

export default nextConfig;
