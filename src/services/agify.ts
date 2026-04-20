import { AgifyResponse } from "../types/api.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const AGIFY_BASE_URL = "https://api.agify.io";

export async function fetchAgePrediction(name: string): Promise<AgifyResponse> {
  const url = `${AGIFY_BASE_URL}/?name=${encodeURIComponent(name)}`;
  return fetchWithTimeout<AgifyResponse>(url, "Agify");
}
