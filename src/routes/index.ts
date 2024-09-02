import { Router } from "express";
import { loginUser } from "../session/sessionController";
import { ServiceRoutes } from "./servicesRoutes";

export const routes = Router();
//rota para fazer login
routes.post("/login", loginUser);

//rotas dos serviços
routes.use("/services", ServiceRoutes);
