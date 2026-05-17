// Browser-side client for the HashLatch testnet RPC bridge.
// CORS is configured server-side.

export const HASHLATCH_API_BASE =
  "https://api.hashlatch.online/api";

export const EXAMPLE_TXID =
  "ca0eb66f0374a9ba7d2a03325213a814d54f01bac7967407e9adf2fb9c9fb641";

const DEFAULT_TIMEOUT = 10_000;

async function withTimeout<T>(p: Promise<T>, ms = DEFAULT_TIMEOUT): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error("Request timed out")), ms),
    ),
  ]);
}

async function get<T = unknown>(path: string, ms?: number): Promise<T> {
  const res = await withTimeout(
    fetch(`${HASHLATCH_API_BASE}${path}`, {
      headers: { Accept: "application/json" },
    }),
    ms,
  );
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await withTimeout(
    fetch(`${HASHLATCH_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  blockchainInfo: () => get<Record<string, unknown>>("/blockchaininfo"),
  balance: (address?: string) =>
    get<Record<string, unknown>>(
      "/balance",
    ),
  getSeedPhrase: () =>
    get<{ address: string; seed_phrase: string } & Record<string, unknown>>(
      "/getseedphrase",
    ),
  decode: (txid: string) =>
    get<Record<string, unknown>>(`/decode/${encodeURIComponent(txid)}`),
};

export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
