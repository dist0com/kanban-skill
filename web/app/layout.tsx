import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Kanban skill — a local task board in Markdown, next to your code",
  description:
    "A Claude Code skill that runs a kanban board for you — your backlog lives as plain Markdown files in git. No database, no MCP.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Kanban skill",
    title: "Kanban skill — a local task board in Markdown, next to your code",
    description:
      "Claude proposes the next work, writes the cards, and archives what's done. You steer the backlog in plain language, straight from your terminal.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanban skill — a local task board in Markdown, next to your code",
    description:
      "Claude proposes the next work, writes the cards, and archives what's done. You steer the backlog in plain language, straight from your terminal.",
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗂️</text></svg>",
  },
  verification: {
    google: "QVTStPZuK-LT8pPMpHaVrFmpfTGz1Q-zqmdKpkTK8d0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
