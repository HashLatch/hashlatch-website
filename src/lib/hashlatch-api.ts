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

// ── Bounty types ──────────────────────────────────────────────────────────
export type BountyCreateParams = {
  /** Plaintext secret — server computes SHA256(plaintext) = target_hash */
  plaintext: string;
  amount: number;
  /** Number of blocks until creator can reclaim (default 144 ≈ 24h) */
  timelock: number;
};

export type BountyCommitParams = {
  bounty_txid: string;
  /** SHA256(solution + solver_address + nonce) — computed client-side */
  commit_hash: string;
  solver_address: string;
};

export type BountyRevealParams = {
  bounty_txid: string;
  solution: string;
  nonce: string;
  payout_address: string;
};

export type BountyReclaimParams = {
  bounty_txid: string;
};

export type BountyVerifyParams = {
  text: string;
};

export const api = {
  blockchainInfo: () => get<Record<string, unknown>>("/blockchaininfo"),
  balance: (address?: string) =>
    get<Record<string, unknown>>(
      address ? `/balance/${encodeURIComponent(address)}` : "/balance",
    ),
  utxos: (address: string) =>
    get<Array<Record<string, unknown>>>(
      `/utxos/${encodeURIComponent(address)}`,
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
  broadcast: (rawHex: string) =>
    post<{ txid: string }>("/broadcast", { raw_hex: rawHex }),

  // ── Bounties ──────────────────────────────────────────────────────────
  /** List active/all bounties */
  bounties: (status = "active") =>
    get<unknown>(`/bounties${status !== "active" ? `?status=${status}` : ""}`),

  /** Create a new bounty — plaintext is hashed SHA256 server-side */
  createBounty: (params: BountyCreateParams) =>
    post<{ txid: string; target_hash: string; amount: number; timelock: number; status: string }>(
      "/bounty/create",
      params,
    ),

  /** Commit solution hash (step 1 of 2 — anti-frontrun) */
  commitBounty: (params: BountyCommitParams) =>
    post<{ status: string; txid: string; blocks_to_wait: number }>(
      "/bounty/commit",
      params,
    ),

  /** Reveal solution after 6 blocks (step 2 of 2) */
  revealBounty: (params: BountyRevealParams) =>
    post<{ status: string; txid: string }>(
      "/bounty/reveal",
      params,
    ),

  /** Creator reclaims expired bounty */
  reclaimBounty: (params: BountyReclaimParams) =>
    post<{ status: string; txid: string }>(
      "/bounty/reclaim",
      params,
    ),

  /** Compute SHA256 of plaintext (useful for verifying solution before committing) */
  hashText: (params: BountyVerifyParams) =>
    post<{ hash: string; input: string }>(
      "/bounty/hash",
      params,
    ),

  walletTransactions: () => get<unknown>("/wallet/transactions"),
};

export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
