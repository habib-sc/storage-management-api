import express from "express";
import { AuthController } from "./auth.controller.js";

const router = express.Router();

router.post("/signup", AuthController.signup);

export const AuthRoutes = router;
