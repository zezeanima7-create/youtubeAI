# YouTube AI + Python Tutor

Projeto em Python com dois módulos:

1. **YouTube AI** — prepara ideias, roteiros, títulos e descrições para Shorts de dicas. A publicação automática será adicionada depois, com autenticação oficial, limites diários e revisão de conteúdo.
2. **Python Tutor** — ensina programação por aulas progressivas, exercícios e correção de respostas.

## Configuração inicial

Requer Python 3.11 ou superior.

```bash
python main.py
```

## Configurações

Edite `config.json`:
- `daily_video_limit`: quantidade diária desejada (padrão: 5).
- `video_format`: formato dos vídeos (padrão: shorts).
- `topic`: assunto principal (padrão: dicas).

## Segurança

- Nunca coloque chaves de API, tokens ou senhas no código.
- Use variáveis de ambiente ou GitHub Secrets quando as integrações forem configuradas.
- A publicação no YouTube exige autorização da conta e uso da API oficial.
- O limite diário é uma configuração máxima, não uma garantia de que haverá cinco vídeos prontos ou publicados.

## Interface web e gerador Gemini

A interface está em `index.html`. O endpoint seguro da IA está em `functions/api/generate.js` e usa Cloudflare Pages Functions.

Projeto Cloudflare Pages: **youtubeai**  
Endereço: https://youtubeai-5aw.pages.dev  
Build command: vazio  
Build output directory: `.`

Para ativar o gerador:
1. Nas configurações do projeto Cloudflare Pages, abra **Settings → Variables and Secrets**.
2. Adicione `GEMINI_API_KEY` como **Secret**, com a chave criada no Google AI Studio. Não coloque a chave no HTML, no GitHub ou em mensagens.
3. Faça um novo deploy e teste a aba **YouTube AI**.

Modelo configurado: `gemini-2.5-flash-lite`. O uso depende dos limites e preços vigentes da API. Revise fatos e fontes do roteiro antes de publicar.

A função gera texto. Ela ainda não cria arquivo de vídeo, imagem, áudio ou publica no YouTube.

### Executar o gerador Python

Instale as dependências:

```bash
pip install -r requirements.txt
```

Configure `GEMINI_API_KEY` como variável de ambiente no ambiente de execução e inicie:

```bash
python main.py
```

O menu `2` chama `ai_generator.py` pelo SDK oficial `google-genai`. O modelo usado é `gemini-2.5-flash-lite`, escolhido para reduzir custo. A disponibilidade do nível gratuito e os limites podem variar por região e conta. Nunca publique a chave no repositório.
