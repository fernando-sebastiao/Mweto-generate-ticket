import { prisma } from "../../database/db";

export const updateTicketStatus = async (
  id_ticket: number,
  status: "espera" | "atendido" | "cancelado" | "chamando" | "atendendo"
) => {
  const dados = await prisma.ticket.update({
    where: {
      id: Number(id_ticket),
    },
    data: {
      status,
    },
  });
  return dados;
};
