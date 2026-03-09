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
}

interface NavSection {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    name: "Overview",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3, editions: ["cloud"] },
      { name: "Status", href: "/status", icon: Gauge, editions: ["cloud"] },
    ],
  },
  {
    name: "Memory",
    icon: Brain,
    items: [
      { name: "Memories", href: "/memories", icon: Brain },
      { name: "Graph", href: "/graph", icon: Network },
      { name: "Search", href: "/code", icon: Search },
      { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
      { name: "Consolidation", href: "/consolidation", icon: Moon },
      { name: "Pools", href: "/pools", icon: Database },
      { name: "Sessions", href: "/sessions", icon: Cpu },
    ],
  },
  {
    name: "Intelligence",
    icon: Lightbulb,
    items: [
      { name: "Insights", href: "/insights", icon: Lightbulb },
      { name: "Sources", href: "/sources", icon: Cloud },
      { name: "Ensemble", href: "/ensemble", icon: Layers, editions: ["cloud"] },
      { name: "Drift", href: "/ensemble/drift", icon: Activity, editions: ["cloud"] },
      { name: "Emails", href: "/emails", icon: Mail },
    ],
  },
  {
    name: "Identity",
    icon: Fingerprint,
    items: [
      { name: "Overview", href: "/identity", icon: Fingerprint },
      { name: "Agents", href: "/agents", icon: Bot },
      { name: "Teams", href: "/identity/teams", icon: UsersRound },
      { name: "Contracts", href: "/identity/contracts", icon: FileText },
      { name: "Tasks", href: "/identity/tasks", icon: ListTodo },
      { name: "Challenges", href: "/challenges", icon: Swords },
      { name: "Trust", href: "/identity/trust", icon: Shield },
      { name: "Delegation", href: "/delegation", icon: ArrowLeftRight },
      { name: "Recall", href: "/identity/recall", icon: RotateCcw },
      { name: "Export", href: "/identity/export", icon: FileDown },
    ],
  },
  {
    name: "Code",
    icon: Code2,
    items: [
      { name: "Code Search", href: "/code", icon: Code2, editions: ["local"] },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "API Keys", href: "/api-keys", icon: Key },
      { name: "Sync", href: "/settings/cloud", icon: RefreshCw, editions: ["local"] },
      { name: "Cloud Link", href: "/settings/cloud", icon: Link2, editions: ["local", "cloud"] },
      { name: "Sync Status", href: "/settings/sync", icon: RefreshCw },
      { name: "Reconcile", href: "/settings/reconcile", icon: ArrowLeftRight },
      { name: "Billing", href: "/billing", icon: CreditCard, editions: ["cloud"] },
      { name: "Users", href: "/users", icon: Users, editions: ["cloud"] },
    ],
  },
];

function NavSectionGroup({
  section,
  pathname,
  edition,
}: {
  section: NavSection;
  pathname: string;
  edition: Edition;
}) {
  const visibleItems = section.items.filter(
    (item) => !item.editions || item.editions.includes(edition)
  );

  const hasActiveItem = visibleItems.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href))
  );

  const [open, setOpen] = useState(false);
  // Always expand if a child is active; otherwise follow manual toggle state
  const expanded = open || hasActiveItem;

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors select-none",
          hasActiveItem
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <section.icon className="h-3.5 w-3.5 shrink-0" />
        <span>{section.name}</span>
        <span className="ml-auto">
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name + item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto text-[10px] font-normal px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  useAuth();
  const { edition, cloudLinked } = useInstance();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Brain className="h-8 w-8 text-brand-500" />
        <span className="text-xl font-bold">Engram</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 p-4 overflow-y-auto">
        {navSections.map((section) => (
          <NavSectionGroup
            key={section.name}
            section={section}
            pathname={pathname}
            edition={edition}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        {edition === "local" && (
          <Link
            href="/settings/cloud"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Cloud
              className={cn(
                "h-3.5 w-3.5",
                cloudLinked ? "text-green-500" : "text-muted-foreground"
              )}
            />
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
