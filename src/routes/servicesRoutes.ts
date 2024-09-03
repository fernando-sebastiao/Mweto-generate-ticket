import { Router } from "express";
import { createServiveController } from "../controller/services/create";
import { destroyServiceController } from "../controller/services/destroy";
import { disableServiceController } from "../controller/services/disableService";
import { enableServiceController } from "../controller/services/enableService";
import { ListAllController } from "../controller/services/listAll";
import { ListtrueController } from "../controller/services/listTrue";
import { updateServiceController } from "../controller/services/update";

export const ServiceRoutes = Router();

ServiceRoutes.post("/create", createServiveController);
ServiceRoutes.put("/update/:id", updateServiceController);
ServiceRoutes.delete("/delete/:id", destroyServiceController);
ServiceRoutes.get("/true", ListtrueController);
ServiceRoutes.get("/all", ListAllController);
ServiceRoutes.put("/disable/:id", disableServiceController);
ServiceRoutes.put("/enable/:id", enableServiceController);
