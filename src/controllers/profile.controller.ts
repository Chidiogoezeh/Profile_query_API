import * as profileService from "../services/profile.service.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

const parsePagination = ({ page = 1, limit = 10 }) => ({
  page: parseInt(page),
  limit: Math.min(parseInt(limit), 50),
});

export const postProfile = async (req, res, next) => {
  try {
    const { data, isNew } = await profileService.createProfile(req.body.name);

    return successResponse(res, data, isNew ? 201 : 200, {
      ...(!isNew && { message: "Profile already exists" }),
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfileById(req.params.id);
    return profile
      ? successResponse(res, profile)
      : errorResponse(res, "Profile not found", 404);
  } catch (error) {
    next(error);
  }
};

export const getProfiles = async (req, res, next) => {
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

export const searchProfiles = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty parameter",
      });
    }

    const pagination = parsePagination(req.query);
    const { data, total } = await profileService.searchProfiles(q, pagination);

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

export const deleteProfile = async (req, res, next) => {
  try {
    const deleted = await profileService.removeProfile(req.params.id);
    if (!deleted) return errorResponse(res, "Profile not found", 404);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
