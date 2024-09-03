import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { updateTicketStatus } from "../../models/tickets/tickets";

const statusSchema = z.object({
  status: z.enum(["espera", "atendido", "cancelado", "chamando", "atendendo"]),
});

export const updateTicketStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id_ticket } = req.params;
    const verificarStatus = statusSchema.safeParse(req.body);
    if (!verificarStatus.success) {
      throw new CustomError(
        "Erro de Validação",
        400,
        verificarStatus.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    // Verifica se o ID fornecido existe
    const verificarId = await prisma.ticket.findUnique({
      where: { id: Number(id_ticket) },
    });

    if (!verificarId) {
      throw new CustomError("Este id não existe!", 400, ["Este id não existe"]);
    }
    const { status } = verificarStatus.data;
    // Atualiza o serviço no banco de dados
    const dados = await updateTicketStatus(Number(id_ticket), status);

    return res.status(200).json({ message: "Ticket atualizado", dados });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
};
