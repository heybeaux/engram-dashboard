"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeamsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/identity/teams");
  }, [router]);
  return null;
}
