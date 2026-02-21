"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChallengesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/identity/challenges");
  }, [router]);
  return null;
}
