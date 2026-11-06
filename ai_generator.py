import os
from google import genai


MODEL = "gemini-2.5-flash-lite"


def run_youtube_ai():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\nA chave GEMINI_API_KEY não foi encontrada.")
        print("Configure a chave como variável de ambiente no computador/ambiente onde executar o programa.")
        print("Nunca escreva a chave diretamente neste arquivo.")
        return

    topic = input("\nTema (Enter para uma dica aleatória): ").strip()
    style = input("Estilo (Enter para direto e curioso): ").strip() or "direto e curioso"
    if not topic:
        topic = "escolha uma dica útil e pouco óbvia para o cotidiano"

    prompt = f"""
Crie um roteiro original para o canal brasileiro de Shorts
"Dicas Rápidas que Salvam".
Tema: {topic}
Estilo: {style}
Duração aproximada: 20 a 35 segundos.

Entregue título, gancho, narração natural, textos curtos na tela,
ideia visual vertical 9:16, legenda, até 5 hashtags e referências
confiáveis para checagem.

Não invente fatos, estatísticas ou fontes. Se não tiver certeza,
marque a informação para revisão. Em temas de saúde, animais,
eletricidade, fogo, produtos químicos ou segurança, dê somente
orientações gerais seguras e recomende ajuda profissional quando
necessário. Não ensine práticas perigosas. Não copie outros canais.
Finalize a narração com:
"Gostou da dica? Deixe o like e inscreva-se para mais dicas!"
Não diga que o vídeo foi publicado.
"""

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        print("\n=== ROTEIRO GERADO ===\n")
        print(response.text or "A IA não retornou texto.")
        print("\nRevise as informações e as fontes antes de usar.")
    except Exception as error:
        print("\nNão foi possível consultar o Gemini.")
        print("Confira a chave, a conexão e os limites da API.")
        print(f"Detalhe técnico: {error}")
