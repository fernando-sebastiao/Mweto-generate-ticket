import { Request, Response } from "express";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { destroyPosto } from "../../models/postos/posto";

export const destroyPostoController = async (req: Request, res: Response) => {
  try {
    // Valida o corpo da requisição
    const { id } = req.params;

    const verificarId = await prisma.posto.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!verificarId) {
      throw new CustomError("Este id não existe!", 400, ["Este id não existe"]);
    }

    const dados = await destroyPosto(Number(id));
    // Retorna o id do pposto deletado
    return res.status(201).json({ message: "Posto Deletado", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
