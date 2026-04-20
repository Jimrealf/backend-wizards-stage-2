import { GenderizeResponse } from "../types/api.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const GENDERIZE_BASE_URL = "https://api.genderize.io";

export async function fetchGenderPrediction(name: string): Promise<GenderizeResponse> {
  const url = `${GENDERIZE_BASE_URL}/?name=${encodeURIComponent(name)}`;
  return fetchWithTimeout<GenderizeResponse>(url, "Genderize");
}
