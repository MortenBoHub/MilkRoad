import { Api } from "./Api";

/**
 * Where the MilkRoad API lives; one place decides it.
 *
 * Bun only inlines a literal `process.env.BUN_PUBLIC_API_URL` when it is set.
 * When unset the token survives into the browser, where reading it throws
 * `ReferenceError: process is not defined`. try/catch catches that so the
 * fallback can win. (Don't use `typeof process` — the bundler rewrites only the
 * `process.env.*` token, so that check always reads "undefined".)
 */
function readEnvApiUrl(): string | undefined {
  try {
    return process.env.BUN_PUBLIC_API_URL;
  } catch {
    return undefined;
  }
}

export const API_BASE_URL = readEnvApiUrl() ?? "http://localhost:5001";

/** One shared client, so the base URL can be swapped in one place. */
export const api = new Api({ baseUrl: API_BASE_URL });
