import { Response } from "express";

/**
 * Response Success
 */
export const successSingleResponse = (
  res: Response,
  message?: string,
  data?: any,
) => {
  if (!data) {
    return res.status(200).json({
      message: message || "Success",
    });
  } else {
    return res.status(200).json({
      data: data || null,
    });
  }
};

/**
 * Response Success Created
 */
export const successCreatedResponse = (res: Response, data?: any) => {
  return res.status(201).json({
    data: data || null,
  });
};

/**
 * Response Multiple Success
 */
export const successMultipleResponse = (
  res: Response,
  items?: any,
  page?: number,
  limit?: number,
  total?: number,
) => {
  return res.status(200).json({
    items: items || null,
    meta: {
      page: page || 1,
      limit: limit || 1,
      total: total || 0,
    },
  });
};

/**
 * Unauthorized Errors
 */
export const errorUnauthorizedResponse = (res: Response): Response => {
  return res.status(401).json({
    error: {
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    },
  });
};

/**
 * Not Found Errors
 */
export const errorNotFoundResponse = (res: Response) => {
  return res.status(404).json({
    error: {
      message: "Resource Not Found",
      code: "NOT_FOUND",
    },
  });
};

/**
 * Internal Server Errors
 */
export const errorInternalServerErrorResponse = (res: Response) => {
  return res.status(500).json({
    error: {
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
};

/**
 * Validation Errors
 */
export const errorValidationResponse = (
  res: Response,
  message: string,
  fields?: any,
) => {
  return res.status(400).json({
    error: {
      message,
      code: "VALIDATION_ERROR",
      fields: fields,
    },
  });
};
