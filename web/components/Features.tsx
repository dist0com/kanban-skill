import { features } from "./content";

export function Features() {
  return (
    <section className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {features.map((f) => (
        <div
          key={f.title}
          className="rounded-xl border border-border bg-elev p-6"
        >
          <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
          <p className="text-[0.95rem] text-muted">{f.body}</p>
        </div>
      ))}
    </section>
  );
}
