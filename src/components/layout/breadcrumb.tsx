"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Settings",
  sync: "Sync Status",
  reconcile: "Reconciliation",
  cloud: "Cloud Connection",
  identity: "Identity",
  contracts: "Contracts",
  teams: "Teams",
  trust: "Trust",
  recall: "Recall",
  export: "Export",
  memories: "Memories",
  pools: "Pools",
  graph: "Graph",
};

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground mb-4", className)}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
