import { authenticatedFetch } from "@/utils/apiClient";

const GRADE_UPDATE_EVENTS_PATH = "/api/planwith-fo-grade/grades/me/events";

interface GradeUpdateSubscription {
  onUpdate: () => void;
  signal: AbortSignal;
}

export async function subscribeToMyGradeUpdates({
  onUpdate,
  signal,
}: GradeUpdateSubscription): Promise<void> {
  const response = await authenticatedFetch(GRADE_UPDATE_EVENTS_PATH, {
    cache: "no-store",
    headers: { Accept: "text/event-stream" },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `등급 실시간 알림 연결에 실패했습니다. (HTTP ${response.status})`
    );
  }
  if (!response.body) {
    throw new Error("등급 실시간 알림 응답 스트림이 없습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer = `${buffer}${decoder.decode(value, { stream: true })}`.replace(
        /\r\n/g,
        "\n"
      );
      let boundary = buffer.indexOf("\n\n");

      while (boundary >= 0) {
        const eventBlock = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const eventName = eventBlock
          .split("\n")
          .find((line) => line.startsWith("event:"))
          ?.slice("event:".length)
          .trim();

        if (eventName === "grade-updated") {
          onUpdate();
        }
        boundary = buffer.indexOf("\n\n");
      }
    }
  } finally {
    reader.releaseLock();
  }
}
