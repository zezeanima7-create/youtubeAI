import json
from pathlib import Path

from tutor import run_tutor


ROOT = Path(__file__).parent
CONFIG_PATH = ROOT / "config.json"


def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def show_menu():
    config = load_config()

    print("\n=== YouTube AI + Python Tutor ===")
    print(f"Meta configurada: até {config['daily_video_limit']} Shorts por dia")
    print(f"Tema: {config['topic']}")
    print("\n1. Professor de Python")
    print("2. YouTube AI (preparação de ideias e roteiros)")
    print("0. Sair")
    return input("\nEscolha: ").strip()


def main():
    while True:
        choice = show_menu()

        if choice == "1":
            run_tutor()
        elif choice == "2":
            print("\nMódulo YouTube AI: próximo passo será criar ideias e roteiros.")
            print("A publicação ainda não está conectada.")
        elif choice == "0":
            print("Até a próxima!")
            break
        else:
            print("Opção inválida. Tente novamente.")


if __name__ == "__main__":
    main()
