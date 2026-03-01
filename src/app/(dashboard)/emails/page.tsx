"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailTable } from "./email-table";

function EmailTableFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function EmailsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Emails</h1>
      </div>
      <Suspense fallback={<EmailTableFallback />}>
        <EmailTable />
      </Suspense>
    </div>
  );
}
