import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";

// Schema de validação usando Zod
const generateTicketBodySchema = z.object({
  id_servico: z.number({ required_error: "O campo id_servico é obrigatório!" }),
  reacao: z
    .number({ required_error: "O campo reacao é obrigatório!" })
    .min(0, { message: "Reação inválida! Deve ser um número entre 0 e 5." })
    .max(5, { message: "Reação inválida! Deve ser um número entre 0 e 5." }),
});

const generateTicketParamsSchema = z.object({
  letra: z
    .string({ required_error: "O parâmetro letra é obrigatório!" })
    .length(2, { message: "A letra deve ter exatamente 2 caracteres!" }),
});

export const generateTicketController = async (req: Request, res: Response) => {
  try {
    // Validação do corpo da requisição (body)
    const verificarBody = generateTicketBodySchema.safeParse(req.body);
    if (!verificarBody.success) {
      throw new CustomError(
        "Erros de validação no corpo da requisição",
        400,
        verificarBody.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    // Validação dos parâmetros da URL (params)
    const verificarParams = generateTicketParamsSchema.safeParse(req.params);
    if (!verificarParams.success) {
      throw new CustomError(
        "A campo letra passada por paramêtro, precisa ter no minímo 2 caractéres!",
        400,
        verificarParams.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    const { id_servico, reacao } = verificarBody.data;
    const { letra } = verificarParams.data;

    // Verificação se o serviço existe no banco de dados
    const servicoExistente = await prisma.servicos.findUnique({
      where: { id: id_servico },
    });

    if (!servicoExistente) {
      throw new CustomError("Serviço não encontrado.", 404);
    }

    // Incrementar 1 hora para ajustar ao fuso horário de Angola
    const dataComAjuste = new Date();
    dataComAjuste.setHours(dataComAjuste.getHours() + 1);

    // Inserir o ticket inicialmente sem o número completo do ticket
    const ticket = await prisma.ticket.create({
      data: {
        id_servico,
        nome_servico: servicoExistente.nome_servico, // Nome do serviço
        data: dataComAjuste, // Armazenando a data ajustada
        hora: dataComAjuste, // Hora ajustada
        id_utilizador: req.user?.id, // Usando o ID do usuário logado
        status: "espera", // Status inicial do ticket
        reacao, // Passando a reação validada
        senha: letra, // Inicialmente vazio
      },
    });

    // Após inserir o ticket, buscar o número de tickets gerados para o serviço no mesmo dia
    const dataAtual = new Date();
    const inicioDia = new Date(dataAtual.setHours(0, 0, 0, 0)); // Início do dia
    const fimDia = new Date(dataAtual.setHours(23, 59, 59, 999)); // Fim do dia

    const ticketCount = await prisma.ticket.count({
      where: {
        id_servico,
        data: {
          gte: inicioDia, // Tickets gerados desde o início do dia
          lte: fimDia, // Até o final do dia
        },
      },
    });

    // Gerar o número do ticket com a letra e o número
    const numeroTicket = `${letra}${String(ticketCount + 1).padStart(3, "0")}`;

    // Atualizar o ticket com o número completo
    const ticketAtualizado = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { senha: numeroTicket },
    });

    return res.status(201).json(ticketAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
