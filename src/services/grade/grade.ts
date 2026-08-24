import type { GradeManagementPage } from "@/features/grade/types";
import { apiClient } from "@/utils/apiClient";

const GRADE_API_PREFIX = "/api/planwith-fo-grade";

export function getMyGradeManagementPage() {
  return apiClient<GradeManagementPage>(
    `${GRADE_API_PREFIX}/grades/me/management`
  );
}
