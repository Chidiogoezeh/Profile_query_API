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

  const { gender, probability, count } = res.data;

  if (gender == null || count === 0) {
    return {
      gender: null,
      gender_probability: null,
      sample_size: count,
    };
  }

  return {
    gender,
    gender_probability: probability,
    sample_size: count,
  };
};

export const fetchAgeData = async (name: string) => {
  const res = await axios.get<AgifyResponse>(
    `https://api.agify.io?name=${encodeURIComponent(name)}`,
  );

  const age = res.data.age;

  if (age === null) {
    return {
      age: null,
      age_group: null,
    };
  }

  let age_group: "child" | "teenager" | "adult" | "senior";

  if (age <= 12) age_group = "child";
  else if (age <= 19) age_group = "teenager";
  else if (age <= 59) age_group = "adult";
  else age_group = "senior";

  return { age, age_group };
};

export const fetchNationalData = async (name: string) => {
  try {
    const res = await axios.get<NationalizeResponse>(
      `https://api.nationalize.io?name=${encodeURIComponent(name)}`,
    );

    if (!res.data.country || res.data.country.length === 0) {
      return {
        country_id: null,
        country_probability: null,
      };
    }

    const topCountry = res.data.country.reduce(
      (prev, curr) =>
        prev.probability > curr.probability ? prev : curr,
    );

    return {
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      console.warn("Nationalize.io rate limit reached; skipping nationality prediction.");

      return {
        country_id: null,
        country_probability: null,
      };
    }

    throw error;
  }
};
