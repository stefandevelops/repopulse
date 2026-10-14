"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({
  initial = "",
  initialVs = "",
}: {
  initial?: string;
  initialVs?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [vs, setVs] = useState(initialVs);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    const params = new URLSearchParams({ u: q });
    if (vs.trim()) params.set("vs", vs.trim());
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Candidate username"
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        aria-label="Primary GitHub username"
      />
      <input
        value={vs}
        onChange={(e) => setVs(e.target.value)}
        placeholder="Compare with (optional)"
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        aria-label="Comparison GitHub username"
      />
      <button
        type="submit"
        className="rounded-xl bg-[var(--accent)] px-5 py-3 font-medium text-[var(--accent-ink)]"
      >
        Score fit
      </button>
    </form>
  );
}
