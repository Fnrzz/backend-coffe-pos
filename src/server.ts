import express from "express";
import cors from "cors";
import path from "path";
import authRouter from "./routes/authRouter";
import categoryRouter from "./routes/categoryRouter";
import productRouter from "./routes/productRouter";
import orderRouter from "./routes/orderRouter";
import midtransRouter from "./routes/midtransRouter";
import { swaggerDocs } from "./utils/swagger";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

const router = express.Router();

router.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

app.use("/api", router);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads")),
);

router.use("/auth", authRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/orders", orderRouter);
router.use("/midtrans", midtransRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  swaggerDocs(app, port);
});
