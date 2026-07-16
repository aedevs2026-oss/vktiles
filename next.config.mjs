/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "simpolo-web.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "admin.simpolo.com",
      },
      {
        protocol: "https",
        hostname: "www.simpolo.com",
      },
    ],
  },
};

export default nextConfig;
