import Image from "next/image";
import type { GithubRepo, GithubUser } from "@/lib/github";
import { languageBreakdown } from "@/lib/github";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function ProfilePanel({
  user,
  repos,
}: {
  user: GithubUser;
  repos: GithubRepo[];
}) {
  const languages = languageBreakdown(repos);

  return (
    <div className="mt-10 space-y-8">
      <section className="flex flex-col gap-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:flex-row sm:items-center">
        <Image
          src={user.avatar_url}
          alt={`${user.login} avatar`}
          width={96}
          height={96}
          className="rounded-2xl"
        />
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold tracking-tight">
            {user.name || user.login}
          </h2>
          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent)]"
          >
            @{user.login}
          </a>
          {user.bio ? <p className="mt-2 text-[var(--muted)]">{user.bio}</p> : null}
          <dl className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            <div>
              <dt className="inline">Repos </dt>
              <dd className="inline text-[var(--ink)]">{user.public_repos}</dd>
            </div>
            <div>
              <dt className="inline">Followers </dt>
              <dd className="inline text-[var(--ink)]">{user.followers}</dd>
            </div>
            <div>
              <dt className="inline">Following </dt>
              <dd className="inline text-[var(--ink)]">{user.following}</dd>
            </div>
            {user.location ? (
              <div>
                <dt className="inline">Location </dt>
                <dd className="inline text-[var(--ink)]">{user.location}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline">Joined </dt>
              <dd className="inline text-[var(--ink)]">{formatDate(user.created_at)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          Languages in recent repos
        </h3>
        {languages.length === 0 ? (
          <p className="text-[var(--muted)]">No language data on recent public repos.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {languages.map((item) => (
              <li
                key={item.language}
                className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-sm"
              >
                {item.language}{" "}
                <span className="text-[var(--muted)]">×{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          Recently updated repos
        </h3>
        {repos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-10 text-center text-[var(--muted)]">
            This user has no public repositories yet.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {repos.map((repo) => (
              <li
                key={repo.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--accent)]/50"
              >
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg font-medium hover:text-[var(--accent)]"
                >
                  {repo.name}
                </a>
                <p className="mt-2 min-h-10 text-sm text-[var(--muted)]">
                  {repo.description || "No description"}
                </p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {repo.language || "Unknown"} · ★ {repo.stargazers_count} · forks{" "}
                  {repo.forks_count} · updated {formatDate(repo.updated_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
