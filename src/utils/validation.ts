import { badRequest, unprocessable } from "./errors.js";
import { AgeGroup } from "../types/api.js";

export function validateName(raw: unknown): string {
  if (raw === undefined || raw === null) {
    throw badRequest("Missing required parameter: name");
  }

  if (typeof raw !== "string") {
    throw badRequest("Parameter 'name' must be a string");
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw badRequest("Missing required parameter: name");
  }

  return trimmed;
}

const INVALID = "Invalid query parameters";

export function parseIntBound(raw: unknown): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") throw unprocessable(INVALID);
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) throw unprocessable(INVALID);
  return n;
}

export function parseFloatBound(raw: unknown): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") throw unprocessable(INVALID);
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1) throw unprocessable(INVALID);
  return n;
}

const AGE_GROUPS: readonly AgeGroup[] = ["child", "teenager", "adult", "senior"];

export function parseAgeGroup(raw: unknown): AgeGroup | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") throw unprocessable(INVALID);
  const lower = raw.toLowerCase();
  if (!AGE_GROUPS.includes(lower as AgeGroup)) throw unprocessable(INVALID);
  return lower as AgeGroup;
}

export function parseStringFilter(raw: unknown): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") throw unprocessable(INVALID);
  const trimmed = raw.trim();
  if (trimmed.length === 0) throw unprocessable(INVALID);
  return trimmed;
}
