"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DataList,
  DataListItem,
  DataListHeader,
  DataListRow,
} from "@/components/ui/data-list";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { engram } from "@/lib/engram-client";
import { EmailDetail } from "./email-detail";
import { EmailFilters } from "./email-filters";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  processed: "bg-green-500/10 text-green-500 border-green-500/20",
  routed: "bg-green-500/10 text-green-500 border-green-500/20",
  unrouted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  received: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function MobileListSkeleton() {
  return (
    <DataList>
      {[...Array(5)].map((_, i) => (
        <DataListItem key={i}>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16" />
          </div>
        </DataListItem>
      ))}
    </DataList>
  );
}

export function EmailTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<Email[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await engram.getEmails({
        page: currentPage,
        limit: PAGE_SIZE,
        search,
        status,
        startDate,
        endDate,
      });
      setEmails(result.data ?? []);
      setTotal(result.total ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load emails"
      );
      setEmails([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status, startDate, endDate]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/emails?${params.toString()}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <EmailFilters loading={loading} />
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchEmails}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : emails.length === 0 && !error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {search || status || startDate || endDate
                      ? "No emails found matching your filters"
                      : "No emails yet"}
                  </TableCell>
                </TableRow>
              ) : (
                emails.map((email) => (
                  <>
                    <TableRow
                      key={email.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleExpand(email.id)}
                    >
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(email.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-[160px]">
                        <span className="truncate block text-sm">
                          {email.from}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[160px]">
                        <span className="truncate block text-sm">
                          {email.to}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <span className="truncate block font-medium text-sm">
                          {email.subject || "(no subject)"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            statusColors[email.status] ?? statusColors.received
                          }
                        >
                          {email.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {expandedId === email.id && (
                      <TableRow key={`${email.id}-detail`}>
                        <TableCell colSpan={5} className="p-0">
                          <EmailDetail email={email} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="lg:hidden">
        {loading ? (
          <MobileListSkeleton />
        ) : emails.length === 0 && !error ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search || status ? "No emails found" : "No emails yet"}
            </CardContent>
          </Card>
        ) : (
          <DataList>
            {emails.map((email) => (
              <DataListItem
                key={email.id}
                onClick={() => toggleExpand(email.id)}
              >
                <DataListHeader>
                  <p className="font-medium text-sm line-clamp-1">
                    {email.subject || "(no subject)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {email.from}
                  </p>
                </DataListHeader>
                <DataListRow label="Date">
                  {formatDate(email.createdAt)}
                </DataListRow>
                <div className="flex gap-2 items-center">
                  <Badge
                    variant="outline"
                    className={
                      statusColors[email.status] ?? statusColors.received
                    }
                  >
                    {email.status}
                  </Badge>
                </div>
                {expandedId === email.id && <EmailDetail email={email} />}
              </DataListItem>
            ))}
          </DataList>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          {total > 0 ? (
            <>
              Showing {startIdx}-{endIdx} of {total.toLocaleString()}
            </>
          ) : (
            "No emails"
          )}
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || loading}
            onClick={() => goToPage(currentPage - 1)}
            className="flex-1 sm:flex-none h-11"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || loading}
            onClick={() => goToPage(currentPage + 1)}
            className="flex-1 sm:flex-none h-11"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
