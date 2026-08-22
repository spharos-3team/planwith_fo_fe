import { ApiClientError } from "@/utils/apiClient";

export function useApiError(error: unknown): string {
  if (error == null || error === "") {
    return "";
  }

  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}
