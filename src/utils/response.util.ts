export const successResponse = (res, data, statusCode = 200, extra = {}) => {
  return res.status(statusCode).json({
    status: "success",
    ...extra,
    data,
  });
};

export const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
