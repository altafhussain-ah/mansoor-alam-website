/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static output: `next build` emits ./out, which Netlify publishes as-is.
  // Keeps hosting free and identical to the old plain-HTML deploy.
  output: "export",
  trailingSlash: true,
  images: {
    // next/image cannot run its optimiser in a static export.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
