import { ParsedQs } from "qs";
import { unprocessable } from "./errors.js";

export type SortColumn = "age" | "created_at" | "gender_probability";
export type SortOrder = "asc" | "desc";

export interface Sorting {
  column: SortColumn;
  order: SortOrder;
}

const ALLOWED_COLUMNS = ["age", "created_at", "gender_probability"] as const;
const ALLOWED_ORDERS = ["asc", "desc"] as const;

const DEFAULT_COLUMN: SortColumn = "created_at";
const DEFAULT_ORDER: SortOrder = "desc";

function isSortColumn(v: string): v is SortColumn {
  return (ALLOWED_COLUMNS as readonly string[]).includes(v);
}

function isSortOrder(v: string): v is SortOrder {
  return (ALLOWED_ORDERS as readonly string[]).includes(v);
}

export function parseSorting(query: ParsedQs): Sorting {
  const rawColumn = query.sort_by;
  const rawOrder = query.order;

  let column: SortColumn = DEFAULT_COLUMN;
  if (rawColumn !== undefined) {
    if (typeof rawColumn !== "string" || !isSortColumn(rawColumn)) {
      throw unprocessable("Invalid query parameters");
    }
    column = rawColumn;
  }

  let order: SortOrder = DEFAULT_ORDER;
  if (rawOrder !== undefined) {
    if (typeof rawOrder !== "string") {
      throw unprocessable("Invalid query parameters");
    }
    const lowered = rawOrder.toLowerCase();
    if (!isSortOrder(lowered)) {
      throw unprocessable("Invalid query parameters");
    }
    order = lowered;
  }

  return { column, order };
}
