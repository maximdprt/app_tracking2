import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/services/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** App routes that require authentication — redirect unauthenticated users at the edge
 *  to avoid full server-component round-trip before the (app)/layout.tsx redirect fires. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/nutrition",
  "/training",
  "/stats",
  "/habits",
  "/coach",
  "/profile",
  "/onboarding",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected) {
    // Lightweight auth check at the edge — only reads the session cookie, no DB call
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
