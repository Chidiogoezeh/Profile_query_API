export interface GenderizeResponse {
  name: string;
  gender: "male" | "female" | null;
  probability: number | null;
  count: number;
}

export interface AgifyResponse {
  name: string;
  age: number | null;
  count: number;
}

export interface NationalizeCountry {
  country_id: string;
  probability: number;
}

export interface NationalizeResponse {
  name: string;
  country: NationalizeCountry[];
}
