import axios from "axios";

const createExternalError = (apiName) => {
  const error = new Error(`${apiName} returned an invalid response`);
  error.status = 502;
  return error;
};

export const fetchGenderData = async (name) => {
  const res = await axios.get(`https://api.genderize.io?name=${name}`);
  if (!res.data.gender || res.data.count === 0)
    throw createExternalError("Genderize");
  return {
    gender: res.data.gender,
    gender_probability: res.data.probability,
    sample_size: res.data.count,
  };
};

export const fetchAgeData = async (name) => {
  const res = await axios.get(`https://api.agify.io?name=${name}`);
  if (res.data.age === null) throw createExternalError("Agify");

  let age_group;
  const age = res.data.age;
  if (age <= 12) age_group = "child";
  else if (age <= 19) age_group = "teenager";
  else if (age <= 59) age_group = "adult";
  else age_group = "senior";

  return { age: res.data.age, age_group };
};

export const fetchNationalData = async (name) => {
  const res = await axios.get(`https://api.nationalize.io?name=${name}`);
  if (!res.data.country || res.data.country.length === 0)
    throw createExternalError("Nationalize");

  const topCountry = res.data.country.reduce((prev, curr) =>
    prev.probability > curr.probability ? prev : curr,
  );

  return {
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
  };
};
