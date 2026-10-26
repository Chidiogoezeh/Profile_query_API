import { Router } from "express";
import * as controller from "../controllers/profile.controller.js";
import { validateProfileInput, validateQueryParams } from "../middleware/validator.js";

const router = Router();

router.post("/", validateProfileInput, controller.postProfile);
router.get("/", validateQueryParams, controller.getProfiles);
router.get("/search", validateQueryParams, controller.searchProfiles);
router.get("/:id", controller.getProfile);
router.delete("/:id", controller.deleteProfile);

export default router;