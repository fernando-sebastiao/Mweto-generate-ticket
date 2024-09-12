import express from "express";
import { generateTicketController } from "../controller/tickets/generateTicket";
import { ListAllTicketControllers } from "../controller/tickets/listAll";
import { updateTicketStatusController } from "../controller/tickets/statusControllerTicket";

const ticketRoutes = express.Router();

// Rota para gerar um ticket com a letra sendo um parâmetro de rota
ticketRoutes.post("/generate/:letra", generateTicketController);
ticketRoutes.put("/status/:id_ticket", updateTicketStatusController);
ticketRoutes.get("/all", ListAllTicketControllers);
export default ticketRoutes;
