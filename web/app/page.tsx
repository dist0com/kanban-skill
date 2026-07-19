import { Header } from "@/components/Header";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Install } from "@/components/home/Install";
import { BoardTable } from "@/components/home/BoardTable";
import { Presets } from "@/components/home/Presets";
import { Advanced } from "@/components/home/Advanced";
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
