export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "999px",
          background: "#57F287",
          boxShadow: "0 0 18px rgba(87, 242, 135, 0.8)",
        }}
      />
      <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: 700 }}>
        Days Without Discord Incidents
      </h1>
      <p style={{ color: "#9ba3b0", maxWidth: "480px", lineHeight: 1.6 }}>
        A Discord bot and web service that tracks how long a server has gone
        without an incident. Add the bot to your server and use the{" "}
        <code>/days</code>, <code>/stats</code>, and <code>/incident</code>{" "}
        slash commands.
      </p>
      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
        Dynamic counter image:{" "}
        <a href="/api/og?days=42&lastIncidentDate=2026-08-01">/api/og</a>
      </p>
    </main>
  );
}
