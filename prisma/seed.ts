import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createDefaultSuperAdmin() {
  const email = "admin@default.com"; // Email padrão do super admin
  const senha_utilizador = "password123"; // Senha padrão do super admin

  // Verifica se já existe um super admin
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { is_super_admin: true },
  });

  if (existingSuperAdmin) {
    console.log("Super admin já existe.");
    return;
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(senha_utilizador, 10);

  // Cria o super admin
  const superAdmin = await prisma.user.create({
    data: {
      nome: "Super Admin",
      email: email,
      senha: hashedPassword,
      is_super_admin: true,
      activo: true,
    },
  });

  console.log("Super admin criado:", superAdmin);
}

createDefaultSuperAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
