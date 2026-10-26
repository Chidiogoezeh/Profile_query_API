import axios from "axios";
import type {
  GenderizeResponse,
  AgifyResponse,
  NationalizeResponse,
  NationalizeCountry,
} from "../types/external_api.types.js";
import type { ApiError } from "../types/api.types.js";

const createExternalError = (apiName: string): ApiError => {
  const error = new Error(
    `${apiName} returned an invalid response`,
  ) as ApiError;

  error.status = 502;
  return error;
};

export const fetchGenderData = async (name: string) => {
  const res = await axios.get<GenderizeResponse>(
    `https://api.genderize.io?name=${encodeURIComponent(name)}`,
  );

  if (!res.data.gender || res.data.count === 0) {
    throw createExternalError("Genderize");
  }

  return {
    gender: res.data.gender,
    gender_probability: res.data.probability,
    sample_size: res.data.count,
  };
};

export const fetchAgeData = async (name: string) => {
  const res = await axios.get<AgifyResponse>(
    `https://api.agify.io?name=${encodeURIComponent(name)}`,
  );

  if (res.data.age === null) {
    throw createExternalError("Agify");
  }

  const age = res.data.age;
  let age_group: "child" | "teenager" | "adult" | "senior";

  if (age <= 12) age_group = "child";
  else if (age <= 19) age_group = "teenager";
  else if (age <= 59) age_group = "adult";
  else age_group = "senior";

  return { age, age_group };
};

export const fetchNationalData = async (name: string) => {
  const res = await axios.get<NationalizeResponse>(
    `https://api.nationalize.io?name=${encodeURIComponent(name)}`,
  );

  if (!res.data.country || res.data.country.length === 0) {
    throw createExternalError("Nationalize");
  }

  const topCountry = res.data.country.reduce(
    (prev: NationalizeCountry, curr: NationalizeCountry) =>
      prev.probability > curr.probability ? prev : curr,
  );

  return {
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
  };
};
