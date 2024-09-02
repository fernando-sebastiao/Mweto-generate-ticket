import { Request, Response } from "express";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { createService } from "../../models/services/services";
import { ServiceSchema } from "../../util/validation/service";

export const createServiveController = async (req: Request, res: Response) => {
  try {
    // Valida o corpo da requisição
    const verificar = ServiceSchema.safeParse(
      req.body as { nome_servico: string; status: boolean }
    );

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

    const { nome_servico, status } = verificar.data;

    // Verifica se o serviço já existe
    const servicoExistente = await prisma.servicos.findFirst({
      where: { nome_servico },
    });

    if (servicoExistente) {
      throw new CustomError("Serviço já existe", 400, [
        "Este serviço já está cadastrado.",
      ]);
    }

    // Cria o serviço no banco de dados
    const dados = await createService(nome_servico, status);

    // Retorna o serviço criado
    return res.status(201).json({ message: "Serviço criado", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
