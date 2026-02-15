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
} from "lucide-react";

const ADMIN_EMAILS = ["hello@heybeaux.dev"];

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
  { name: "Merge Review", href: "/memories/merge-review", icon: GitMerge },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Code", href: "/code", icon: Code2, badge: "Self-hosted", featureGate: "codeSearch" },
  { name: "Consolidation", href: "/consolidation", icon: Moon },
  { name: "Ensemble", href: "/ensemble", icon: Layers },
  { name: "Drift", href: "/ensemble/drift", icon: Activity },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Accounts", href: "/admin/users", icon: ShieldAlert, badge: "Admin", adminOnly: true },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Cloud", href: "/settings/cloud", icon: Cloud, modeGate: "self-hosted" },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { features, mode } = useInstance();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

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
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-brand-500" />
            <span className="text-xl font-bold">Engram</span>
          </SheetTitle>
        </SheetHeader>
        
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

        <div className="border-t p-4 mt-auto">
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
