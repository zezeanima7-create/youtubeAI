import json
from pathlib import Path

from tutor import run_tutor
from calculator import run_calculator
from ai_generator import run_youtube_ai


ROOT = Path(__file__).parent
CONFIG_PATH = ROOT / "config.json"


def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def show_menu():
    config = load_config()

    print("\n=== YouTube AI + Professor de Programação ===")
    print(f"Meta configurada: até {config['daily_video_limit']} Shorts por dia")
    print(f"Tema: {config['topic']}")
    print("\n1. Professor de Python")
    print("2. YouTube AI (gerar roteiro com Gemini)")
    print("3. Calculadora de postagens")
    print("0. Sair")
    return input("\nEscolha: ").strip()


def main():
    while True:
        choice = show_menu()

        if choice == "1":
            run_tutor()
        elif choice == "2":
            run_youtube_ai()
        elif choice == "3":
            run_calculator()
        elif choice == "0":
            print("Até a próxima!")
            break
        else:
            print("Opção inválida. Tente novamente.")


if __name__ == "__main__":
    main()
