import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { LogoutService } from "../application/LogoutService";

const service = new LogoutService();

class LogoutHandler extends Handler<undefined, { message: string }> {
  async handle(_input: undefined, uid: string): Promise<{ message: string }> {
    await service.execute(uid);
    return { message: "Logout realizado com sucesso" };
  }
}

export const logout = new LogoutHandler().toFunction();
