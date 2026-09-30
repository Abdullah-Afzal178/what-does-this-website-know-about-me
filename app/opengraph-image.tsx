import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/constants";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          background: "#f8fafc",
          padding: "64px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              padding: "10px 18px",
            }}
          >
            {SITE_NAME.toUpperCase()}
          </div>

          <div
            style={{
              marginTop: "36px",
              display: "flex",
              flexDirection: "column",
              fontSize: "78px",
              lineHeight: 1.02,
              fontWeight: 900,
              color: "#020617",
              maxWidth: "1000px",
            }}
          >
            <div style={{ display: "flex" }}>You opened one page.</div>
            <div style={{ display: "flex", marginTop: "8px" }}>
              <span style={{ color: "#0369a1" }}>
                It already knows where you are.
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {["Your city", "Your ISP", "Your currency", "Your browser", "Your screen"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  border: "2px solid #cbd5e1",
                  padding: "12px 22px",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#334155",
                  background: "#ffffff",
                  borderRadius: "999px",
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
