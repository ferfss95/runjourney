export default function Loading() {
  return (
    <div className="space-y-6 max-w-lg mx-auto animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-card/70" />
        <div className="h-8 w-40 rounded-lg bg-card/70" />
      </div>
      <div className="h-28 rounded-xl bg-card/70" />
      <div className="space-y-4">
        <div className="h-10 rounded-lg bg-card/70" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 rounded-lg bg-card/70" />
          <div className="h-16 rounded-lg bg-card/70" />
        </div>
        <div className="h-16 rounded-lg bg-card/70" />
        <div className="h-24 rounded-lg bg-card/70" />
        <div className="h-12 rounded-lg bg-card/70" />
        <div className="h-12 rounded-lg bg-card/70" />
      </div>
    </div>
  );
}
