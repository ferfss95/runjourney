export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-44 rounded-lg bg-card/70" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-card/70" />
        ))}
      </div>
    </div>
  );
}
