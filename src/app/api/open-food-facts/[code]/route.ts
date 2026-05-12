import { NextResponse } from "next/server";

const OFF_BASE = "https://world.openfoodfacts.org/api/v2/product";

/** GET — proxy Open Food Facts (évite CORS côté navigateur). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await context.params;
  const code = raw?.replace(/\D/g, "") ?? "";
  if (code.length < 8 || code.length > 14) {
    return NextResponse.json({ error: "Code-barres invalide" }, { status: 400 });
  }

  try {
    const res = await fetch(`${OFF_BASE}/${code}.json`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Open Food Facts indisponible" }, { status: 502 });
    }
    const payload = (await res.json()) as { status?: number; product?: unknown };
    if (payload.status !== 1 || !payload.product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }
    return NextResponse.json({ code, product: payload.product });
  } catch {
    return NextResponse.json({ error: "Erreur réseau" }, { status: 502 });
  }
}
