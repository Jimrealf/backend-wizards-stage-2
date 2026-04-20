import { ParsedQs } from "qs";
import { unprocessable } from "./errors.js";

export type SortColumn = "age" | "created_at" | "gender_probability";
export type SortOrder = "asc" | "desc";

export interface Sorting {
  column: SortColumn;
  order: SortOrder;
}

const ALLOWED_COLUMNS: readonly SortColumn[] = ["age", "created_at", "gender_probability"];
const ALLOWED_ORDERS: readonly SortOrder[] = ["asc", "desc"];

const DEFAULT_COLUMN: SortColumn = "created_at";
const DEFAULT_ORDER: SortOrder = "desc";

export function parseSorting(query: ParsedQs): Sorting {
  const rawColumn = query.sort_by;
  const rawOrder = query.order;

  let column: SortColumn = DEFAULT_COLUMN;
  if (rawColumn !== undefined) {
    if (typeof rawColumn !== "string" || !ALLOWED_COLUMNS.includes(rawColumn as SortColumn)) {
      throw unprocessable("Invalid query parameters");
    }
    column = rawColumn as SortColumn;
  }

  let order: SortOrder = DEFAULT_ORDER;
  if (rawOrder !== undefined) {
    if (typeof rawOrder !== "string" || !ALLOWED_ORDERS.includes(rawOrder.toLowerCase() as SortOrder)) {
      throw unprocessable("Invalid query parameters");
    }
    order = rawOrder.toLowerCase() as SortOrder;
  }

  return { column, order };
}
