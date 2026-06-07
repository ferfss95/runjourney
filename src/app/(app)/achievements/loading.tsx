export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-44 rounded-lg bg-card/70" />
      <div className="h-20 rounded-xl bg-card/70" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-card/70" />
        ))}
      </div>
    </div>
  );
}
