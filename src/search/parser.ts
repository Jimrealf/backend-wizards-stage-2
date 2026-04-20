import { codeForName } from "./countries.js";
import { ProfileFilters } from "../utils/profileQuery.js";

const MALE_TERMS = ["male", "males", "man", "men", "boy", "boys"];
const FEMALE_TERMS = ["female", "females", "woman", "women", "girl", "girls", "lady", "ladies"];

const CHILD_TERMS = ["child", "children", "kid", "kids"];
const TEENAGER_TERMS = ["teen", "teens", "teenager", "teenagers"];
const ADULT_TERMS = ["adult", "adults"];
const SENIOR_TERMS = ["senior", "seniors", "elderly", "pensioner", "pensioners"];

const YOUNG_MIN = 16;
const YOUNG_MAX = 24;

const AGE_STOP = "above|over|older|greater|below|under|younger|less|between";
const COUNTRY_REGEX = new RegExp(
  `\\b(?:from|in)\\s+([a-z][a-z\\s]*?)(?=\\s+(?:${AGE_STOP})\\b|\\s*$)`,
);
const BETWEEN_REGEX = /\bbetween\s+(\d+)\s+and\s+(\d+)\b/;
const ABOVE_REGEX = /\b(?:above|over|older than|greater than)\s+(\d+)\b/;
const BELOW_REGEX = /\b(?:below|under|younger than|less than)\s+(\d+)\b/;

function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function raiseMin(current: number | undefined, n: number): number {
  return current !== undefined ? Math.max(current, n) : n;
}

function lowerMax(current: number | undefined, n: number): number {
  return current !== undefined ? Math.min(current, n) : n;
}

export function parseQuery(raw: string): ProfileFilters {
  const normalized = normalize(raw);
  if (normalized.length === 0) return {};

  const words = new Set(normalized.split(" "));
  const filters: ProfileFilters = {};

  const hasMale = MALE_TERMS.some((t) => words.has(t));
  const hasFemale = FEMALE_TERMS.some((t) => words.has(t));
  if (hasMale && !hasFemale) filters.gender = "male";
  else if (hasFemale && !hasMale) filters.gender = "female";

  if (CHILD_TERMS.some((t) => words.has(t))) filters.age_group = "child";
  else if (TEENAGER_TERMS.some((t) => words.has(t))) filters.age_group = "teenager";
  else if (ADULT_TERMS.some((t) => words.has(t))) filters.age_group = "adult";
  else if (SENIOR_TERMS.some((t) => words.has(t))) filters.age_group = "senior";

  if (words.has("young")) {
    filters.min_age = YOUNG_MIN;
    filters.max_age = YOUNG_MAX;
  }

  const between = normalized.match(BETWEEN_REGEX);
  if (between) {
    const a = Number(between[1]);
    const b = Number(between[2]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    filters.min_age = raiseMin(filters.min_age, lo);
    filters.max_age = lowerMax(filters.max_age, hi);
  }

  const above = normalized.match(ABOVE_REGEX);
  if (above) filters.min_age = raiseMin(filters.min_age, Number(above[1]));

  const below = normalized.match(BELOW_REGEX);
  if (below) filters.max_age = lowerMax(filters.max_age, Number(below[1]));

  const countryMatch = normalized.match(COUNTRY_REGEX);
  if (countryMatch) {
    const code = codeForName(countryMatch[1]);
    if (code) filters.country_id = code;
  }

  return filters;
}
