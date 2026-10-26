import pool from "../config/database.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import type { Profile, ProfileFilters, ProfileSort, } from "../types/profile.types.js";

interface ProfileRow extends Profile, RowDataPacket {}

interface CountRow extends RowDataPacket {
  total: number;
}

type SaveProfile = Omit<Profile, "created_at">;

type FindAllFilters = ProfileFilters &
  Partial<ProfileSort> & {
    page?: number | string;
    limit?: number | string;
  };

export const findByName = async (
  name: string,
): Promise<ProfileRow | undefined> => {
  const [rows] = await pool.execute<ProfileRow[]>(
    "SELECT * FROM profiles WHERE name = ?",
    [name.toLowerCase()],
  );

  return rows[0];
};

export const findById = async (
  id: string,
): Promise<ProfileRow | undefined> => {
  const [rows] = await pool.execute<ProfileRow[]>(
    "SELECT * FROM profiles WHERE id = ?",
    [id],
  );

  return rows[0];
};

export const save = async (
  p: SaveProfile,
) => {
  const sql = `
    INSERT INTO profiles (
      id, name, gender, gender_probability,
      age, age_group, country_id, country_name,
      country_probability, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  return pool.execute<ResultSetHeader>(sql, [
    p.id,
    p.name,
    p.gender,
    p.gender_probability,
    p.age,
    p.age_group,
    p.country_id,
    p.country_name,
    p.country_probability,
  ]);
};

export const findAll = async (filters: FindAllFilters) => {
  const {
    gender,
    age_group,
    country_id,
    min_age,
    max_age,
    min_gender_probability,
    min_country_probability,
    sort_by = "created_at",
    order = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const pLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const pPage = Math.max(Number(page) || 1, 1);
  const pOffset = (pPage - 1) * pLimit;

  const params: (string | number)[] = [];
  const clauses: string[] = [];

  if (gender) {
    clauses.push("gender = ?");
    params.push(gender);
  }

  if (age_group) {
    clauses.push("age_group = ?");
    params.push(age_group);
  }

  if (country_id) {
    clauses.push("country_id = ?");
    params.push(country_id);
  }

  if (min_age !== undefined) {
    clauses.push("age >= ?");
    params.push(min_age);
  }

  if (max_age !== undefined) {
    clauses.push("age <= ?");
    params.push(max_age);
  }

  if (min_gender_probability !== undefined) {
    clauses.push("gender_probability >= ?");
    params.push(min_gender_probability);
  }

  if (min_country_probability !== undefined) {
    clauses.push("country_probability >= ?");
    params.push(min_country_probability);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";

  const [countRows] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM profiles${where}`,
    params,
  );

  const allowedSort = [
    "age",
    "created_at",
    "gender_probability",
  ] as const;

  const sort = allowedSort.includes(
    sort_by as (typeof allowedSort)[number],
  )
    ? sort_by
    : "created_at";

  const direction = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  const [rows] = await pool.query<ProfileRow[]>(
    `SELECT * FROM profiles${where} ORDER BY ${sort} ${direction} LIMIT ? OFFSET ?`,
    [...params, pLimit, pOffset],
  );

  return {
    data: rows,
    total: countRows[0].total,
  };
};

export const deleteById = async (id: string): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM profiles WHERE id = ?",
    [id],
  );

  return result.affectedRows > 0;
};