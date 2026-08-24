import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { subscribeToMyGradeUpdates } from "@/services/grade/gradeEvents";

const RECONNECT_DELAY_MILLIS = 3_000;

function waitForReconnect(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(resolve, RECONNECT_DELAY_MILLIS);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        resolve();
      },
      { once: true }
    );
  });
}

export function useGradeUpdateEvents(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();

    const listen = async () => {
      while (!controller.signal.aborted) {
        try {
          await subscribeToMyGradeUpdates({
            signal: controller.signal,
            onUpdate: () => {
              void queryClient.invalidateQueries({
                queryKey: ["grades", "me", "management"],
              });
            },
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }
          console.warn("등급 실시간 알림 연결이 끊어져 재연결합니다.", error);
        }

        await waitForReconnect(controller.signal);
      }
    };

    void listen();
    return () => controller.abort();
  }, [queryClient]);
}
