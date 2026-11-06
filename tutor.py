def run_tutor():
    print("\n=== Professor de Python ===")
    print("Aula 1: variáveis e operações")
    print("Uma variável guarda um valor que o programa pode usar.")
    print('Exemplo: pontos = 10')
    print("\nDesafio:")
    print("Crie uma variável chamada pontos com o valor 10.")
    print("Depois aumente esse valor em 5 e mostre o resultado.")

    answer = input("\nDigite seu código (uma linha): ").strip().replace(" ", "")

    accepted = {
        "pontos=10;pontos=pontos+5;print(pontos)",
        "pontos=10;pontos+=5;print(pontos)",
    }

    normalized = answer.replace("\n", ";")
    if normalized in accepted:
        print("Correto! O resultado é 15.")
    else:
        print("Ainda não está correto. Dica: use pontos = pontos + 5.")
        print("Tente novamente na próxima rodada.")
