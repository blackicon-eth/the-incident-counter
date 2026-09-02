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

function formatDate(date: Date) {
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function streakColor(days: number) {
  const hue = Math.min(122, (days / 100) * 122);
  return `hsl(${hue} 72% 68%)`;
}

export default async function Home() {
  const [{ streak, totalIncidents, mostRecentIncident }, history] =
    await Promise.all([getStats(), getIncidentHistory()]);
  const days = streak.days;
  const progress = Math.min(100, days);
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
          <div className="streak-track" aria-label={`${progress} days toward 100 day milestone`}>
            <span style={{ width: `${Math.max(progress, 2)}%`, background: accent }} />
          </div>
          <div className="track-meta"><span>0</span><span>100 day milestone</span></div>
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
