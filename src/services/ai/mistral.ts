export async function callMistralProxy<TPayload extends Record<string, unknown>>(
  payload: TPayload,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mistral-proxy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.jwt}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Mistral proxy error");
  }

  return response.json();
}
