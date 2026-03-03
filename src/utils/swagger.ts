import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { authDocs } from "../swagger/authSwagger";
import { categoryDocs } from "../swagger/categorySwagger";
import { productDocs } from "../swagger/productSwagger";
import { orderDocs } from "../swagger/orderSwagger";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Coffee POS API Documentation",
      version: "1.0.0",
      description: "Dokumentasi API untuk sistem Point of Sale Kedai Kopi",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      ...authDocs,
      ...categoryDocs,
      ...productDocs,
      ...orderDocs,
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express, port: number) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📚 API Docs tersedia di http://localhost:${port}/docs`);
};
