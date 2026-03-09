"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useInstance } from "@/context/instance-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Brain,
  GitMerge,
  Key,
  Settings,
  BookOpen,
  Menu,
  Network,
  BarChart3,
  Layers,
  Code2,
  Moon,
  Activity,
  ShieldAlert,
  Cloud,
  Users,
  Cpu,
  Search,
  Database,
  Fingerprint,
  FileText,
  UsersRound,
  Shield,
  RotateCcw,
  FileDown,
  Bot,
  ListTodo,
  Lightbulb,
  Swords,
  RefreshCw,
  ArrowLeftRight,
  CreditCard,
  Link2,
  Gauge,
  ChevronDown,
  ChevronRight,
  Mail,
} from "lucide-react";

const ADMIN_EMAILS = ["hello@heybeaux.dev"];

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
  editions?: string[];
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
      {
        name: "Accounts",
        href: "/admin/users",
        icon: ShieldAlert,
        badge: "Admin",
        adminOnly: true,
      },
    ],
  },
];

function MobileNavSection({
  section,
  pathname,
  edition,
  isAdmin,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  edition: string;
  isAdmin: boolean;
  onNavigate: () => void;
}) {
  const visibleItems = section.items.filter(
    (item) =>
      (!item.adminOnly || isAdmin) &&
      (!item.editions || item.editions.includes(edition))
  );

  const hasActiveItem = visibleItems.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const [open, setOpen] = useState(false);
  const expanded = open || hasActiveItem;

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors select-none min-h-[40px]",
          hasActiveItem
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <section.icon className="h-3.5 w-3.5 shrink-0" />
        <span>{section.name}</span>
        <span className="ml-auto">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name + item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { mode } = useInstance();
  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  const edition = mode === "self-hosted" ? "local" : "cloud";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-11 w-11"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-brand-500" />
            <span className="text-xl font-bold">Engram</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-3 p-4 overflow-y-auto">
          {navSections.map((section) => (
            <MobileNavSection
              key={section.name}
              section={section}
              pathname={pathname}
              edition={edition}
              isAdmin={isAdmin}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/docs"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px] px-3"
          >
            <BookOpen className="h-4 w-4" />
            Documentation
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
