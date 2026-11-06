export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.GEMINI_API_KEY) return Response.json({ error: "A chave Gemini não está configurada." }, { status: 503 });
  if (!env.META_MODEL_API_KEY) return Response.json({ error: "Falta configurar META_MODEL_API_KEY nos Secrets do Cloudflare Pages." }, { status: 503 });

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
        contents: [{ role: "user", parts: [{ text: `Crie um único prompt para gerar UMA imagem didática que ensine visualmente a dica deste Short.
Tema: ${topic}
Roteiro: ${script}
A imagem deve mostrar a ação, objeto ou situação principal de forma clara e fácil de entender, como uma fotografia/ilustração instrutiva profissional. Composição vertical 9:16. Sem palavras, letras, números, legendas, setas com texto, marcas d'água ou logotipos. Não dividir em quadros, não criar colagem, não criar sequência de passos. Uma única cena coerente. Não invente detalhes que contradigam o roteiro.
Retorne somente o prompt final, sem explicações.` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 450 }
      })
    });
    const promptData = await promptResponse.json();
    if (!promptResponse.ok) return Response.json({ error: promptData.error?.message || "Não foi possível preparar a imagem." }, { status: promptResponse.status });
    const imagePrompt = promptData.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!imagePrompt) return Response.json({ error: "Não foi possível criar a descrição da imagem." }, { status: 502 });

    const imageResponse = await fetch("https://api.meta.ai/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.META_MODEL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "muse-image-1.0",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1792",
        response_format: "b64_json",
        output_format: "webp"
      })
    });
    const imageData = await imageResponse.json();
    if (!imageResponse.ok) return Response.json({ error: imageData.error?.message || "A Meta não conseguiu gerar a imagem." }, { status: imageResponse.status });
    const image = imageData.data?.[0]?.b64_json;
    if (!image) return Response.json({ error: "A Meta não retornou o arquivo da imagem." }, { status: 502 });
    return Response.json({ image: `data:image/webp;base64,${image}`, model: "Meta Muse Image" });
  } catch {
    return Response.json({ error: "Falha ao conectar com os serviços de IA." }, { status: 502 });
  }
}