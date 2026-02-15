"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, BookOpen, User, LogOut, Settings, Brain } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/lib/auth-context";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        router.push(`/memories?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 gap-4">
      {/* Mobile: Nav + Logo */}
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav />
        <Brain className="h-6 w-6 text-brand-500" />
      </div>

      {/* Search - responsive width */}
      <div className="relative flex-1 max-w-md md:max-w-sm lg:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search memories..."
          className="pl-10 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="hidden sm:flex h-11 px-3"
        >
          <a href="https://docs.engram.dev" target="_blank" rel="noopener">
            <BookOpen className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Docs</span>
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-3" asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-3" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
