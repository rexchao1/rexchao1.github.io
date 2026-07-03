/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — deployable to GitHub Pages (rexchao1.github.io)
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
