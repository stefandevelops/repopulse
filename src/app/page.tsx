import { Suspense } from "react";
import { HomeClient } from "@/components/home-client";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-5 py-16 text-[var(--muted)]">
          Loading RepoPulse…
        </main>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
