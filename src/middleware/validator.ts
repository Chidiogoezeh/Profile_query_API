import type { RequestHandler } from "express";
import { errorResponse } from "../utils/response.util.js";

export const validateProfileInput: RequestHandler = (
  req, res, next ) => { const { name } = req.body;

  if (typeof name !== "string") {
    return errorResponse(res, "Invalid parameter type", 422);
  }

  if (name.trim() === "") {
    return errorResponse(res, "Missing or empty parameter", 400);
  }

  next();
};

export const validateQueryParams: RequestHandler = (
  req, res, next ) => {
  const {
    min_age,
    max_age,
    page,
    limit,
    min_gender_probability,
    min_country_probability,
  } = req.query;

  const numericFields = {
    min_age,
    max_age,
    page,
    limit,
    min_gender_probability,
    min_country_probability,
  };

  for (const val of Object.values(numericFields)) {
    if (
      val !== undefined &&
      (
        typeof val !== "string" ||
        val.trim() === "" ||
        !Number.isFinite(Number(val))
      )
    ) {
      return res.status(422).json({
        status: "error",
        message: "Invalid query parameters",
      });
    }
  }

  if (
    limit !== undefined &&
    (Number(limit) > 50 || Number(limit) < 1)
  ) {
    return res.status(422).json({
      status: "error",
      message: "Invalid query parameters",
    });
  }

  next();
};
