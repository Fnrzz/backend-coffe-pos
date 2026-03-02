import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post("/", verifyToken, upload.single("image"), createProduct);
router.delete("/:slug", verifyToken, deleteProduct);
router.put("/:slug", verifyToken, upload.single("image"), updateProduct);

export default router;
