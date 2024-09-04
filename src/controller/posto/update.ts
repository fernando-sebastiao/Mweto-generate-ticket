import { Request, Response } from "express";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { updatePosto } from "../../models/postos/posto";
import { postoSchema } from "./create";

export const updatePostoController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      throw new CustomError("O id precisa ser do tipo inteiro!", 400, [
        "O id precisa ser do tipo inteiro!",
      ]);
    }
    // Verifica se o serviço com o ID fornecido existe
    const verificarId = await prisma.posto.findUnique({
      where: { id: Number(id) },
    });

    if (!verificarId) {
      throw new CustomError("Este id não existe!", 400, ["Este id não existe"]);
    }

    // Valida os dados do corpo da requisição
    const verificar = postoSchema.safeParse(req.body as { nome: string });
    if (!verificar.success) {
      throw new CustomError(
        "Erro de validação",
        400,
        verificar.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    const { nome } = verificar.data;

    // Verifica se já existe outro serviço com o mesmo nome
    const servicoExistente = await prisma.posto.findFirst({
      where: {
        nome,
      },
    });

    if (servicoExistente) {
      throw new CustomError("Este posto já existe", 400, [
        "Este Posto já está cadastrado.",
      ]);
    }

    // Atualiza o serviço no banco de dados
    const dados = await updatePosto(Number(id), nome);

    return res.status(200).json({ message: "Posto atualizado!", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
