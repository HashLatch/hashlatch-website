// Browser-side client for the HashLatch mainnet RPC bridge.
// CORS is configured server-side.
import { API_BASE, EXPLORER_URL as EXPLORER } from "@/config/api";

export const HASHLATCH_API_BASE = API_BASE;
export const EXPLORER_URL = EXPLORER;

export const EXAMPLE_TXID =
  "91748b9508040bf6b280cd4d0768beca69537e1561f60b96ac2ae94af190b655";

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
      address ? `/balance/${encodeURIComponent(address)}` : "/balance",
    ),
  transactions: (address: string) =>
    get<Record<string, unknown>>(
      `/transactions/${encodeURIComponent(address)}`,
    ),
  getSeedPhrase: () =>
    get<{ address: string; seed_phrase: string } & Record<string, unknown>>(
      "/getseedphrase",
    ),
  decode: (txid: string) =>
    get<Record<string, unknown>>(`/decode/${encodeURIComponent(txid)}`),
  send: (body: { from?: string; to: string; amount: number; seed?: string }) =>
    post<Record<string, unknown>>("/send", body),
  createBounty: (body: {
    target_hash: string;
    amount: number;
    deadline: number;
    from?: string;
    seed?: string;
  }) => post<Record<string, unknown>>("/bounty/create", body),
  bounties: () => get<unknown>("/bounties"),
  walletTransactions: () => get<unknown>("/wallet/transactions"),
};

export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
