import * as externalService from "./external.service.js";
import * as profileModel from "../models/profile.model.js";
import { generateUUID } from "../utils/uuid.util.js";

import type {
  Profile,
  ProfileFilters,
} from "../types/profile.types.js";
import type { PaginationParams } from "../types/api.types.js";

interface CreateProfileResult {
  data: Profile;
  isNew: boolean;
}

type SearchFilters = ProfileFilters & PaginationParams;

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria",
  KE: "Kenya",
  AO: "Angola",
  BJ: "Benin",
};

export const createProfile = async (
  name: string,
): Promise<CreateProfileResult> => {
  const existing = await profileModel.findByName(name);

  if (existing) {
    return { data: existing, isNew: false };
  }

  const [gender, age, nationality] = await Promise.all([
    externalService.fetchGenderData(name),
    externalService.fetchAgeData(name),
    externalService.fetchNationalData(name),
  ]);

  const data: Profile = {
    id: generateUUID(),
    name: name.toLowerCase(),
    ...gender,
    ...age,
    ...nationality,
    country_name: nationality.country_id
      ? COUNTRY_NAMES[nationality.country_id] ?? nationality.country_id
      : null,
    created_at: new Date().toISOString(),
  };

  await profileModel.save(data);

  return { data, isNew: true };
};

export const getProfileById = (
  id: string,
): Promise<Profile | null> => profileModel.findById(id);

export const listProfiles = (
  filters: ProfileFilters & PaginationParams,
) => profileModel.findAll(filters);

export const searchProfiles = async (
  query: string,
  pagination: PaginationParams,
) => {
  const q = query.toLowerCase();
  const filters: SearchFilters = { ...pagination };
  let interpreted = false;

  if (q.includes("female")) {
    filters.gender = "female";
    interpreted = true;
  } else if (/\bmale\b/.test(q)) {
    filters.gender = "male";
    interpreted = true;
  }

  for (const group of ["child", "teenager", "adult", "senior"] as const) {
    if (q.includes(group)) {
      filters.age_group = group;
      interpreted = true;
    }
  }

  if (q.includes("young")) {
    filters.min_age = 16;
    filters.max_age = 24;
    interpreted = true;
  }

  const above = q.match(/\babove\s+(\d+)\b/);
  if (above) {
    filters.min_age = Number(above[1]);
    interpreted = true;
  }

  const below = q.match(/\bbelow\s+(\d+)\b/);
  if (below) {
    filters.max_age = Number(below[1]);
    interpreted = true;
  }

  const countries: Record<string, string> = {
    nigeria: "NG",
    kenya: "KE",
    angola: "AO",
    benin: "BJ",
  };

  for (const [country, id] of Object.entries(countries)) {
    if (q.includes(country)) {
      filters.country_id = id;
      interpreted = true;
    }
  }

  if (!interpreted) {
    const error = Object.assign(
      new Error("Unable to interpret query"),
      { status: 400 },
    );
    throw error;
  }

  return profileModel.findAll(filters);
};

export const removeProfile = (id: string) =>
  profileModel.deleteById(id);
