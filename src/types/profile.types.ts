export type Gender = "male" | "female";

export type AgeGroup = "child" | "teenager" | "adult" | "senior";

export interface Profile {
  id: string;
  name: string;
  gender: Gender | null;
  gender_probability: number | null;
  age: number | null;
  age_group: AgeGroup | null;
  country_id: string | null;
  country_name: string | null;
  country_probability: number | null;
  created_at: Date | string;
}

export interface ProfileFilters {
  gender?: Gender;
  age_group?: AgeGroup;
  country_id?: string;
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
}

export type SortBy = "age" | "created_at" | "gender_probability";

export type SortOrder = "asc" | "desc";

export interface ProfileSort {
  sort_by: SortBy;
  order: SortOrder;
}
