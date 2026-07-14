// Soft-brutalist panel: dark GitHub palette + a hard offset shadow that lifts
// on hover into an accent-tinted block. Shared by every card on the page.
export const panel =
  "rounded-lg border-2 border-border bg-elev shadow-[4px_4px_0_0_#010409] " +
  "transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 " +
  "hover:border-accent/50 hover:shadow-[6px_6px_0_0_var(--color-accent)]";

// Same block, no hover lift — for panels that aren't meant to feel interactive.
export const panelStatic =
  "rounded-lg border-2 border-border bg-elev shadow-[4px_4px_0_0_#010409]";
