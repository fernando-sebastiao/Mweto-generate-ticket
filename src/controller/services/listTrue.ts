import { Request, Response } from "express";
import { prisma } from "../../database/db";

export const ListtrueController = async (req: Request, res: Response) => {
  const data = await prisma.servicos.findMany({
    where: {
      status: true,
    },
  });

  return res.status(200).json(data);
};
