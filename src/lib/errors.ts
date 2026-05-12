export type ErrorCode =
  | "AUTH"
  | "VALIDATION"
  | "NOT_FOUND"
  | "PERMISSION"
  | "SERVER"
  | "NETWORK"
  | "RATE_LIMIT";

export class AppError extends Error {
  public code: ErrorCode;
  public cause?: unknown;

  constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

export function toUserMessage(err: unknown): string {
  if (err instanceof AppError) {
    const m = err.message.toLowerCase();
    switch (err.code) {
      case "AUTH":
        if (m.includes("email not confirmed")) return "Confirme ton email avant de te connecter.";
        if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
        if (m.includes("already registered") || m.includes("already exists"))
          return "Un compte existe déjà avec cet email.";
        if (m.includes("weak password")) return "Mot de passe trop faible (min. 6 caractères).";
        if (m.includes("rate limit")) return "Trop de tentatives. Réessaie dans une minute.";
        return "Problème d'authentification.";
      case "VALIDATION":
        return err.message;
      case "NOT_FOUND":
        return "Élément introuvable.";
      case "PERMISSION":
        return "Tu n'as pas accès à cette ressource.";
      case "NETWORK":
        return "Connexion instable. Réessaie.";
      case "RATE_LIMIT":
        return "Trop de tentatives. Réessaie dans une minute.";
      case "SERVER":
      default:
        return "Une erreur serveur est survenue. Réessaie dans un instant.";
    }
  }
  if (err instanceof Error) {
    console.error("[Unhandled Error]", err);
  }
  return "Une erreur inattendue est survenue.";
}
