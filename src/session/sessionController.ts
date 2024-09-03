import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { CustomError } from "../errors/CustomError";

export interface decodedUser {
  id: number;
}

const loginSchema = z.object({
  email: z
    .string({ required_error: "Este campo não pode ser nulo!" })
    .email({ message: "Precisa ser do tipo email@!" }),
  password: z
    .string({ required_error: "Este campo não pode estar vázio!" })
    .min(6, { message: "Este campo precisa ter no minímo 6 caractéres!" }),
});

const prisma = new PrismaClient();

// Função para login de usuário
export const loginUser = async (req: Request, res: Response) => {
  try {
    //verificando os dados no zod
    const verificar = loginSchema.safeParse(
      req.body as { email: string; password: string }
    );
    if (!verificar.success) {
      throw new CustomError(
        "Erros de validação",
        400,
        verificar.error.errors.map(
          (error) => `${error.path[0]}: ${error.message}`
        )
      );
    }

    const { email, password } = verificar.data;

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new CustomError("Credenciais inválidas.", 400);
    }

    // Verifica se o usuário está ativo
    if (!user.activo) {
      throw new CustomError(
        "Conta desativada. Entre em contato com o administrador.",
        400,
        ["Conta desativada. Entre em contato com o administrador."]
      );
    }

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      throw new CustomError("Credenciais inválidas.", 400);
    }

    // Gera um token JWT para autenticação
    const token = jwt.sign(
      { userId: user.id, email: user.email, isSuperAdmin: user.is_super_admin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );
    req.user = { id: user.id };
    console.log(req.user.id);
    return res.status(200).json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};
