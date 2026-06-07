import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:pl-64 pb-24 md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
