export function perplexityEnabled(): boolean {
  return !!process.env.PERPLEXITY_API_KEY;
}

export async function researchWithPerplexity(query: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set.");
  }
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "You are a research assistant building the factual backbone for a piece of writing. Return stats, data points, and the strongest counterarguments, each with enough context to be usable and citable. Be concise and concrete.",
        },
        { role: "user", content: query },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Perplexity request failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
