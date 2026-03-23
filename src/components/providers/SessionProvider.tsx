'use client';

import { useEffect, useRef } from "react";
import { SessionProvider as NextAuthProvider, useSession } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider refetchOnWindowFocus>
      <SessionSync />
      {children}
    </NextAuthProvider>
  );
}

function SessionSync() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    const current = userId ?? null;
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("qilin.session.userId") : null;

    if (stored !== current && stored !== null && current !== null && lastUserIdRef.current !== null) {
      window.location.reload();
      return;
    }

    if (current) {
      window.localStorage.setItem("qilin.session.userId", current);
    } else {
      window.localStorage.removeItem("qilin.session.userId");
    }
    lastUserIdRef.current = current;
  }, [userId, status]);

  useEffect(() => {
    if (status === "loading") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "qilin.session.userId") return;
      const current = userId ?? null;
      const next = e.newValue ?? null;
      if (current !== next) {
        window.location.reload();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId, status]);

  return null;
}
