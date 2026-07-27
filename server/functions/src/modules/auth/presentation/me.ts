import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { GetMeService } from "../application/GetMeService";
import type { MeResult } from "../application/GetMeService";

const service = new GetMeService();

class MeHandler extends Handler<void, MeResult> {
  async handle(_input: void, uid: string): Promise<MeResult> {
    return service.execute(uid);
  }
}

export const me = new MeHandler().toFunction();
