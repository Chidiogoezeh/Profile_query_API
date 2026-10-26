import type { Response } from "express";

type ResponseExtra = Record<string, unknown>;

export const successResponse = (
  res: Response,
  data: unknown,
  statusCode: number = 200,
  extra: ResponseExtra = {},
) => {
  return res.status(statusCode).json({
    status: "success",
    ...extra,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
