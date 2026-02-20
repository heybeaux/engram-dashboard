"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Edition, EDITION } from "@/types/instance";

/**
 * Redirects to /dashboard if current edition doesn't match.
 * Usage: place <EditionGuard edition="cloud" /> at the top of a page component.
 */
export function EditionGuard({
  edition,
  children,
}: {
  edition: Edition;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (EDITION !== edition) {
      router.replace("/dashboard");
    }
  }, [edition, router]);

  if (EDITION !== edition) return null;
  return <>{children}</>;
}
