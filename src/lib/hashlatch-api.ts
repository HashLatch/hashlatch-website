// Browser-side client for the HashLatch testnet RPC bridge.
// Calls are made directly from the user's browser; CORS must be enabled
// server-side. All functions return parsed JSON or throw.

export const HASHLATCH_API_BASE = "https://residential-learn-conduct-suddenly.trycloudflare.com/api";
export const EXAMPLE_TXID =
  "c3a8a1d210c7e0a35d11912b0919f207055af7407a33de00c1b270ac0ed98917";

async function get<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${HASHLATCH_API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${HASHLATCH_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  blockchainInfo: () => get<Record<string, unknown>>("/blockchaininfo"),
  balance: () => get<Record<string, unknown>>("/balance"),
  bounties: () => get<unknown>("/bounties"),
  decode: (txid: string) =>
    get<Record<string, unknown>>(`/decode/${encodeURIComponent(txid)}`),
  newAddress: () => post<Record<string, unknown>>("/newaddress", {}),
  createBounty: (data: {
    target_hash: string;
    amount: number | string;
    deadline?: number | string;
  }) => post<Record<string, unknown>>("/bounty", data),
};

// Compute SHA-256 of a UTF-8 string in the browser; returns lowercase hex.
export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
