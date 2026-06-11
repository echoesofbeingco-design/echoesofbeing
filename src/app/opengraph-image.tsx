import { ImageResponse } from "next/og";

export const alt = "Echos of Being — A quiet space for therapy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(145deg, #2d352d 0%, #3d4a3d 50%, #2d352d 100%)",
          fontFamily: "serif",
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1px solid rgba(247, 245, 236, 0.15)",
            borderRadius: 24,
            display: "flex",
          }}
        />

        {/* Leaf accent */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(97, 121, 98, 0.4)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          🌿
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#f7f5ec",
            letterSpacing: "-1px",
            display: "flex",
          }}
        >
          Echos of Being
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 2,
            background: "rgba(97, 121, 98, 0.6)",
            margin: "20px 0",
            borderRadius: 1,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(247, 245, 236, 0.7)",
            fontWeight: 400,
            display: "flex",
          }}
        >
          A quiet space for therapy
        </div>

        {/* Services row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {["Anxiety", "Depression", "Relationships", "Trauma", "Self-Esteem"].map(
            (s) => (
              <div
                key={s}
                style={{
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: "rgba(97, 121, 98, 0.25)",
                  border: "1px solid rgba(97, 121, 98, 0.3)",
                  color: "rgba(247, 245, 236, 0.6)",
                  fontSize: 15,
                  display: "flex",
                }}
              >
                {s}
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "rgba(247, 245, 236, 0.35)",
            display: "flex",
          }}
        >
          echoesofbeing.co.in
        </div>
      </div>
    ),
    { ...size }
  );
}
