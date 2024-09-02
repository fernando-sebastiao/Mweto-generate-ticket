import { prisma } from "../../database/db";

export const createService = async (nome: string, status: boolean) => {
  const dados = await prisma.servicos.create({
    data: {
      nome_servico: nome,
      status,
    },
  });
  return dados;
};

export const updateService = async (
  id: string,
  nome_servico: string,
  status: boolean
) => {
  const dados = await prisma.servicos.update({
    where: {
      id: Number(id),
    },
    data: {
      nome_servico,
      status,
    },
  });
  return dados;
};

export const destroyService = async (id: number) => {
  const dados = await prisma.servicos.delete({
    where: { id: Number(id) },
  });
  return dados;
};
