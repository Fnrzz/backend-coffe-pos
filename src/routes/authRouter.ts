import { Router } from "express";
import { getProfile, login } from "../controllers/authControllers";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", login);
router.get("/me", verifyToken, getProfile);

export default router;
