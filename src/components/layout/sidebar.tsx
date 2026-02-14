"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Brain,
  GitMerge,
  Users,
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
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Sessions", href: "/sessions", icon: Cpu },
  { name: "Pools", href: "/pools", icon: Database },
  { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Code", href: "/code", icon: Code2 },
  { name: "Consolidation", href: "/consolidation", icon: Moon },
  { name: "Ensemble", href: "/ensemble", icon: Layers },
  { name: "Drift", href: "/ensemble/drift", icon: Activity },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Users", href: "/users", icon: Users },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">Engram</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
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
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
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
