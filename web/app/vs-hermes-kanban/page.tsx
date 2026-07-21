import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HkHero } from "@/components/vs-hermes-kanban/HkHero";
import { HkSummary } from "@/components/vs-hermes-kanban/HkSummary";
import { HkHarness } from "@/components/vs-hermes-kanban/HkHarness";
import { HkComparison } from "@/components/vs-hermes-kanban/HkComparison";
import { HkMemory } from "@/components/vs-hermes-kanban/HkMemory";
import { HkAutonomy } from "@/components/vs-hermes-kanban/HkAutonomy";
import { HkGui } from "@/components/vs-hermes-kanban/HkGui";
import { HkWins } from "@/components/vs-hermes-kanban/HkWins";
import { HkDecision } from "@/components/vs-hermes-kanban/HkDecision";
import { BASE_URL, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kanban skill vs. Hermes Agent Kanban — a lean file-based board vs. a durable runtime",
  description:
    "How the file-based kanban skill compares to Nous Research's Hermes Agent Kanban: two overlapping agent kanban boards — plain diffable files that run on any agent (even Hermes) vs. a durable, shared SQLite queue many named agents claim tasks from.",
  alternates: { canonical: "/vs-hermes-kanban/" },
  openGraph: {
    type: "article",
    url: "/vs-hermes-kanban/",
    siteName: "Kanban skill",
    title: "Kanban skill vs. Hermes Agent Kanban",
    description:
      "Two overlapping agent kanban boards. The kanban skill is a lean, file-based board that runs on any agent (even Hermes); Hermes bundles the same board with a durable, shared queue many named agents work.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanban skill vs. Hermes Agent Kanban",
    description:
      "Two overlapping agent kanban boards. The kanban skill is a lean, file-based board that runs on any agent (even Hermes); Hermes bundles the same board with a durable, shared queue many named agents work.",
    images: [OG_IMAGE.url],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Kanban skill vs. Hermes Agent Kanban",
  description:
    "How the file-based kanban skill compares to Hermes Agent Kanban: two overlapping agent kanban boards — plain diffable files that run on any agent (even Hermes) vs. a durable, shared SQLite queue many named agents claim tasks from.",
  url: `${BASE_URL}/vs-hermes-kanban/`,
};

export default function VsHermesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-8">
        <HkHero />
        <HkSummary />
        <HkHarness />
        <HkComparison />
        <HkMemory />
        <HkAutonomy />
        <HkGui />
        <HkWins />
        <HkDecision />
      </main>
      <Footer />
    </>
  );
}
