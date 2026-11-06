export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.GEMINI_API_KEY) {
    return Response.json({ error: "A chave Gemini não está configurada." }, { status: 503 });
  }
  if (!env.AI || typeof env.AI.run !== "function") {
    return Response.json({
      error: "Falta ativar o Workers AI no Cloudflare: Settings > Bindings > Add > Workers AI, com o nome AI. Depois faça um novo deploy."
    }, { status: 503 });
  }

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Envie os dados em JSON." }, { status: 400 }); }

  const topic = String(body.topic || "dica útil para o cotidiano").trim().slice(0, 180);
  const script = String(body.script || "").trim().slice(0, 6000);
  if (!script) return Response.json({ error: "Gere um roteiro antes da imagem." }, { status: 400 });

  try {
    const promptResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Crie um único prompt em português ou inglês para gerar UMA imagem didática que ensine visualmente a dica deste Short.
Tema: ${topic}
Roteiro: ${script}
A imagem deve mostrar a ação, objeto ou situação principal de forma clara e fácil de entender, como uma fotografia instrutiva profissional. Composição vertical de retrato, pensada para 9:16, com o assunto principal centralizado e espaço seguro nas bordas. Uma única cena coerente. Sem palavras, letras, números, legendas, setas, marcas d'água ou logotipos. Não dividir em quadros, não criar colagem, não criar sequência de passos. Não invente detalhes que contradigam o roteiro.
Retorne somente o prompt final, sem explicações.` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 450 }
      })
    });
    const promptData = await promptResponse.json();
    if (!promptResponse.ok) {
      return Response.json({ error: promptData.error?.message || "Não foi possível preparar a imagem." }, { status: promptResponse.status });
    }
    const imagePrompt = promptData.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!imagePrompt) return Response.json({ error: "Não foi possível criar a descrição da imagem." }, { status: 502 });

    const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
      prompt: imagePrompt.slice(0, 2000),
      steps: 4
    });
    if (!result?.image) {
      return Response.json({ error: "O Cloudflare não retornou a imagem." }, { status: 502 });
    }
    return Response.json({
      image: `data:image/jpeg;charset=utf-8;base64,${result.image}`,
      model: "Cloudflare Workers AI — FLUX.1 schnell"
    });
  } catch (error) {
    return Response.json({
      error: error?.message || "Falha ao gerar a imagem com Workers AI."
    }, { status: 502 });
  }
}