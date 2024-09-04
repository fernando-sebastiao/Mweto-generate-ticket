import { Router } from "express";
import { createPostoController } from "../controller/posto/create";
import { destroyPostoController } from "../controller/posto/destroy";
import { listallPosto } from "../controller/posto/list";
import { updatePostoController } from "../controller/posto/update";

export const postoRoutes = Router();

postoRoutes.post("/create", createPostoController);
postoRoutes.put("/update/:id", updatePostoController);
postoRoutes.delete("/delete/:id", destroyPostoController);
postoRoutes.get("/", listallPosto);
