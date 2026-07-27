import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { RegisterService } from "../application/RegisterService";
import { RegisterSchema } from "./dto/register.dto";
import type { RegisterResult } from "../application/RegisterService";

const service = new RegisterService();

class RegisterHandler extends Handler<unknown, RegisterResult> {
  async handle(input: unknown, _uid: string): Promise<RegisterResult> {
    const parsed = RegisterSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(parsed.data.email, parsed.data.password, parsed.data.name);
  }
}

export const register = new RegisterHandler().toFunction();
