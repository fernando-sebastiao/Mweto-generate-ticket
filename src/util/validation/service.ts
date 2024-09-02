import { z } from "zod";

export const ServiceSchema = z.object({
  nome_servico: z
    .string({ required_error: "Este campo não pode estar vázio!" })
    .min(6, {
      message: "O nome de serviço precisa ter no minímo 6 caracteres!",
    }),
  status: z.boolean().default(false),
});
