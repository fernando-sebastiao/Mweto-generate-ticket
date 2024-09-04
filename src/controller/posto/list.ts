import { prisma } from "../../database/db";

export const listallPosto = async () => {
  const dados = await prisma.posto.findMany({
    orderBy: {
      id: "asc",
    },
  });
  return dados;
};
