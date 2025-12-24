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
router.get("/stats", auth(), DocumentController.getDashboardStats);
router.get("/", auth(), DocumentController.getFolderContent);
router.get("/favourites", auth(), DocumentController.getFavouriteDocuments);
router.patch(
  "/favourite-toggle/:id",
  auth(),
  DocumentController.toggleFavourite
);
router.post("/duplicate/:id", auth(), DocumentController.duplicateDocument);
router.post("/copy-to-folder/:id", auth(), DocumentController.copyToFolder);
router.patch("/rename/:id", auth(), DocumentController.renameDocument);
router.delete("/:id", auth(), DocumentController.deleteDocument);
router.get("/view/:id", auth(), DocumentController.viewDocument);

export const DocumentRoutes = router;
