import { ParsedQs } from "qs";
import { unprocessable } from "./errors.js";

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parsePositiveInt(raw: unknown, fallback: number): number {
  if (raw === undefined) return fallback;
  if (typeof raw !== "string") {
    throw unprocessable("Invalid query parameters");
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    throw unprocessable("Invalid query parameters");
  }
  return n;
}

export function parsePagination(query: ParsedQs): Pagination {
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const rawLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
