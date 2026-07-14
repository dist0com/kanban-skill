import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Update to the production domain once the Pages project has one.
  metadataBase: new URL("https://kanban-skill.pages.dev"),
  title: "Kanban skill — a task board in Markdown, next to your code",
  description:
    "A Claude Code skill that runs a file-based kanban board for you. Your backlog lives as plain Markdown in docs/kanban/ — in git, diffable, no database, no web app, no MCP.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Kanban skill",
    title: "Kanban skill — a task board in Markdown, next to your code",
    description:
      "Claude proposes the next work, writes the cards, and archives what's done. You steer the backlog in plain language, straight from your terminal.",
  },
  twitter: {
    card: "summary",
    title: "Kanban skill — a task board in Markdown, next to your code",
    description:
      "Claude proposes the next work, writes the cards, and archives what's done. You steer the backlog in plain language, straight from your terminal.",
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
