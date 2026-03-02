import midtransClient from "midtrans-client";
import { prisma } from "../lib/prisma";
import {
  errorInternalServerErrorResponse,
  successSingleResponse,
} from "../utils/response";

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export const handelMidtransNotification = async (req: any, res: any) => {
  try {
    const notificationJson = req.body;

    const statusResponse = await (coreApi as any).transaction.notification(
      notificationJson,
    );

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return successSingleResponse(res, "Order tidak ditemukan!");
    }

    let newStatus = existingOrder.status;

    if (transactionStatus == "capture" || transactionStatus == "settlement") {
      if (fraudStatus == "accept" || !fraudStatus) {
        newStatus = "paid";
      } else if (fraudStatus == "challenge") {
        newStatus = "pending";
      }
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newStatus = "cancelled";
    }

    if (newStatus !== existingOrder.status) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    }

    return successSingleResponse(res);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};
