import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(160deg, #141926 0%, #0a0d14 100%)",
        padding: "48px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: "28px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: "#57F287",
              boxShadow: "0 0 16px rgba(87, 242, 135, 0.8)",
            }}
          />
          <span
            style={{
              fontSize: "28px",
              color: "#9BA3B0",
              fontWeight: 600,
              letterSpacing: "5px",
              textTransform: "uppercase",
            }}
          >
            Incident Status
          </span>
        </div>

        <div
          style={{
            fontSize: "42px",
            color: "#E6E8EE",
            fontWeight: 600,
            marginBottom: "40px",
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
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontSize: "230px",
              lineHeight: 1,
              color: "#57F287",
              fontWeight: 800,
              letterSpacing: "-6px",
            }}
          >
            {days}
          </span>
          <span
            style={{
              fontSize: "52px",
              color: "#9BA3B0",
              fontWeight: 600,
            }}
          >
            days
          </span>
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "#6B7280",
            fontWeight: 500,
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

  return new ImageResponse(
    <OgCard days={days} lastIncidentDate={lastIncidentDate} />,
    {
      width: 1200,
      height: 630,
    },
  );
}
