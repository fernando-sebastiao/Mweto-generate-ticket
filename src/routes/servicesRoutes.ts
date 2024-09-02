import { Router } from "express";
import { createServiveController } from "../controller/services/create";
import { destroyServiceController } from "../controller/services/destroy";
import { ListAllController } from "../controller/services/listAll";
import { ListtrueController } from "../controller/services/listTrue";
import { updateServiceController } from "../controller/services/update";

export const ServiceRoutes = Router();

ServiceRoutes.post("/create", createServiveController);
ServiceRoutes.put("/update/:id", updateServiceController);
ServiceRoutes.delete("/delete", destroyServiceController);
ServiceRoutes.get("/true", ListtrueController);
ServiceRoutes.get("/all", ListAllController);
