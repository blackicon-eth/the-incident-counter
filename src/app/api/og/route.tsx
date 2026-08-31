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
}

function OgCard({ days, lastIncidentDate }: OgProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        padding: "32px",
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
          padding: "72px 96px",
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
            color: colors.primary,
            letterSpacing: "-0.02em",
            fontFamily: "Hanken Grotesk",
            marginTop: "64px",
            marginBottom: "64px",
          }}
        >
          {days}
        </span>

        <div
          style={{
            fontFamily: "Hanken Grotesk",
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
      </div>
    </div>
  );
}

export async function GET(request: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(request.url);

  const daysParam = searchParams.get("days") ?? "0";
  const lastIncidentDate = searchParams.get("lastIncidentDate") ?? undefined;

  const days = /^\d+$/.test(daysParam) ? daysParam : "0";
  const fonts = await loadFonts();

  return new ImageResponse(
    <OgCard days={days} lastIncidentDate={lastIncidentDate} />,
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
