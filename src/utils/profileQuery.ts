import { sql } from "./db.js";
import { ProfileData, AgeGroup } from "../types/api.js";
import { Pagination } from "./pagination.js";
import { Sorting } from "./sorting.js";

export interface ProfileFilters {
  gender?: string;
  age_group?: AgeGroup;
  country_id?: string;
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
}

export interface ProfileQueryResult {
  rows: ProfileData[];
  total: number;
}

function buildWhere(filters: ProfileFilters) {
  const conditions = [];
  if (filters.gender) conditions.push(sql`gender = ${filters.gender.toLowerCase()}`);
  if (filters.age_group) conditions.push(sql`age_group = ${filters.age_group}`);
  if (filters.country_id) conditions.push(sql`country_id = ${filters.country_id.toUpperCase()}`);
  if (filters.min_age !== undefined) conditions.push(sql`age >= ${filters.min_age}`);
  if (filters.max_age !== undefined) conditions.push(sql`age <= ${filters.max_age}`);
  if (filters.min_gender_probability !== undefined) {
    conditions.push(sql`gender_probability >= ${filters.min_gender_probability}`);
  }
  if (filters.min_country_probability !== undefined) {
    conditions.push(sql`country_probability >= ${filters.min_country_probability}`);
  }

  return conditions.length > 0
    ? sql`WHERE ${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
    : sql``;
}

export async function runProfileQuery(
  filters: ProfileFilters,
  sorting: Sorting,
  pagination: Pagination,
): Promise<ProfileQueryResult> {
  const where = buildWhere(filters);
  const orderDir = sorting.order === "asc" ? sql`ASC` : sql`DESC`;

  const [rows, countRows] = await Promise.all([
    sql<ProfileData[]>`
      SELECT * FROM profiles
      ${where}
      ORDER BY ${sql(sorting.column)} ${orderDir}, id ASC
      LIMIT ${pagination.limit} OFFSET ${pagination.offset}
    `,
    sql<{ count: string }[]>`
      SELECT count(*)::text AS count FROM profiles ${where}
    `,
  ]);

  return { rows, total: Number(countRows[0].count) };
}
