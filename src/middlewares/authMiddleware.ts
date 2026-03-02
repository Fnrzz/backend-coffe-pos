import {
  errorInternalServerErrorResponse,
  errorUnauthorizedResponse,
} from "../utils/response";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorUnauthorizedResponse(res);
  }

  const token = authHeader.split(" ")[1];

  try {
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      return errorInternalServerErrorResponse(res);
    }

    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;

    next();
  } catch (e) {
    return errorInternalServerErrorResponse(res);
  }
};
