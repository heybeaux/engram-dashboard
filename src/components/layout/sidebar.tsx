"use client";

import { useState } from "react";
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
  Fingerprint,
  FileText,
  Mail,
  UsersRound,
  Shield,
  RotateCcw,
  FileDown,
  RefreshCw,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Bot,
  ListTodo,
  Lightbulb,
  Swords,
} from "lucide-react";
import type { Edition } from "@/types/instance";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  /** Only show in these editions. Omit = show in all. */
  editions?: Edition[];
  children?: NavItem[];
}

const navigation: NavItem[] = [
  // === Common (both editions) ===
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Emails", href: "/emails", icon: Mail },
  { name: "Sessions", href: "/sessions", icon: Cpu },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
  { name: "Search", href: "/code", icon: Search },
  { name: "Consolidation", href: "/consolidation", icon: Moon },
  { name: "Sources", href: "/sources", icon: Cloud },
  { name: "Pools", href: "/pools", icon: Database },


  // === Identity section ===
  {
    name: "Identity",
    href: "/identity",
    icon: Fingerprint,
    children: [
      { name: "Overview", href: "/identity", icon: Fingerprint },
      { name: "Contracts", href: "/identity/contracts", icon: FileText },
      { name: "Tasks", href: "/identity/tasks", icon: ListTodo },
      { name: "Teams", href: "/identity/teams", icon: UsersRound },
      { name: "Trust", href: "/identity/trust", icon: Shield },
      { name: "Recall", href: "/identity/recall", icon: RotateCcw },
      { name: "Export", href: "/identity/export", icon: FileDown },
    ],
  },

  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Delegation", href: "/delegation", icon: ListTodo },
  { name: "Insights", href: "/insights", icon: Lightbulb },
  { name: "Challenges", href: "/challenges", icon: Swords },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Sync Status", href: "/settings/sync", icon: RefreshCw },
  { name: "Reconcile", href: "/settings/reconcile", icon: ArrowLeftRight },

  // === Local only: Sync ===
  { name: "Sync", href: "/settings/cloud", icon: RefreshCw, editions: ["local"] },

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

function NavItemLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));

  // Auto-expand if child is active
  const childActive = item.children?.some(
    (c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href))
  );

  const expanded = open || childActive;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!expanded)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            childActive
              ? "text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
          <span className="ml-auto">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </button>
        {expanded && (
          <div className="ml-5 space-y-0.5 border-l pl-3 mt-0.5">
            {item.children.map((child) => {
              const isChildActive =
                pathname === child.href ||
                (child.href !== "/" && pathname.startsWith(child.href));
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    isChildActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <child.icon className="h-4 w-4" />
                  {child.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
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
}

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
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavItemLink key={item.name} item={item} pathname={pathname} />
        ))}
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
