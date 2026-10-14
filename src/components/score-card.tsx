import type { ScoreReport } from "@/lib/score";

const recLabel = {
  "strong-fit": "Strong junior-web fit",
  promising: "Promising with gaps",
  "needs-work": "Needs more public proof",
  pass: "Pass for now",
} as const;

export function ScoreCard({ report, title }: { report: ScoreReport; title: string }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold">{recLabel[report.recommendation]}</h3>
        </div>
        <div className="text-right">
          <p className="font-[family-name:var(--font-mono)] text-4xl text-[var(--accent)]">
            {report.score}
            <span className="text-lg text-[var(--muted)]">/100</span>
          </p>
          <p className="text-sm text-[var(--muted)]">Grade {report.grade}</p>
        </div>
      </div>
      <p className="mt-4 text-[var(--muted)]">{report.summary}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {report.dimensions.map((dim) => (
          <div key={dim.label} className="rounded-xl border border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{dim.label}</p>
              <p className="font-[family-name:var(--font-mono)] text-sm">{dim.score}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${dim.score}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{dim.detail}</p>
          </div>
        ))}
      </div>

      <ul className="mt-6 space-y-2">
        {report.flags.map((flag) => (
          <li
            key={flag.text}
            className={`rounded-lg px-3 py-2 text-sm ${
              flag.type === "green"
                ? "bg-emerald-500/10 text-emerald-200"
                : flag.type === "red"
                  ? "bg-red-500/10 text-red-200"
                  : "bg-amber-500/10 text-amber-100"
            }`}
          >
            {flag.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
