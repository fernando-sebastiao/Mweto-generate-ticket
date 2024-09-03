import { Request, Response } from "express";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { disableService } from "../../models/services/services";

export const disableServiceController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //verificar se existe
    const verificarId = await prisma.servicos.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!verificarId) {
      throw new CustomError("Este id não existe!", 400, [
        "Este id não existe!",
      ]);
    }
    //desabilitando serviço
    const dados = await disableService(Number(id));
    return res.status(200).json({ message: "Serviço desabilitado", dados });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
};
