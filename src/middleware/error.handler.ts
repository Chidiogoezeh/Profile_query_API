import { errorResponse } from "../utils/response.util.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  errorResponse(res, message, status);
};
