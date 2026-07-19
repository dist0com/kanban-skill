import { features } from "../content";
import { panel } from "../styles";

export function Features() {
  return (
    <section className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {features.map((f) => (
        <div key={f.title} className={`${panel} p-6`}>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-code text-xl">
            <span aria-hidden="true">{f.icon}</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
          <p className="text-[0.95rem] text-muted">{f.body}</p>
        </div>
      ))}
    </section>
  );
}
