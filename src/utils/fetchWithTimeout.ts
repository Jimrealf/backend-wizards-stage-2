import { AppError, badGateway } from "./errors.js";

const TIMEOUT_MS = 5000;

export async function fetchWithTimeout<T>(url: string, label: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw badGateway(`${label} returned an invalid response`);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw badGateway(`${label} returned an invalid response`);
  } finally {
    clearTimeout(timeoutId);
  }
}
