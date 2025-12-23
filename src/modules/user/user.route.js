import express from "express";
import { UserController } from "./user.controller.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/me", auth(), UserController.getMe);
router.get("/", auth("admin"), UserController.getAllUsers);

export const UserRoutes = router;
