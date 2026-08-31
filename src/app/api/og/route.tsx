import { ImageResponse } from "next/og";
import { loadFonts } from "@/lib/og/fonts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Material 3 dark palette ("Obsidian Signal") seeded from #81c784.
const colors = {
  background: "#131313",
  surface: "#201f1f",
  border: "#40493f",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c0c9bc",
  primary: "#9ce39e",
  primaryContainer: "#81c784",
  tertiary: "#7de3d8",
};

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
        padding: "48px",
        fontFamily: "Hanken Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              background: colors.primaryContainer,
            }}
          />
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "22px",
              fontWeight: 500,
              color: colors.onSurfaceVariant,
              letterSpacing: "0.2em",
            }}
          >
            INCIDENT STATUS
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              fontWeight: 600,
              color: colors.onSurface,
              textAlign: "center",
            }}
          >
            Days Without Discord Incidents
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "18px",
            }}
          >
            <span
              style={{
                fontSize: "200px",
                lineHeight: 1,
                fontWeight: 700,
                color: colors.primary,
                letterSpacing: "-0.02em",
              }}
            >
              {days}
            </span>
            <span
              style={{
                fontSize: "52px",
                fontWeight: 600,
                color: colors.onSurfaceVariant,
              }}
            >
              days
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontFamily: "JetBrains Mono",
            fontSize: "24px",
            fontWeight: 500,
            color: colors.onSurfaceVariant,
            opacity: 0.75,
          }}
        >
          {lastIncidentDate
            ? `Last incident: ${lastIncidentDate}`
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
