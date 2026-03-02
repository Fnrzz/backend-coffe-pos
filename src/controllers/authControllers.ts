import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import {
  errorInternalServerErrorResponse,
  errorNotFoundResponse,
  errorValidationResponse,
  successSingleResponse,
} from "../utils/response";
import { AuthRequest } from "../middlewares/authMiddleware";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return errorValidationResponse(res, "Username atau password salah!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorValidationResponse(res, "Username atau password salah!");
    }

    const secretKey = process.env.JWT_SECRET_KEY;

    if (!secretKey) {
      return errorInternalServerErrorResponse(res);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secretKey,
      { expiresIn: "24h" },
    );

    return successSingleResponse(res, "", {
      token,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return errorNotFoundResponse(res);
    }

    return successSingleResponse(res, "", user);
  } catch (e) {
    console.error(e);
    return errorInternalServerErrorResponse(res);
  }
};
