import { Request, Response } from "express";
import {
  errorInternalServerErrorResponse,
  errorNotFoundResponse,
  errorValidationResponse,
  successCreatedResponse,
  successMultipleResponse,
  successSingleResponse,
} from "../utils/response";
import { prisma } from "../lib/prisma";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, items } = req.body;

    const requiredFields = ["customerName", "items"];

    const errors: Record<string, string[]> = {};

    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors[field] = [`required`];
      }
    }

    if (Object.keys(errors).length > 0) {
      return errorValidationResponse(res, "Validation Error!", errors);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return errorValidationResponse(res, "Data pesanan tidak boleh kosong!");
    }

    let totalAmount = 0;
    const orderItemsData: any[] = [];
    const itemDetailsMidtrans: any[] = [];

    for (const item of items) {
      const { productSlug, quantity } = item;

      if (!productSlug || !quantity || quantity <= 0) {
        return errorValidationResponse(
          res,
          "Data produk atau kuantitas tidak valid!",
        );
      }

      const product = await prisma.product.findUnique({
        where: { slug: String(productSlug) },
        select: {
          id: true,
          name: true,
          isAvailable: true,
          price: true,
        },
      });

      if (!product) {
        return errorNotFoundResponse(res);
      }

      if (!product.isAvailable) {
        return errorValidationResponse(res, "Produk tidak tersedia!");
      }

      const itemPrice = product.price;
      totalAmount += itemPrice * quantity;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price: itemPrice,
      });

      itemDetailsMidtrans.push({
        id: product.id.toString(),
        price: itemPrice,
        quantity: quantity,
        name: product.name.substring(0, 50),
      });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        customerName: customerName,
        totalAmount: totalAmount,
        status: "pending",
        orderItems: {
          createMany: {
            data: orderItemsData,
          },
        },
      },
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
      },
    });

    const parameter = {
      transaction_details: {
        order_id: newOrder.id,
        gross_amount: newOrder.totalAmount,
      },
      customer_details: {
        first_name: newOrder.customerName,
      },
      item_details: itemDetailsMidtrans,
    };

    const transaction = await snap.createTransaction(parameter);

    return successCreatedResponse(res, {
      order: newOrder,
      payment: {
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
    });
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filterStatus = req.query.status as string;

    const whereClause = filterStatus ? { status: filterStatus } : {};
    const total = await prisma.order.count({ where: whereClause });

    const orders = await prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
      },
    });

    return successMultipleResponse(res, orders, page, limit, total);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return errorNotFoundResponse(res);
    }

    return successSingleResponse(res, "", order);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "paid", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return errorValidationResponse(
        res,
        `Status tidak valid! Pilihan: ${validStatuses.join(", ")}`,
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: String(id) },
    });

    if (!order) {
      return errorNotFoundResponse(res);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(id) },
      data: {
        status: status,
      },
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
      },
    });

    return successSingleResponse(res, "", updatedOrder);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: String(id) },
    });

    if (!order) {
      return errorNotFoundResponse(res);
    }

    if (order.status === "paid" || order.status === "completed") {
      return errorValidationResponse(
        res,
        "Pesanan yang sudah dibayar tidak bisa dibatalkan!",
      );
    }

    await prisma.order.delete({
      where: { id: String(id) },
    });

    return successSingleResponse(res, "Pesanan Berhasil Dihapus!");
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};
