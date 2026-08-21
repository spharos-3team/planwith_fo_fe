"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="ko">
      <body>
        <main
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            fontFamily: "sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>
              페이지를 표시할 수 없습니다
            </h1>
            <button
              onClick={reset}
              style={{
                height: "44px",
                padding: "0 20px",
                border: 0,
                borderRadius: "8px",
                background: "#387bff",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
              type="button"
            >
              다시 시도
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
