import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Shifra Code — Software company in Amman, Jordan";

// Latin-only text: the OG renderer has no bundled Arabic font.
export default function OpengraphImage() {
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
          background: "radial-gradient(circle at 50% 120%, #1d3a7a 0%, #000 60%)",
          color: "#f5f5f7",
        }}
      >
        <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -4 }}>Shifra Code</div>
        <div style={{ fontSize: 44, marginTop: 12, color: "#86868b" }}>Websites · Apps · SaaS · AI</div>
        <div style={{ fontSize: 30, marginTop: 36, color: "#2997ff" }}>shifracode.com · Amman, Jordan</div>
      </div>
    ),
    size,
  );
}
