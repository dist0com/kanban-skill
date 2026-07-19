import { notFound } from "next/navigation";
import { CardPage } from "@/components/CardPage";
import { agentInfo } from "@/lib/agent";
import { readBoard } from "@/lib/board";

// Read the board on the server and hand the one card to the client page. The
// files in docs/kanban/ are the source of truth; router.refresh() re-reads them
// after each mutation.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isInteger(cardId)) notFound();

  const board = readBoard();
  const card = board.columns.flatMap((c) => c.cards).find((c) => c.id === cardId);
  if (!card) notFound();

  return <CardPage card={card} openIds={board.openIds} agent={agentInfo()} />;
}
