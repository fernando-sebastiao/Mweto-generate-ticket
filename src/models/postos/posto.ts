import { prisma } from "../../database/db";

export const createPosto = async (nome: string) => {
  const dados = await prisma.posto.create({
    data: {
      nome,
    },
  });
  return dados;
};

export const updatePosto = async (id: number, nome: string) => {
  const dados = await prisma.posto.update({
    where: { id },
    data: nome,
  });
  return dados.id;
};

export const destroyPosto = async (id: number) => {
  const dados = await prisma.posto.delete({
    where: { id: Number(id) },
  });
  return dados;
};
