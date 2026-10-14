export type GithubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
  created_at: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
};

export type GithubError = {
  message: string;
  status: number;
};

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "RepoPulse-portfolio-app",
};

export async function fetchGithubUser(username: string) {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
    { headers },
  );

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    const error: GithubError = {
      status: res.status,
      message:
        res.status === 404
          ? `No GitHub user named “${username}”.`
          : res.status === 403
            ? "GitHub rate limit hit. Wait a minute or try again later."
            : body.message || "Could not load GitHub user.",
    };
    throw error;
  }

  return (await res.json()) as GithubUser;
}

export async function fetchGithubRepos(username: string) {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`,
    { headers },
  );

  if (!res.ok) {
    const error: GithubError = {
      status: res.status,
      message: "Could not load repositories.",
    };
    throw error;
  }

  return (await res.json()) as GithubRepo[];
}

export function languageBreakdown(repos: GithubRepo[]) {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);
}
