import type { ErrorRequestHandler } from "express";
import { errorResponse } from "../utils/response.util.js";

export const globalErrorHandler: ErrorRequestHandler = (
  err, req, res, next ) => { console.error(err);

  const status =
    typeof err?.status === "number" ? err.status : 500;

  const message =
    typeof err?.message === "string"
      ? err.message
      : "Internal Server Error";

  errorResponse(res, message, status);
};
