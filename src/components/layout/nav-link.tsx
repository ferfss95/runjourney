"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function NavPendingIndicator({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <Loader2
      className={cn("h-4 w-4 shrink-0 animate-spin opacity-70", className)}
      aria-hidden
    />
  );
}

type NavLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  children: ReactNode;
  pendingClassName?: string;
};

export function NavLink({
  children,
  className,
  pendingClassName,
  ...props
}: NavLinkProps) {
  return (
    <Link {...props} className={className} prefetch>
      {children}
      <NavPendingIndicator className={pendingClassName} />
    </Link>
  );
}
