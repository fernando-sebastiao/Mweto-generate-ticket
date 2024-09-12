import { Request, Response } from "express";
import { prisma } from "../../database/db";

export const ListAllTicketControllers = async (req: Request, res: Response) => {
  const data = await prisma.ticket.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return res.status(200).json(data);
};
