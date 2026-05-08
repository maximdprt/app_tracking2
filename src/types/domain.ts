export class AppError extends Error {
  constructor(
    public code: "AUTH" | "VALIDATION" | "NOT_FOUND" | "PERMISSION" | "SERVER" | "NETWORK",
    message: string,
    public cause?: unknown,
  ) {
    super(message);
  }
}

export function toUserMessage(err: unknown): string {
  if (err instanceof AppError) {
    if (err.code === "AUTH" && err.message.toLowerCase().includes("email not confirmed")) {
      return "Confirme ton email avant de te connecter.";
    }
    if (err.code === "AUTH") return "Probleme d'authentification.";
    if (err.code === "VALIDATION") return err.message;
  }
  return "Une erreur inattendue est survenue.";
}
