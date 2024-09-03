import { Request, Response } from "express";
import { prisma } from "../../database/db";

export const ListAllController = async (req: Request, res: Response) => {
  const data = await prisma.servicos.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return res.status(200).json(data);
};
