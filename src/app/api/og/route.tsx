import { ImageResponse } from "next/og";
import { loadFonts } from "@/lib/og/fonts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Material 3 dark palette ("Obsidian Signal") seeded from #81c784.
const colors = {
  background: "#131313",
  surfaceContainerLow: "#1c1b1b",
  surfaceContainerHigh: "#2a2a2a",
  onSurfaceVariant: "#c0c9bc",
  primary: "#9ce39e",
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// HSL (h 0-360, s/l 0-100) -> hex string.
function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) =>
    ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const to = (n: number) =>
    Math.round(255 * f(n))
      .toString(16)
      .padStart(2, "0");
  return `#${to(0)}${to(8)}${to(4)}`;
}

// Red at 0 days, green at 100+ days.
function daysToColor(days: number): string {
  const t = clamp01(days / 100);
  const h = lerp(0, 122, t);
  const s = lerp(73, 56, t);
  const l = lerp(77, 75, t);
  return hslToHex(h, s, l);
}

function formatReason(reason?: string): string | undefined {
  if (!reason) {
    return undefined;
  }

  const normalized = reason.replace(/\s+/g, " ").trim();
  return normalized.length > 60 ? `${normalized.slice(0, 57)}...` : normalized;
}

function formatHumanDate(iso?: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface OgProps {
  days: string;
  lastIncidentDate?: string;
  reason?: string;
}

function OgCard({ days, lastIncidentDate, reason }: OgProps) {
  const daysNum = Number.parseInt(days, 10) || 0;
  const numberColor = daysToColor(daysNum);
  const displayReason = formatReason(reason);
  const hasReason = Boolean(displayReason);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        padding: "34px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          background: colors.surfaceContainerLow,
          border: `1px solid ${colors.surfaceContainerHigh}`,
          borderRadius: "36px",
          padding: hasReason ? "57px 96px" : "72px 96px",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: "40px",
            fontWeight: 500,
            color: colors.onSurfaceVariant,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Days Without Discord Incidents
        </div>

        <span
          style={{
            fontSize: "210px",
            lineHeight: 1,
            fontWeight: 700,
            color: numberColor,
            letterSpacing: "-0.02em",
            fontFamily: "Noto Sans",
            marginTop: hasReason ? "52px" : "64px",
            marginBottom: hasReason ? "52px" : "64px",
          }}
        >
          {days}
        </span>

        <div
          style={{
            fontFamily: "Noto Sans",
            fontSize: "36px",
            fontWeight: 400,
            color: colors.onSurfaceVariant,
            opacity: 0.8,
          }}
        >
          {lastIncidentDate
            ? `Last incident: ${formatHumanDate(lastIncidentDate)}`
            : "No incidents recorded yet"}
        </div>
        {displayReason && (
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              alignSelf: "center",
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
              color: colors.onSurfaceVariant,
              fontFamily: "Noto Sans",
              fontSize: "24px",
              fontWeight: 400,
              opacity: 0.65,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {`"${displayReason}"`}
          </div>
        )}
      </div>
    </div>
  );
}

export async function GET(request: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(request.url);

  const daysParam = searchParams.get("days") ?? "0";
  const lastIncidentDate = searchParams.get("lastIncidentDate") ?? undefined;
  const reason = searchParams.get("reason") ?? undefined;

  const days = /^\d+$/.test(daysParam) ? daysParam : "0";
  const fonts = await loadFonts();

  return new ImageResponse(
    <OgCard days={days} lastIncidentDate={lastIncidentDate} reason={reason} />,
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
