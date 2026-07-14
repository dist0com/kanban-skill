import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Install } from "@/components/Install";
import { BoardTable } from "@/components/BoardTable";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6">
        <Hero />
        <Features />
        <Install />
        <BoardTable />
      </main>
      <Footer />
    </>
  );
}
