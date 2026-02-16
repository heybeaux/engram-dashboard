"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useInstance } from "@/context/instance-context";
import {
  LayoutDashboard,
  Brain,
  GitMerge,
  Key,
  Settings,
  BookOpen,
  Network,
  BarChart3,
  Layers,
  Code2,
  Moon,
  Activity,
  Cpu,
  Database,
  CreditCard,
  Cloud,
  Users,
  Search,
  Link2,
  Gauge,
} from "lucide-react";
import type { Edition } from "@/types/instance";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  /** Only show in these editions. Omit = show in all. */
  editions?: Edition[];
}

const navigation: NavItem[] = [
  // === Common (both editions) ===
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Sessions", href: "/sessions", icon: Cpu },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
  { name: "Search", href: "/code", icon: Search },
  { name: "Consolidation", href: "/consolidation", icon: Moon },
  { name: "Pools", href: "/pools", icon: Database },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },

  // === Cloud only ===
  { name: "Billing", href: "/billing", icon: CreditCard, editions: ["cloud"] },
  { name: "Ensemble", href: "/ensemble", icon: Layers, editions: ["cloud"] },
  { name: "Drift", href: "/ensemble/drift", icon: Activity, editions: ["cloud"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, editions: ["cloud"] },
  { name: "Cloud Link", href: "/settings/cloud", icon: Link2, editions: ["local", "cloud"] },
  { name: "Usage", href: "/status", icon: Gauge, editions: ["cloud"] },
  { name: "Users", href: "/users", icon: Users, editions: ["cloud"] },

  // === Local only ===
  { name: "Code", href: "/code", icon: Code2, badge: "Local", editions: ["local"] },
];

export function Sidebar() {
  const pathname = usePathname();
  useAuth();
  const { edition, cloudLinked } = useInstance();

  const filteredNav = navigation.filter(
    (item) => !item.editions || item.editions.includes(edition)
  );

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Brain className="h-8 w-8 text-brand-500" />
        <span className="text-xl font-bold">Engram</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.badge && (
                <span className="ml-auto text-[10px] font-normal px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        {edition === "local" && (
          <Link
            href="/settings/cloud"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Cloud className={cn("h-3.5 w-3.5", cloudLinked ? "text-green-500" : "text-muted-foreground")} />
            {cloudLinked ? "Cloud Connected" : "Connect to Cloud"}
          </Link>
        )}
        <Link
          href="/docs"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Documentation
        </Link>
      </div>
    </aside>
  );
}
