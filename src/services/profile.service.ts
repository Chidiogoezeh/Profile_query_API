import * as externalService from "./external.service.js";
import * as profileModel from "../models/profile.model.js";
import { generateUUID } from "../utils/uuid.util.js";

export const createProfile = async (name) => {
  const existing = await profileModel.findByName(name);
  if (existing) return { data: existing, isNew: false };

  const [gender, age, nationality] = await Promise.all([
    externalService.fetchGenderData(name),
    externalService.fetchAgeData(name),
    externalService.fetchNationalData(name),
  ]);

  const data = {
    id: generateUUID(),
    name: name.toLowerCase(),
    ...gender,
    ...age,
    ...nationality,
    created_at: new Date().toISOString(),
  };

  await profileModel.save(data);
  return { data, isNew: true };
};

export const getProfileById = (id) => profileModel.findById(id);

export const listProfiles = (filters) => profileModel.findAll(filters);

export const searchProfiles = async (query, pagination) => {
  const q = query.toLowerCase();
  const filters = { ...pagination };
  let interpreted = false;

  const setFilter = (key, value) => {
    filters[key] = value;
    interpreted = true;
  };

  if (q.includes("female")) setFilter("gender", "female");
  else if (q.includes("male")) setFilter("gender", "male");

  for (const group of ["child", "teenager", "adult", "senior"]) {
    if (q.includes(group)) setFilter("age_group", group);
  }

  if (q.includes("young")) {
    setFilter("min_age", 16);
    setFilter("max_age", 24);
  }

  const above = q.match(/above (\d+)/);
  if (above) setFilter("min_age", parseInt(above[1], 10));

  const below = q.match(/below (\d+)/);
  if (below) setFilter("max_age", parseInt(below[1], 10));

  const countries = {
    nigeria: "NG",
    kenya: "KE",
    angola: "AO",
    benin: "BJ",
  };

  for (const [country, id] of Object.entries(countries)) {
    if (q.includes(country)) setFilter("country_id", id);
  }

  if (!interpreted) {
    const error = new Error("Unable to interpret query");
    error.status = 400;
    throw error;
  }

  return profileModel.findAll(filters);
};

export const removeProfile = (id) => profileModel.deleteById(id);
