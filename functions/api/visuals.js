export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.GEMINI_API_KEY) return Response.json({ error: "A chave Gemini não está configurada." }, { status: 503 });
  if (!env.META_MODEL_API_KEY) return Response.json({ error: "Falta configurar META_MODEL_API_KEY nos Secrets do Cloudflare Pages." }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Envie os dados em JSON." }, { status: 400 }); }

  const topic = String(body.topic || "dica útil para o cotidiano").trim().slice(0, 180);
  const script = String(body.script || "").trim().slice(0, 6000);
  if (!script) return Response.json({ error: "Gere um roteiro antes das imagens." }, { status: 400 });

  try {
    const sceneResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Crie exatamente 3 prompts de imagens para ilustrar este YouTube Short.
Tema: ${topic}
Roteiro: ${script}
Retorne somente JSON válido: {"scenes":[{"label":"Gancho","prompt":"..."},{"label":"Explicação","prompt":"..."},{"label":"Encerramento","prompt":"..."}]}.
Cada prompt descreve uma fotografia realista, vertical 9:16, sem texto, legendas, marcas d'água ou logotipos. Não inclua pessoas identificáveis. Mantenha o assunto coerente com a dica e não invente elementos factuais.` }] }],
        generationConfig: { temperature: 0.5, responseMimeType: "application/json", maxOutputTokens: 900 }
      })
    });
    const sceneData = await sceneResponse.json();
    if (!sceneResponse.ok) return Response.json({ error: sceneData.error?.message || "Não foi possível planejar as cenas." }, { status: sceneResponse.status });

    const sceneText = sceneData.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    let parsed;
    try { parsed = JSON.parse(sceneText); }
    catch { return Response.json({ error: "A IA não retornou os prompts das cenas em formato válido." }, { status: 502 }); }

    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.slice(0, 3) : [];
    if (!scenes.length) return Response.json({ error: "Nenhuma cena foi criada." }, { status: 502 });

    const images = [];
    for (const scene of scenes) {
      const prompt = String(scene.prompt || "").slice(0, 1800);
      if (!prompt) continue;
      const imageResponse = await fetch("https://api.meta.ai/v1/images/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.META_MODEL_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "muse-image-1.0", prompt, n: 1, size: "1024x1792", response_format: "b64_json", output_format: "webp" })
      });
      const imageData = await imageResponse.json();
      if (!imageResponse.ok) return Response.json({ error: imageData.error?.message || "A Meta não conseguiu gerar uma das imagens." }, { status: imageResponse.status });
      const image = imageData.data?.[0]?.b64_json;
      if (!image) return Response.json({ error: "A Meta não retornou o arquivo da imagem." }, { status: 502 });
      images.push({ label: String(scene.label || "Cena"), dataUrl: `data:image/webp;base64,${image}` });
    }
    return Response.json({ images, model: "Meta Muse Image" });
  } catch {
    return Response.json({ error: "Falha ao conectar com os serviços de IA." }, { status: 502 });
  }
}