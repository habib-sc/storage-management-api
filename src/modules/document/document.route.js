import express from "express";
import auth from "../../middleware/auth.js";
import { DocumentController } from "./document.controller.js";

const router = express.Router();

router.post("/folder", auth(), DocumentController.createFolder);

export const DocumentRoutes = router;
