import { NationalizeResponse } from "../types/api.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const NATIONALIZE_BASE_URL = "https://api.nationalize.io";

export async function fetchNationalityPrediction(name: string): Promise<NationalizeResponse> {
  const url = `${NATIONALIZE_BASE_URL}/?name=${encodeURIComponent(name)}`;
  return fetchWithTimeout<NationalizeResponse>(url, "Nationalize");
}
