import { getIncidentHistory, getStats } from "@/lib/counter/service";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const MILESTONES = [7, 14, 30, 100, 365, 1000, 3000, 5000, 10000];

function formatDate(date: Date) {
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function streakColor(days: number) {
  const hue = Math.min(122, (days / 100) * 122);
  return `hsl(${hue} 72% 68%)`;
}

function milestonePosition(days: number) {
  if (days <= 0) return 0;
  if (days >= MILESTONES[MILESTONES.length - 1]) return 100;

  const nextIndex = MILESTONES.findIndex((milestone) => days < milestone);
  const previous = nextIndex === 0 ? 0 : MILESTONES[nextIndex - 1];
  const next = MILESTONES[nextIndex];
  const segment = 100 / MILESTONES.length;
  const progress = (days - previous) / (next - previous);
  return (nextIndex + progress) * segment;
}

export default async function Home() {
  const [{ streak, totalIncidents, mostRecentIncident }, history] =
    await Promise.all([getStats(), getIncidentHistory()]);
  const days = streak.days;
  const progress = milestonePosition(days);
  const accent = streakColor(days);

  return (
    <main className="dashboard-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <section className="intro reveal">
        <div className="eyebrow-row">
          <p className="eyebrow">DISCORD / SAFETY SIGNAL</p>
          <div className="status-pill"><span /> LIVE MONITORING</div>
        </div>
        <h1>Clear skies,<br /><em>so far.</em></h1>
        <p className="intro-copy">A live record of the server&apos;s calm. Every incident resets the clock. Every quiet day is earned.</p>
      </section>

      <section className="hero-grid reveal delay-one">
        <article className="streak-panel panel">
          <div className="panel-label"><span className="pulse-dot" /> CURRENT STREAK</div>
          <div className="streak-number" style={{ color: accent }}>{days}</div>
          <div className="streak-unit">DAYS WITHOUT INCIDENTS</div>
          <div className="milestone-track" aria-label={`${days} days across a 10,000 day milestone track`}>
            <div className="streak-track"><span style={{ width: `${Math.max(progress, 1.5)}%`, background: accent }} /></div>
            <div className="milestone-markers">
              {MILESTONES.map((milestone, index) => (
                <span
                  className={`milestone-marker${days >= milestone ? " reached" : ""}`}
                  key={milestone}
                  style={{ left: `${(index + 1) * (100 / MILESTONES.length)}%` }}
                >
                  <i />
                  <b>{milestone >= 1000 ? `${milestone / 1000}k` : milestone}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="track-meta"><span>0 days</span><span>10,000 day horizon</span></div>
        </article>

        <div className="metric-stack">
          <article className="metric-card panel">
            <span className="metric-icon">↯</span>
            <div><p className="metric-label">TOTAL INCIDENTS</p><strong>{totalIncidents}</strong></div>
            <span className="metric-symbol">▦</span>
          </article>
          <article className="metric-card panel">
            <span className="metric-icon">◷</span>
            <div><p className="metric-label">LAST RESET</p><strong>{mostRecentIncident ? formatDate(mostRecentIncident.createdAt) : "No incidents yet"}</strong></div>
            <span className="metric-symbol">◷</span>
          </article>
        </div>
      </section>

      <section className="content-grid reveal delay-two">
        <div className="section-heading"><div><p className="eyebrow">AUDIT TRAIL</p><h2>Incident history</h2></div><span className="count-badge">{history.length} RECORDS</span></div>
        <div className="history-panel panel">
          {history.length === 0 ? <div className="empty-state">No incidents have been registered. Keep the streak alive.</div> : history.map((incident, index) => (
            <article className="incident-row" key={incident.id}>
              <div className="timeline"><span className="incident-mark">!</span>{index < history.length - 1 && <i />}</div>
              <div className="incident-main"><div className="incident-meta"><time>{formatDate(incident.createdAt)}</time><span className="separator">/</span><span>reported by <b>{incident.username}</b></span></div><p>{incident.reason || "No reason provided"}</p></div>
              <span className="incident-id">#{String(incident.id).padStart(3, "0")}</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer"><span>COUNTER STATE: DERIVED LIVE</span><span>UTC · DATA PERSISTED IN TURSO</span></footer>
    </main>
  );
}
