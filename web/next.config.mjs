/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a fully static site into `out/` — no Node server needed (Cloudflare Pages).
  output: 'export',
  // Static export can't use the default Image Optimization server.
  images: { unoptimized: true },
  // Emit `/path.html` so clean slash-free URLs work on static hosts.
  trailingSlash: false,
};

export default nextConfig;
