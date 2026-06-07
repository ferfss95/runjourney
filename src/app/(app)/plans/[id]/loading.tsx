export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-card/70" />
        <div className="h-8 w-64 rounded-lg bg-card/70" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-card/70" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-24 rounded bg-card/70" />
            <div className="h-20 rounded-xl bg-card/70" />
            <div className="h-20 rounded-xl bg-card/70" />
            <div className="h-20 rounded-xl bg-card/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
