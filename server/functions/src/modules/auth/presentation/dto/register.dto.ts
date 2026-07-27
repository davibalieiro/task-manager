import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128, "Senha deve ter no máximo 128 caracteres"),
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
