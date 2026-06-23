/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'render.albiononline.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
};

module.exports = nextConfig;
