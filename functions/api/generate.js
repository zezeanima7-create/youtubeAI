export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return Response.json(
      { error: "A chave da IA ainda não foi configurada no servidor." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Envie os dados em JSON." }, { status: 400 });
  }

  const topic = String(body.topic || "dica útil para o cotidiano").trim().slice(0, 180);
  const style = String(body.style || "curioso e direto").trim().slice(0, 80);
  const batchIndex = Math.max(0, Math.floor(Number(body.batchIndex) || 0));
  const batchTotal = Math.max(0, Math.min(100, Math.floor(Number(body.batchTotal) || 0)));
  const previousIdeas = Array.isArray(body.previousIdeas) ? body.previousIdeas.slice(-30).map(x => String(x).slice(0, 180)) : [];

  const prompt = `
Você é roteirista do canal brasileiro de YouTube Shorts "Dicas Rápidas que Salvam".
Crie UM roteiro original em português brasileiro sobre: ${topic}.
Estilo: ${style}. Duração aproximada: 20 a 35 segundos.
Entregue:
1. TÍTULO curto e claro.
2. GANCHO inicial que desperte curiosidade sem sensacionalismo.
3. NARRAÇÃO completa, natural e fácil de entender.
4. TEXTO NA TELA em frases curtas.
5. IDEIA VISUAL para cenas verticais 9:16.
6. LEGENDA e até 5 hashtags relevantes.
7. FONTES ou referências confiáveis para verificar as afirmações factuais.

Regras obrigatórias:
- Não invente fatos, estatísticas, estudos, fontes ou promessas.
- Se a dica envolver saúde, primeiros socorros, animais, eletricidade, fogo, produtos químicos ou segurança, use apenas orientação geral segura e indique quando procurar um profissional ou serviço de emergência.
- Não ensine procedimentos perigosos, não incentive experiências arriscadas e não prometa resultados garantidos.
- Se não tiver certeza de uma afirmação, sinalize claramente para revisão antes da publicação.
- Não copie roteiros de outros canais.
- Termine a narração com: "Gostou da dica? Deixe o like e inscreva-se para mais dicas!"
- Não afirme que o vídeo foi publicado.
`.trim();

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1400
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "A IA não conseguiu responder." },
        { status: response.status }
      );
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

    if (!text) {
      return Response.json({ error: "A IA retornou uma resposta vazia." }, { status: 502 });
    }

    return Response.json({ text, model: "Gemini 3.5 Flash-Lite" });
  } catch {
    return Response.json({ error: "Falha de conexão com o serviço de IA." }, { status: 502 });
  }
}
