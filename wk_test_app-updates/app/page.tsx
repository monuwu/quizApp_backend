"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace("/view/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Skeleton className="w-12 h-12 rounded-full" />
    </div>
  );
}
