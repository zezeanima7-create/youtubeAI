import json
from pathlib import Path
from math import floor


ROOT = Path(__file__).parent
CONFIG_PATH = ROOT / "config.json"


def ask_number(label, minimum=0):
    while True:
        try:
            value = float(input(label).replace(",", "."))
            if value < minimum:
                print(f"Digite um número igual ou maior que {minimum}.")
                continue
            return value
        except ValueError:
            print("Digite apenas um número válido.")


def run_calculator():
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        config = json.load(file)

    print("\n=== Calculadora de postagens ===")
    videos = ask_number("Vídeos por postagem: ", 1)
    interval = ask_number("Intervalo entre postagens (minutos): ", 1)
    hours = ask_number("Horas de postagem por dia: ", 0)
    days = ask_number("Quantidade de dias: ", 0)

    posts_per_day = floor((hours * 60) / interval)
    daily_total = posts_per_day * videos
    period_total = daily_total * days

    print("\n=== Resultado estimado ===")
    print(f"Postagens por dia: {posts_per_day:g}")
    print(f"Vídeos por dia: {daily_total:g}")
    print(f"Vídeos em {days:g} dias: {period_total:g}")

    limit = config.get("daily_video_limit")
    if limit is not None and daily_total > limit:
        print(
            f"\nAtenção: isso ultrapassa o limite configurado "
            f"no projeto ({limit} vídeos por dia)."
        )

    print(
        "\nA estimativa considera que as postagens acontecem durante "
        "todas as horas informadas. Ela não publica vídeos."
    )
