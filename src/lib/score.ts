import type { GithubRepo, GithubUser } from "@/lib/github";

export type Flag = { type: "green" | "red" | "amber"; text: string };

export type ScoreReport = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  recommendation: "strong-fit" | "promising" | "needs-work" | "pass";
  summary: string;
  flags: Flag[];
  dimensions: { label: string; score: number; detail: string }[];
};

function daysSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

export function scoreJuniorWebFit(user: GithubUser, repos: GithubRepo[]): ScoreReport {
  const flags: Flag[] = [];
  const webLangs = new Set(["TypeScript", "JavaScript", "HTML", "CSS", "Vue", "Dart"]);
  const recent = repos.filter((r) => daysSince(r.updated_at) <= 90);
  const withDesc = repos.filter((r) => (r.description ?? "").trim().length > 12);
  const originals = repos.filter((r) => !r.name.includes("awesome") || !!r.description);
  const langCounts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    langCounts.set(repo.language, (langCounts.get(repo.language) ?? 0) + 1);
  }
  const topLangs = [...langCounts.entries()].sort((a, b) => b[1] - a[1]);
  const webRepoCount = repos.filter((r) => r.language && webLangs.has(r.language)).length;
  const accountAgeYears = daysSince(user.created_at) / 365;

  const activityScore = Math.min(100, Math.round((recent.length / Math.max(repos.length, 1)) * 100));
  const clarityScore = Math.min(
    100,
    Math.round(
      ((user.bio ? 35 : 0) +
        (user.blog ? 15 : 0) +
        (withDesc.length / Math.max(repos.length, 1)) * 50),
    ),
  );
  const webScore = Math.min(100, Math.round((webRepoCount / Math.max(repos.length, 1)) * 100));
  const depthScore = Math.min(
    100,
    Math.round(
      Math.min(user.public_repos, 20) * 3 +
        Math.min(
          repos.reduce((s, r) => s + r.stargazers_count, 0),
          40,
        ),
    ),
  );

  if (!user.bio) flags.push({ type: "red", text: "No profile bio — hard to trust intent/skills." });
  else flags.push({ type: "green", text: "Profile bio present." });

  if (recent.length === 0) {
    flags.push({ type: "red", text: "No public repo activity in the last 90 days." });
  } else if (recent.length >= 3) {
    flags.push({ type: "green", text: `${recent.length} repos updated in the last 90 days.` });
  } else {
    flags.push({ type: "amber", text: "Some recent activity, but not a strong cadence." });
  }

  if (webRepoCount >= 3) {
    flags.push({ type: "green", text: `Web-relevant languages in ${webRepoCount} recent repos.` });
  } else {
    flags.push({
      type: "amber",
      text: "Few TypeScript/JavaScript repos visible — weak junior web signal.",
    });
  }

  if (withDesc.length < Math.ceil(repos.length * 0.4)) {
    flags.push({ type: "red", text: "Most repos lack useful descriptions/READMEs cues." });
  } else {
    flags.push({ type: "green", text: "Repos are generally described." });
  }

  if (accountAgeYears < 0.2 && user.public_repos < 3) {
    flags.push({ type: "amber", text: "Very new GitHub account with little public work." });
  }

  if (originals.length === 0) {
    flags.push({ type: "red", text: "No meaningful original project signal in recent repos." });
  }

  const score = Math.round(
    activityScore * 0.3 + clarityScore * 0.25 + webScore * 0.3 + depthScore * 0.15,
  );

  const grade: ScoreReport["grade"] =
    score >= 80 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : "D";

  const recommendation: ScoreReport["recommendation"] =
    score >= 80
      ? "strong-fit"
      : score >= 65
        ? "promising"
        : score >= 45
          ? "needs-work"
          : "pass";

  const summary =
    recommendation === "strong-fit"
      ? "Strong junior web signal: recent work, clear profile, web stack evidence."
      : recommendation === "promising"
        ? "Promising candidate, but tighten public proof (READMEs, cadence, web focus)."
        : recommendation === "needs-work"
          ? "Not hire-ready yet for junior web — portfolio gaps are visible from public data."
          : "Weak public signal. Ask for private work samples or pass for now.";

  return {
    score,
    grade,
    recommendation,
    summary,
    flags,
    dimensions: [
      {
        label: "Recent activity",
        score: activityScore,
        detail: `${recent.length}/${repos.length || 0} repos touched in 90 days`,
      },
      {
        label: "Profile clarity",
        score: clarityScore,
        detail: user.bio ? "Bio present" : "Missing bio",
      },
      {
        label: "Web stack fit",
        score: webScore,
        detail: topLangs.slice(0, 3).map(([l]) => l).join(", ") || "No languages detected",
      },
      {
        label: "Public depth",
        score: depthScore,
        detail: `${user.public_repos} public repos · ${repos.reduce((s, r) => s + r.stargazers_count, 0)} stars in sample`,
      },
    ],
  };
}
