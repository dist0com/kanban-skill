import { boardRows } from "./content";

export function BoardTable() {
  return (
    <section id="board" className="mt-20 scroll-mt-20">
      <h2 className="mb-3 text-3xl font-bold tracking-tight">Using the board</h2>
      <p className="text-muted">Once installed, drive it in plain language:</p>
      <table className="mt-4 w-full border-collapse text-[0.96rem]">
        <thead>
          <tr>
            <th className="border-b border-border px-4 py-3 text-left text-[0.85rem] font-semibold uppercase tracking-wide text-muted">
              You say
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[0.85rem] font-semibold uppercase tracking-wide text-muted">
              Claude does
            </th>
          </tr>
        </thead>
        <tbody>
          {boardRows.map((r) => (
            <tr key={r.say}>
              <td className="whitespace-nowrap border-b border-border px-4 py-3 font-mono text-sm text-accent">
                {r.say}
              </td>
              <td className="border-b border-border px-4 py-3 text-ink">{r.does}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
