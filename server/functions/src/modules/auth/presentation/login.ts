import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { LoginService } from "../application/LoginService";
import { LoginSchema } from "./dto/login.dto";
import type { LoginResult } from "../application/LoginService";

const service = new LoginService();

class LoginHandler extends Handler<unknown, LoginResult> {
  async handle(input: unknown, _uid: string): Promise<LoginResult> {
    const parsed = LoginSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(parsed.data.email, parsed.data.password);
  }
}

export const login = new LoginHandler().toFunction();
