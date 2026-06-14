import { AppError } from "../../../shared/errors/app-error";

/**
 * Gateway de criação da conta/banco — implementado por `database/sqlite.ts`.
 * Interface separada para o Service ser testável sem tocar no FS.
 */
export interface SetupGateway {
  isConfigured(): boolean;
  /** Cria o arquivo .sqlite + perfil e retorna o nome do arquivo. */
  createAccount(username: string): string;
}

export interface SetupStatus {
  configured: boolean;
}

export interface SetupResult {
  username: string;
  file: string;
}

export class SetupService {
  constructor(private readonly gateway: SetupGateway) {}

  status(): SetupStatus {
    return { configured: this.gateway.isConfigured() };
  }

  async execute(name: string): Promise<SetupResult> {
    const username = name?.trim();
    if (!username) {
      throw new AppError("Informe um nome para criar a conta.", 400);
    }
    if (this.gateway.isConfigured()) {
      throw new AppError("Uma conta já existe neste CodeHub.", 409);
    }

    const file = this.gateway.createAccount(username);
    return { username, file };
  }
}
