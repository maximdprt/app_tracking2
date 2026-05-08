import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/services/supabase/server";
export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { message?: string };
  const text = `Coach Lift: ${body.message ?? ""}`;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return new NextResponse(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
