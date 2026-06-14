import { AppError } from "../../../shared/errors/app-error";
import { SetupGateway, SetupService } from "./setup-service";

describe("SetupService", () => {
  let gateway: { isConfigured: jest.Mock; createAccount: jest.Mock };
  let service: SetupService;

  beforeEach(() => {
    gateway = {
      isConfigured: jest.fn().mockReturnValue(false),
      createAccount: jest.fn().mockReturnValue("rafael.sqlite"),
    };
    service = new SetupService(gateway as unknown as SetupGateway);
  });

  it("status reflete o gateway", () => {
    expect(service.status()).toEqual({ configured: false });
    gateway.isConfigured.mockReturnValue(true);
    expect(service.status()).toEqual({ configured: true });
  });

  it("cria a conta com o nome informado (trim aplicado)", async () => {
    const result = await service.execute("  Rafael  ");

    expect(result).toEqual({ username: "Rafael", file: "rafael.sqlite" });
    expect(gateway.createAccount).toHaveBeenCalledWith("Rafael");
  });

  it("rejeita nome vazio (400)", async () => {
    await expect(service.execute("   ")).rejects.toBeInstanceOf(AppError);
    expect(gateway.createAccount).not.toHaveBeenCalled();
  });

  it("rejeita quando já existe conta (409)", async () => {
    gateway.isConfigured.mockReturnValue(true);

    await expect(service.execute("Rafael")).rejects.toBeInstanceOf(AppError);
    expect(gateway.createAccount).not.toHaveBeenCalled();
  });
});
