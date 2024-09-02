-- CreateEnum
CREATE TYPE "Status" AS ENUM ('espera', 'atendido', 'cancelado', 'chamando', 'atendendo');

-- CreateEnum
CREATE TYPE "Reacao" AS ENUM ('pessima', 'ruim', 'media', 'boa', 'otima', 'excelente');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "reset_senha" BOOLEAN NOT NULL DEFAULT false,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id_user" INTEGER NOT NULL,
    "id_role" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id_user","id_role")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id_role" INTEGER NOT NULL,
    "id_permission" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id_role","id_permission")
);

-- CreateTable
CREATE TABLE "Posto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Posto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPosto" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_posto" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPosto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicos" (
    "id" SERIAL NOT NULL,
    "nome_servico" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "id_servico" INTEGER NOT NULL,
    "nome_servico" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "hora" TIMESTAMP(3) NOT NULL,
    "id_utilizador" INTEGER,
    "status" "Status" NOT NULL,
    "reacao" "Reacao" NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPosto" ADD CONSTRAINT "UserPosto_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPosto" ADD CONSTRAINT "UserPosto_id_posto_fkey" FOREIGN KEY ("id_posto") REFERENCES "Posto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "Servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_id_utilizador_fkey" FOREIGN KEY ("id_utilizador") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
