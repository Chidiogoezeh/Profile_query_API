import pool from "../config/database.js";

export const findByName = async (name) => {
  const [rows] = await pool.execute("SELECT * FROM profiles WHERE name = ?", [
    name.toLowerCase(),
  ]);
  return rows[0];
};

export const findById = async (id) => {
  const [rows] = await pool.execute("SELECT * FROM profiles WHERE id = ?", [
    id,
  ]);
  return rows[0];
};

export const save = async (p) => {
  const sql = `
    INSERT INTO profiles (
      id, name, gender, gender_probability, sample_size,
      age, age_group, country_id, country_probability, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  return pool.execute(sql, [
    p.id,
    p.name,
    p.gender,
    p.gender_probability,
    p.sample_size,
    p.age,
    p.age_group,
    p.country_id,
    p.country_probability,
  ]);
};

export const findAll = async (filters) => {
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

  const pLimit = parseInt(limit);
  const pOffset = (parseInt(page) - 1) * pLimit;
  const params = [];
  const clauses = [];

  if (gender) (clauses.push("gender = ?"), params.push(gender));
  if (age_group) (clauses.push("age_group = ?"), params.push(age_group));
  if (country_id) (clauses.push("country_id = ?"), params.push(country_id));
  if (min_age) (clauses.push("age >= ?"), params.push(Number(min_age)));
  if (max_age) (clauses.push("age <= ?"), params.push(Number(max_age)));
  if (min_gender_probability)
    (clauses.push("gender_probability >= ?"),
      params.push(Number(min_gender_probability)));
  if (min_country_probability)
    (clauses.push("country_probability >= ?"),
      params.push(Number(min_country_probability)));

  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM profiles${where}`,
    params,
  );

  const allowedSort = ["age", "created_at", "gender_probability"];
  const sort = allowedSort.includes(sort_by) ? sort_by : "created_at";
  const dir = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  const [rows] = await pool.query(
    `SELECT * FROM profiles${where} ORDER BY ${sort} ${dir} LIMIT ? OFFSET ?`,
    [...params, pLimit, pOffset],
  );

  return { data: rows, total: countRows[0].total };
};
