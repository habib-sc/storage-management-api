import express from "express";
import auth from "../../middleware/auth.js";
import { DocumentController } from "./document.controller.js";
import upload from "../../middleware/upload.js";

const router = express.Router();

router.post("/folder", auth(), DocumentController.createFolder);
router.post(
  "/upload",
  auth(),
  upload.single("file"),
  DocumentController.uploadFile
);
router.post("/text", auth(), DocumentController.createTextFile);
router.get("/", auth(), DocumentController.getFolderContent);

export const DocumentRoutes = router;
