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
} from "lucide-react";

const ADMIN_EMAILS = ["hello@heybeaux.dev"];

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
  editions?: string[];
  children?: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navigation: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Sessions", href: "/sessions", icon: Cpu },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
  { name: "Search", href: "/code", icon: Search },
  { name: "Consolidation", href: "/consolidation", icon: Moon },
  { name: "Sources", href: "/sources", icon: Cloud },
  { name: "Pools", href: "/pools", icon: Database },
  {
    name: "Identity",
    href: "/identity",
    icon: Fingerprint,
    children: [
      { name: "Overview", href: "/identity", icon: Fingerprint },
      { name: "Contracts", href: "/identity/contracts", icon: FileText },
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
  { name: "Sync", href: "/settings/cloud", icon: RefreshCw, editions: ["local"] },
  { name: "Billing", href: "/billing", icon: CreditCard, editions: ["cloud"] },
  { name: "Ensemble", href: "/ensemble", icon: Layers, editions: ["cloud"] },
  { name: "Drift", href: "/ensemble/drift", icon: Activity, editions: ["cloud"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, editions: ["cloud"] },
  { name: "Cloud Link", href: "/settings/cloud", icon: Link2, editions: ["local", "cloud"] },
  { name: "Usage", href: "/status", icon: Gauge, editions: ["cloud"] },
  { name: "Users", href: "/users", icon: Users, editions: ["cloud"] },
  { name: "Accounts", href: "/admin/users", icon: ShieldAlert, badge: "Admin", adminOnly: true },
  { name: "Code", href: "/code", icon: Code2, badge: "Local", editions: ["local"] },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { mode } = useInstance();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const edition = mode === "self-hosted" ? "local" : "cloud";

  const filteredNav = navigation
    .filter((item) => !item.adminOnly || isAdmin)
    .filter((item) => !item.editions || item.editions.includes(edition));

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
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {filteredNav.map((item) => {
            if (item.children) {
              const isChildActive = item.children.some(
                (child) => pathname === child.href || pathname.startsWith(child.href + "/")
              );
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setIdentityOpen(!identityOpen)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors min-h-[44px] w-full",
                      isChildActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform",
                        identityOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {(identityOpen || isChildActive) && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => {
                        const isActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[40px]",
                              isActive
                                ? "bg-primary text-primary-foreground"
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

            const isActive =
              pathname === item.href ||
              (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name + item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
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
