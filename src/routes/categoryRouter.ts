import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryControllers";

const router = Router();

router.get("/", getCategories);
router.post("/", verifyToken, createCategory);
router.delete("/:slug", verifyToken, deleteCategory);
router.put("/:slug", verifyToken, updateCategory);

export default router;
