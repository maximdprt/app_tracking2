export interface EntityBase {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AppError {
  message: string;
  code?: string;
}
