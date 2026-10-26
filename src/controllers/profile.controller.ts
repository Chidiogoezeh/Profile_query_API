import type { RequestHandler } from "express";
import * as profileService from "../services/profile.service.js";
import { successResponse, errorResponse, } from "../utils/response.util.js";

const parsePagination = (query: {
  page?: unknown;
  limit?: unknown;
}) => {
  const parsedPage = Number(query.page ?? 1);
  const parsedLimit = Number(query.limit ?? 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 10;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const getStringParam = (value: string | string[] | undefined): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;

export const postProfile: RequestHandler = async (req, res, next) => {
  try {
    const name: unknown = req.body?.name;

    if (typeof name !== "string" || !name.trim()) {
      return errorResponse(res, "Name is required", 400);
    }

    const { data, isNew } = await profileService.createProfile(name.trim());

    return successResponse(res, data, isNew ? 201 : 200, {
      ...(!isNew && { message: "Profile already exists" }),
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const id = getStringParam(req.params.id);

    if (!id) {
      return errorResponse(res, "Invalid profile ID", 400);
    }

    const profile = await profileService.getProfileById(id);

    return profile
      ? successResponse(res, profile)
      : errorResponse(res, "Profile not found", 404);
  } catch (error) {
    next(error);
  }
};

export const getProfiles: RequestHandler = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    const { data, total } = await profileService.listProfiles({
      ...req.query,
      ...pagination,
    });

    return res.status(200).json({
      status: "success",
      ...pagination,
      total,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProfiles: RequestHandler = async (req, res, next) => {
  try {
    const q = req.query.q;

    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty parameter",
      });
    }

    const pagination = parsePagination(req.query);
    const { data, total } = await profileService.searchProfiles(
      q,
      pagination,
    );

    return res.status(200).json({
      status: "success",
      ...pagination,
      total,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile: RequestHandler = async (req, res, next) => {
  try {
    const id = getStringParam(req.params.id);

    if (!id) {
      return errorResponse(res, "Invalid profile ID", 400);
    }

    const deleted = await profileService.removeProfile(id);

    if (!deleted) {
      return errorResponse(res, "Profile not found", 404);
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
