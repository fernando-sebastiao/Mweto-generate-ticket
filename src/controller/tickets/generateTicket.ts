import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import z from "zod";
import { prisma } from "../../database/db";
import { CustomError } from "../../errors/CustomError";
import { imprimir } from "../../testando";

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

// Gerar ticket
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
        "O campo letra passado como parâmetro precisa ter exatamente 2 caracteres!",
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
        nome_servico: servicoExistente.nome_servico,
        data: dataComAjuste,
        hora: dataComAjuste,
        id_utilizador: req.user?.id,
        status: "espera",
        reacao,
        senha: letra,
      },
    });

    // Buscar o número de tickets gerados para o serviço no mesmo dia
    const dataAtual = new Date();
    const inicioDia = new Date(dataAtual.setHours(0, 0, 0, 0));
    const fimDia = new Date(dataAtual.setHours(23, 59, 59, 999));

    const ticketCount = await prisma.ticket.count({
      where: {
        id_servico,
        data: {
          gte: inicioDia,
          lte: fimDia,
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

    // Criar e gerar o PDF com a senha usando PDFKit
    const tmpDir = path.join(__dirname, "../../tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const fileName = path.join(tmpDir, `senha_${ticket.id}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(fileName);

    doc.pipe(writeStream);

    // Posições para centralizar o texto
    const larguraPagina = 595; // A4 em pontos (width)
    const alturaPagina = 842; // A4 em pontos (height)

    // Definindo o tamanho da fonte
    doc.fontSize(25);

    // Centralizando o texto
    const texto = `Senha: ${numeroTicket}`;
    const larguraTexto = doc.widthOfString(texto);
    const posX = (larguraPagina - larguraTexto) / 2; // Posição X para centralizar
    const posY = alturaPagina / 2; // Posição Y (metade da altura da página)

    doc.text(texto, posX, posY);
    doc.end();

    // Após gerar o PDF, enviar para a impressora
    writeStream.on("finish", () => {
      imprimir(ticket.id);
    });

    return res.status(201).json(ticketAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
