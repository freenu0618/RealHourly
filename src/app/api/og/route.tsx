import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const logoData = await readFile(join(process.cwd(), "public/images/logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFFDF7 0%, #FFF8EE 50%, #F0F7F4 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="RealHourly"
          width={180}
          height={180}
        />
        <div
          style={{
            marginTop: 24,
            fontSize: 48,
            fontWeight: 800,
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
          }}
        >
          RealHourly
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 22,
            color: "#6b7280",
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Find your real hourly rate
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
