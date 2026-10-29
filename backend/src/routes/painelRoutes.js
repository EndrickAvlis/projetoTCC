import { Router } from "express";
import * as painelController from "../controllers/painelController.js"

const painelRouter = Router();

painelRouter.get("/stream", painelController.streamChamadas);

export default painelRouter;
