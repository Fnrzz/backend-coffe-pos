import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderControllers";

const router = Router();

router.get("/", verifyToken, getOrders);
router.get("/:id", getOrderById);
router.post("/", verifyToken, createOrder);
router.delete("/:id", verifyToken, deleteOrder);
router.put("/:id/status", verifyToken, updateOrderStatus);

export default router;
