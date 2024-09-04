import { Router } from "express";
import { loginUser } from "../session/sessionController";
import { postoRoutes } from "./posto";
import { ServiceRoutes } from "./servicesRoutes";
import ticketRoutes from "./ticketRoutes";

export const routes = Router();
//rota para fazer login
routes.post("/login", loginUser);

//rotas dos serviços
routes.use("/services", ServiceRoutes);
//rotas do ticket
routes.use("/ticket", ticketRoutes);
//rotas do posto
routes.use("/posto", postoRoutes);
