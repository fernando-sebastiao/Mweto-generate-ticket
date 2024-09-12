import { Request, Response } from "express";
import { z } from "zod";
import { CustomError } from "../../errors/CustomError";
import { createPosto } from "../../models/postos/posto";

export const postoSchema = z.object({
  nome: z
    .string({ required_error: "O nome do posto é obrigatório!" })
    .min(6, { message: "O posto precisa ter no minímo 6 caractéres!" }),
});

export const createPostoController = async (req: Request, res: Response) => {
  try {
    // Valida o corpo da requisição
    const verificar = postoSchema.safeParse(req.body as { nome: string });

    if (!verificar.success) {
      // Erro de validação
      throw new CustomError(
        "Erro de validação",
        400,
        verificar.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    const { nome } = verificar.data;
    // Cria o serviço no banco de dados
    const dados = await createPosto(nome);

    // Retorna o serviço criado
    return res.status(201).json({ message: "Posto criado!", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
