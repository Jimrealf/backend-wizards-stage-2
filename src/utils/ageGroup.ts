import { AgeGroup } from "../types/api.js";

export function classifyAgeGroup(age: number): AgeGroup {
  if (age <= 12) return "child";
  if (age <= 19) return "teenager";
  if (age <= 59) return "adult";
  return "senior";
}
