/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app is NOT a static export — it runs a small Node server so its API
  // routes can read docs/kanban/, spawn `claude -p`, and write cards. Run it
  // locally with `next dev` (or `next build && next start`). No hosting.
  reactStrictMode: true,
};

export default nextConfig;
