"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Target,
  BarChart3,
  Trophy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/layout/nav-link";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendário", icon: Calendar },
  { href: "/plans", label: "Planos", icon: Target },
  { href: "/stats", label: "Estatísticas", icon: BarChart3 },
  { href: "/achievements", label: "Conquistas", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border/50">
          <Image
            src="/logo-sidebar.png"
            alt="RunJourney"
            width={32}
            height={32}
            className="shrink-0"
          />
          <span className="text-xl font-bold text-foreground">RunJourney</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  "data-[pending]:opacity-70"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-2 shrink-0" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
        <div className="flex justify-around py-1.5 px-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-0 flex-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                pendingClassName="h-3 w-3"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] leading-tight truncate w-full text-center">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
