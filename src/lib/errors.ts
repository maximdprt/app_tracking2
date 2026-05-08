export type ErrorCode =
  | "AUTH"
  | "VALIDATION"
  | "NOT_FOUND"
  | "PERMISSION"
  | "SERVER"
  | "NETWORK"
  | "RATE_LIMIT";

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toUserMessage(err: unknown): string {
  if (err instanceof AppError) {
    const m = err.message.toLowerCase();
    switch (err.code) {
      case "AUTH":
        if (m.includes("email not confirmed")) return "Confirme ton email avant de te connecter.";
        if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
        if (m.includes("already registered") || m.includes("already exists")) {
          return "Un compte existe deja avec cet email.";
        }
        if (m.includes("weak password")) return "Mot de passe trop faible (min. 6 caracteres).";
        if (m.includes("rate limit")) return "Trop de tentatives. Reessaie dans une minute.";
        return "Probleme d'authentification. Reconnecte-toi.";
      case "VALIDATION":
        return err.message;
      case "NOT_FOUND":
        return "Element introuvable.";
      case "PERMISSION":
        return "Tu n'as pas acces a cette ressource.";
      case "NETWORK":
        return "Connexion instable. Reessaie.";
      case "RATE_LIMIT":
        return "Trop de tentatives. Reessaie dans une minute.";
      case "SERVER":
      default:
        return "Une erreur serveur est survenue. Reessaie dans un instant.";
    }
  }
  console.error("[Unhandled]", err);
  return "Une erreur inattendue est survenue.";
}
