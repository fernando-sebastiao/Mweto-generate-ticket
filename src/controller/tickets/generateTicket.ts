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

    // Inserir o ticket inicialmente sem o número completo do ticket
    const ticket = await prisma.ticket.create({
      data: {
        id_servico,
        nome_servico: servicoExistente.nome_servico,
        data: new Date(), // Data atual sem ajuste manual
        hora: new Date(), // Hora atual sem ajuste manual
        id_utilizador: null, //req.user?.id
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
    const doc = new PDFDocument({ size: "A4" }); // Tamanho A4
    const writeStream = fs.createWriteStream(fileName);

    doc.pipe(writeStream);

    // Definindo margens e centralizando o conteúdo
    const margemSuperior = 100;
    doc.moveDown(margemSuperior / 25);

    // Título e informações acima da senha
    doc.fontSize(16).text("Dev Bantu Tecnology", { align: "center" });
    doc.text("Consultoria, Fiscalização e Criação de Software!", {
      align: "center",
    });
    doc.moveDown();

    // Usando a data e hora armazenadas no ticket
    doc.text(`Data/Hora: ${ticketAtualizado.data.toLocaleString()}`, {
      align: "center",
    });

    // Adicionando espaçamento antes da senha
    doc.moveDown(2);

    // Centralizando a senha
    const textoSenha = `Senha: ${numeroTicket}`;
    doc.fontSize(25).text(textoSenha, { align: "center" });

    // Adicionando instruções abaixo da senha
    doc.moveDown(2);
    doc
      .fontSize(10)
      .text(
        "Por favor, ao final de seu atendimento nos informe o que você achou do mesmo.",
        { align: "center" }
      );
    doc.text(
      "Para isso, o site https://www.mweto.com/reagirticket com seu smartphone até as 22:00 de hoje.",
      { align: "center" }
    );

    // Finalizar o documento PDF
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
