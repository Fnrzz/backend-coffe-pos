import { Router } from "express";
import { handelMidtransNotification } from "../controllers/midtransController";

const router = Router();

router.post("/notification", handelMidtransNotification);

export default router;
