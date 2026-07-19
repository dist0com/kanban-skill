// The real Hermes mark, pulled from hermes-agent.nousresearch.com, used wherever
// we'd otherwise reach for a generic 🤖 to stand in for Hermes.
export function HermesMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hermes-logo.png"
      alt="Hermes"
      width={20}
      height={20}
      className={`inline-block shrink-0 rounded-[3px] ${className}`}
    />
  );
}
