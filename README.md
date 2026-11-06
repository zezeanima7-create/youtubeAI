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
