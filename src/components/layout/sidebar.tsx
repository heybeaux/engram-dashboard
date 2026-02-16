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
  ShieldAlert,
  Cloud,
} from "lucide-react";

// Admin visibility: self-hosted shows admin to all users; cloud hides admin entirely

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
  featureGate?: "codeSearch" | "billing" | "localEmbeddings" | "cloudEnsemble";
  modeGate?: "self-hosted" | "cloud";
}

const navigation: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Sessions", href: "/sessions", icon: Cpu },
  { name: "Pools", href: "/pools", icon: Database },
  { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Code", href: "/code", icon: Code2, badge: "Self-hosted", featureGate: "codeSearch" },
  { name: "Consolidation", href: "/consolidation", icon: Moon },
  { name: "Ensemble", href: "/ensemble", icon: Layers },
  { name: "Drift", href: "/ensemble/drift", icon: Activity },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Accounts", href: "/admin/users", icon: ShieldAlert, badge: "Admin", adminOnly: true },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Billing", href: "/billing", icon: CreditCard, featureGate: "billing" },
  { name: "Cloud", href: "/settings/cloud", icon: Cloud, modeGate: "self-hosted" },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { features, mode, cloudLinked, isLoading } = useInstance();
  const isAdmin = mode === "self-hosted";

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Brain className="h-8 w-8 text-brand-500" />
        <span className="text-xl font-bold">Engram</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation
          .filter((item) => !item.adminOnly || isAdmin)
          .filter((item) => !item.featureGate || features[item.featureGate] !== false)
          .filter((item) => !item.modeGate || item.modeGate === mode)
          .map((item) => {
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
        {mode === "self-hosted" && (
          <Link
            href="/settings/cloud"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Cloud className={cn("h-3.5 w-3.5", cloudLinked ? "text-green-500" : "text-muted-foreground")} />
            {cloudLinked ? "Cloud Connected" : "Cloud Disconnected"}
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
