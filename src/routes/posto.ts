import { Router } from "express";
import { createPostoController } from "../controller/posto/create";
import { updatePostoController } from "../controller/posto/update";

export const postoRoutes = Router();

postoRoutes.post("/create", createPostoController);
postoRoutes.put("/update/:id", updatePostoController);
