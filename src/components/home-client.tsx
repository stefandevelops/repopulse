"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { ProfilePanel } from "@/components/profile-panel";
import { ScoreCard } from "@/components/score-card";
import {
  fetchGithubRepos,
  fetchGithubUser,
  type GithubError,
  type GithubRepo,
  type GithubUser,
} from "@/lib/github";
import { scoreJuniorWebFit, type ScoreReport } from "@/lib/score";

type Person = {
  user: GithubUser;
  repos: GithubRepo[];
  report: ScoreReport;
};

async function loadPerson(username: string): Promise<Person> {
  const [user, repos] = await Promise.all([
    fetchGithubUser(username),
    fetchGithubRepos(username),
  ]);
  return { user, repos, report: scoreJuniorWebFit(user, repos) };
}

export function HomeClient() {
  const searchParams = useSearchParams();
  const username = (searchParams.get("u") || "").trim();
  const compare = (searchParams.get("vs") || "").trim();

  const [primary, setPrimary] = useState<Person | null>(null);
  const [secondary, setSecondary] = useState<Person | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!username) {
        setPrimary(null);
        setSecondary(null);
        setError("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const p = await loadPerson(username);
        const s = compare ? await loadPerson(compare) : null;
        if (cancelled) return;
        setPrimary(p);
        setSecondary(s);
      } catch (err) {
        if (cancelled) return;
        const e = err as GithubError;
        setPrimary(null);
        setSecondary(null);
        setError(e.message || "Something went wrong loading GitHub data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [username, compare]);

  let content: React.ReactNode = (
    <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] px-6 py-14 text-center">
      <p className="text-xl">Score a GitHub profile for junior web fit</p>
      <p className="mt-2 text-[var(--muted)]">
        Real problem: founders and freelancers waste calls on candidates with no
        public proof. RepoPulse turns public GitHub data into a hire/pass signal.
      </p>
    </div>
  );

  if (loading) {
    content = (
      <p className="mt-12 text-center text-[var(--muted)]">Scoring public GitHub evidence…</p>
    );
  } else if (error) {
    content = (
      <div className="mt-12 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center">
        <p className="text-lg text-red-200">{error}</p>
      </div>
    );
  } else if (primary) {
    content = (
      <div className="mt-10 space-y-8">
        <div className={`grid gap-6 ${secondary ? "lg:grid-cols-2" : ""}`}>
          <ScoreCard title={`@${primary.user.login}`} report={primary.report} />
          {secondary ? (
            <ScoreCard title={`@${secondary.user.login}`} report={secondary.report} />
          ) : null}
        </div>

        {secondary ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-sm text-[var(--muted)]">
            Head-to-head:{" "}
            <span className="text-[var(--ink)]">
              @{primary.user.login} ({primary.report.score})
            </span>{" "}
            vs{" "}
            <span className="text-[var(--ink)]">
              @{secondary.user.login} ({secondary.report.score})
            </span>
            .{" "}
            {primary.report.score === secondary.report.score
              ? "Tie on public signal — dig into code quality next."
              : `${
                  primary.report.score > secondary.report.score
                    ? primary.user.login
                    : secondary.user.login
                } currently shows the stronger junior-web public signal.`}
          </div>
        ) : null}

        <ProfilePanel user={primary.user} repos={primary.repos} />
        {secondary ? (
          <ProfilePanel user={secondary.user} repos={secondary.repos} />
        ) : null}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.22em] text-[var(--accent)]">
        RepoPulse
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Junior-web hire readiness from public GitHub evidence
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--muted)]">
        Scores activity, profile clarity, web-stack fit, and public depth — then
        recommends strong-fit / promising / needs-work / pass. Optional
        side-by-side compare for shortlists.
      </p>
      <div className="mt-8">
        <SearchForm initial={username} initialVs={compare} />
      </div>
      {content}
    </main>
  );
}
