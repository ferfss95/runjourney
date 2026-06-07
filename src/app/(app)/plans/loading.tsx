export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-52 rounded-lg bg-card/70" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-card/70" />
        ))}
      </div>
    </div>
  );
}
