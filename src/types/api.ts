export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  timestamp: string;
}
