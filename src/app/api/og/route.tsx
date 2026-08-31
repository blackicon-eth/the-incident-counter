/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { loadFonts } from "@/lib/og/fonts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Material 3 dark palette ("Obsidian Signal") seeded from #81c784.
const colors = {
  background: "#131313",
  surfaceContainerLow: "#1c1b1b",
  surfaceContainerHigh: "#2a2a2a",
  onSurface: "#e5e2e1",
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

const BOLT_PATH =
  "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z";

interface OgProps {
  days: string;
  lastIncidentDate?: string;
}

function OgCard({ days, lastIncidentDate }: OgProps) {
  const boltSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${colors.primary}" d="${BOLT_PATH}"/></svg>`,
  )}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        padding: "64px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: colors.surfaceContainerLow,
          border: `1px solid ${colors.surfaceContainerHigh}`,
          borderRadius: "32px",
          padding: "56px 72px",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: "34px",
            fontWeight: 500,
            color: colors.onSurfaceVariant,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Days Without Discord Incidents
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "48px",
            marginBottom: "48px",
          }}
        >
          <img
            src={boltSrc}
            width={160}
            height={160}
            alt=""
            style={{ display: "flex" }}
          />
          <span
            style={{
              fontSize: "150px",
              lineHeight: 1,
              fontWeight: 700,
              color: colors.primary,
              letterSpacing: "-0.02em",
              fontFamily: "Hanken Grotesk",
            }}
          >
            {days}
          </span>
        </div>

        <div
          style={{
            fontFamily: "Hanken Grotesk",
            fontSize: "32px",
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
