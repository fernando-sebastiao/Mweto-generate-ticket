import { Request, Response } from "express";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { destroyService } from "../../models/services/services";

export const destroyServiceController = async (req: Request, res: Response) => {
  try {
    // Valida o corpo da requisição
    const { id } = req.params;

    const verificarId = await prisma.servicos.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!verificarId) {
      throw new CustomError("Este id não existe!", 400, ["Este id não existe"]);
    }

    const dados = await destroyService(Number(id));

    // Retorna o serviço criado
    return res.status(201).json({ message: "Serviço Deletado", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
