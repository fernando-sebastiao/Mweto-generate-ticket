import { Request, Response } from "express";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { updateService } from "../../models/services/services";
import { ServiceSchema } from "../../util/validation/service";

export const updateServiceController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o serviço com o ID fornecido existe
    const verificarId = await prisma.servicos.findUnique({
      where: { id: Number(id) },
    });

    if (!verificarId) {
      throw new CustomError("Este id não existe!", 400, ["Este id não existe"]);
    }

    // Valida os dados do corpo da requisição
    const verificar = ServiceSchema.safeParse(
      req.body as { nome_servico: string; status: boolean }
    );
    if (!verificar.success) {
      throw new CustomError(
        "Erro de validação",
        400,
        verificar.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    const { nome_servico, status } = verificar.data;

    // Verifica se já existe outro serviço com o mesmo nome
    const servicoExistente = await prisma.servicos.findFirst({
      where: {
        nome_servico,
        id: { not: Number(id) }, // Garante que estamos verificando serviços diferentes
      },
    });

    if (servicoExistente) {
      throw new CustomError("Serviço já existe", 400, [
        "Este serviço já está cadastrado.",
      ]);
    }

    // Atualiza o serviço no banco de dados
    const dados = await updateService(Number(id), nome_servico, status);

    return res.status(200).json({ message: "Serviço atualizado", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
