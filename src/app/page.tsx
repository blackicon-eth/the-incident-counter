import { getIncidentHistory, getStats } from "@/lib/counter/service";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Europe/Rome",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Europe/Rome",
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
    <main className="relative mx-auto min-h-screen max-w-400 overflow-hidden py-6 text-[#e7ebe5] sm:py-8.5">
      <div className="pointer-events-none absolute -right-60 -top-60 -z-10 size-170 rounded-full bg-[radial-gradient(circle,rgba(80,173,117,.13),transparent_68%)]" aria-hidden="true" />
      <section className="mb-13.25 w-full">
        <div className="flex w-full items-start justify-between gap-4 sm:gap-8">
          <p className="m-0 font-['DM_Mono'] text-[14px] font-medium tracking-[.14em] text-[#87948a]">DISCORD / SAFETY SIGNAL</p>
          <div className="shrink-0 font-['DM_Mono'] text-[13px] font-medium tracking-[.12em] text-[#8e9b91] sm:text-[14px]"><span className="mr-2 inline-block size-1.5 rounded-full bg-[#9ce39e] shadow-[0_0_10px_#9ce39e]" /> LIVE MONITORING</div>
        </div>
        <h1 className="m-[17px_0_21px] font-['Space_Grotesk'] text-[clamp(48px,7vw,82px)] font-bold leading-[.93] tracking-[-.07em]">Clear skies,<br /><em className="not-italic text-[#9ce39e]">so far.</em></h1>
        <p className="m-0 max-w-107.5 text-[15px] leading-[1.75] text-[#96a097]">A live record of the server&apos;s calm. Every incident resets the clock. Every quiet day is earned.</p>
      </section>

      <section className="grid gap-4.25 md:grid-cols-[1.45fr_1fr]">
        <article className="min-h-87.5 rounded-[7px] border border-[#27312b] bg-[linear-gradient(145deg,rgba(28,35,30,.94),rgba(17,22,19,.94))] p-[29px_34px_26px] shadow-[0_20px_70px_rgba(0,0,0,.18)]">
          <div className="flex items-center justify-start font-['DM_Mono'] text-[14px] font-medium tracking-[.13em] text-[#a9b5ab]"><span className="mr-2 inline-block size-1.5 rounded-full bg-[#9ce39e] shadow-[0_0_10px_#9ce39e]" /> CURRENT STREAK</div>
          <div className="my-9.5 mb-1 font-['Space_Grotesk'] text-[clamp(120px,17vw,220px)] font-bold leading-[.8] -tracking-widest transition-colors" style={{ color: accent }}>{days}</div>
          <div className="font-['DM_Mono'] text-[12px] font-medium tracking-[.14em] text-[#a8b2aa]">DAYS WITHOUT INCIDENTS</div>
          <div className="relative mt-17" aria-label={`${days} days across a 10,000 day milestone track`}>
            <div className="h-1.25 overflow-hidden rounded bg-[#303a33]"><span className="block h-full rounded-[inherit] shadow-[0_0_14px_currentColor]" style={{ width: `${Math.max(progress, 1.5)}%`, background: accent }} /></div>
            <div className="absolute inset-x-0 -top-1 h-6.25">
              {MILESTONES.map((milestone, index) => (
                <span
                  className="absolute flex -translate-x-1/2 flex-col items-center font-['DM_Mono'] text-[12px] text-[#657268] sm:text-[14px]"
                  key={milestone}
                  style={{ left: `${(index + 1) * (100 / MILESTONES.length)}%` }}
                >
                  <i className={`size-3.25 rounded-full border-2 bg-[#151b17] ${days >= milestone ? "border-[#9ce39e] bg-[#9ce39e] shadow-[0_0_10px_rgba(156,227,158,.5)]" : "border-[#303a33]"}`} />
                  <b className="mt-1.75 whitespace-nowrap font-normal">{milestone >= 1000 ? `${milestone / 1000}k` : milestone}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between font-['DM_Mono'] text-[13px] text-[#68746b]"><span>0 days</span></div>
        </article>

        <div className="grid gap-4.25">
          <article className="flex min-h-41.5 items-center gap-4.25 rounded-[7px] border border-[#27312b] bg-[linear-gradient(145deg,rgba(28,35,30,.94),rgba(17,22,19,.94))] p-6.75 shadow-[0_20px_70px_rgba(0,0,0,.18)]">
            <span className="grid size-10.5 shrink-0 place-items-center rounded-full border border-[#39463d] text-[22px] text-[#9ce39e]">↯</span>
            <div><p className="m-0 font-['DM_Mono'] text-[14px] font-medium tracking-[.14em] text-[#87948a]">TOTAL INCIDENTS</p><strong className="mt-2.5 block font-['Space_Grotesk'] text-[clamp(20px,2.5vw,28px)] font-semibold tracking-[-.04em] text-[#e7ebe5]">{totalIncidents}</strong></div>
            <span className="ml-auto self-start text-lg text-[#68776c]">▦</span>
          </article>
          <article className="flex min-h-41.5 items-center gap-4.25 rounded-[7px] border border-[#27312b] bg-[linear-gradient(145deg,rgba(28,35,30,.94),rgba(17,22,19,.94))] p-6.75 shadow-[0_20px_70px_rgba(0,0,0,.18)]">
            <span className="grid size-10.5 shrink-0 place-items-center rounded-full border border-[#39463d] text-[22px] text-[#9ce39e]">◷</span>
            <div><p className="m-0 font-['DM_Mono'] text-[14px] font-medium tracking-[.14em] text-[#87948a]">LAST RESET</p><strong className="mt-2.5 block font-['Space_Grotesk'] text-[clamp(20px,2.5vw,28px)] font-semibold tracking-[-.04em] text-[#e7ebe5]">{mostRecentIncident ? formatDate(mostRecentIncident.createdAt) : "No incidents yet"}</strong></div>
            <span className="ml-auto self-start text-lg text-[#68776c]">◷</span>
          </article>
        </div>
      </section>

      <section className="mt-18.25">
        <div className="mb-4.75 flex items-center justify-between"><div><p className="m-0 font-['DM_Mono'] text-[14px] font-medium tracking-[.14em] text-[#87948a]">AUDIT TRAIL</p><h2 className="m-[9px_0_0] font-['Space_Grotesk'] text-[29px] font-semibold tracking-tighter">Incident history</h2></div><span className="rounded-[3px] border border-[#344238] px-2.75 py-2 font-['DM_Mono'] text-[13px] font-medium tracking-[.12em] text-[#9ba99e]">{history.length} RECORDS</span></div>
        <div className="overflow-hidden rounded-[7px] border border-[#27312b] bg-[linear-gradient(145deg,rgba(28,35,30,.94),rgba(17,22,19,.94))] shadow-[0_20px_70px_rgba(0,0,0,.18)]">
          {history.length === 0 ? <div className="px-6 py-12.5 text-center text-sm text-[#89968c]">No incidents have been registered. Keep the streak alive.</div> : history.map((incident, index) => (
            <article className="grid min-h-24 grid-cols-[29px_1fr] gap-4.25 border-b border-[#27312b] px-4.25 py-5 last:border-b-0 sm:grid-cols-[39px_1fr_auto] sm:px-6.75 sm:py-5.5" key={incident.id}>
              <div className="relative flex justify-center"><span className="z-1 grid size-6.25 place-items-center rounded-full border border-[#986b6b] bg-[#251d1d] font-['DM_Mono'] text-[13px] font-medium text-[#e49b9b]">!</span>{index < history.length - 1 && <i className="absolute top-6.25 -bottom-5.5 w-px bg-[#3a332f]" />}</div>
              <div className="min-w-0"><div className="flex justify-start gap-2.25 text-[14px] leading-[1.8] text-[#829087] max-sm:block"><time className="font-['DM_Mono']">{formatDate(incident.createdAt)}</time><span className="mx-1 text-[#4b574e] sm:mx-0">/</span><span className="font-['DM_Mono']">reported by <b className="font-medium text-[#b7c2b9]">{incident.username}</b></span></div><p className="m-[10px_0_0] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#d6ddd5]">{incident.reason || "No reason provided"}</p></div>
              <span className="hidden self-center font-['DM_Mono'] text-[13px] text-[#536057] sm:block">#{String(incident.id).padStart(3, "0")}</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-13.5 flex flex-col font-['DM_Mono'] text-[12px] leading-7 tracking-[.08em] text-[#536057] sm:flex-row sm:items-center sm:justify-between"><span>COUNTER STATE: DERIVED LIVE</span><span>UTC · DATA PERSISTED IN TURSO</span></footer>
    </main>
  );
}
