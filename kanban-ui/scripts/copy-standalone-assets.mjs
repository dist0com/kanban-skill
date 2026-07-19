// After `next build` with output: 'standalone', Next writes a self-contained
// server under .next/standalone but does NOT copy the static assets or public/
// into it. Copy them so the published package can serve the app on its own.
// See https://nextjs.org/docs/app/api-reference/config/next-config-js/output

import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(".", import.meta.url).pathname);
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.error(
    "copy-standalone-assets: .next/standalone/server.js missing — run `next build` first.",
  );
  process.exit(1);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}

copyDir(
  path.join(root, ".next", "static"),
  path.join(standalone, ".next", "static"),
);
copyDir(path.join(root, "public"), path.join(standalone, "public"));
