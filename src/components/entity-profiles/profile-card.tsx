"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  FolderKanban,
  Lightbulb,
  MapPin,
  Calendar,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import type { EntityProfile, EntityType } from "@/lib/api/entity-profiles";

// ============================================================================
// HELPERS
// ============================================================================

export const TYPE_ICONS: Record<EntityType, React.ComponentType<{ className?: string }>> = {
  PERSON: User,
  ORGANIZATION: Building2,
  PROJECT: FolderKanban,
  CONCEPT: Lightbulb,
  LOCATION: MapPin,
  EVENT: Calendar,
  OTHER: HelpCircle,
};

export const TYPE_COLORS: Record<EntityType, string> = {
  PERSON: "bg-blue-500/10 text-blue-600 border-blue-200",
  ORGANIZATION: "bg-purple-500/10 text-purple-600 border-purple-200",
  PROJECT: "bg-green-500/10 text-green-600 border-green-200",
  CONCEPT: "bg-amber-500/10 text-amber-600 border-amber-200",
  LOCATION: "bg-rose-500/10 text-rose-600 border-rose-200",
  EVENT: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  OTHER: "bg-gray-500/10 text-gray-600 border-gray-200",
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ============================================================================
// PROFILE CARD
// ============================================================================

interface ProfileCardProps {
  profile: EntityProfile;
  memoryCount?: number;
}

export function ProfileCard({ profile, memoryCount }: ProfileCardProps) {
  const Icon = TYPE_ICONS[profile.type] ?? HelpCircle;
  const colorClass = TYPE_COLORS[profile.type] ?? TYPE_COLORS.OTHER;

  return (
    <Link href={`/identity/profiles/${profile.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
        <CardContent className="pt-5 pb-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </div>

          {/* Name */}
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
            {profile.name}
          </h3>

          {/* Description */}
          {profile.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {profile.description}
            </p>
          )}

          {/* Aliases */}
          {profile.aliases.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3 truncate">
              aka {profile.aliases.slice(0, 2).join(", ")}
              {profile.aliases.length > 2 && ` +${profile.aliases.length - 2}`}
            </p>
          )}

          {/* Footer: type badge + stats */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t gap-2">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorClass}`}>
              {profile.type}
            </Badge>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {memoryCount != null && (
                <span>{memoryCount} mem{memoryCount !== 1 ? "s" : ""}</span>
              )}
              <span>{formatRelativeDate(profile.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
