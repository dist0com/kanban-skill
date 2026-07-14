import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Install } from "@/components/Install";
import { BoardTable } from "@/components/BoardTable";
import { Presets } from "@/components/Presets";
import { Advanced } from "@/components/Advanced";
import { Footer } from "@/components/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kanban skill",
  description:
    "A Claude Code skill that runs a kanban board from plain Markdown files in your repo — versioned in git, no database, no web app, no MCP.",
  url: "https://kanban-skill.pages.dev",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto max-w-4xl px-6">
        <Hero />
        <Features />
        <Install />
        <BoardTable />
        <Presets />
        <Advanced />
      </main>
      <Footer />
    </>
  );
}
