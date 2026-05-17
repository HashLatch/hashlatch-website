import { useEffect, useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { api, EXAMPLE_TXID } from "@/lib/hashlatch-api";

type DecodedTx = Record<string, unknown> & {
  txid?: string;
  blockhash?: string;
  block_height?: number;
  height?: number;
  confirmations?: number;
  vout?: Array<Record<string, unknown>>;
  op_return?: Record<string, unknown> | string;
  metadata?: Record<string, unknown>;
  p2sh?: Record<string, unknown> | string;
  script?: string;
  redeem_script?: string;
  bounty?: Record<string, unknown>;
  amount?: number | string;
  status?: string;
  deadline?: number | string;
};

function CopyChip({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
    >
      {done ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function Typed({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 15);
    return () => clearInterval(id);
  }, [text]);
  return (
    <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground/90">
      {shown}
      <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
    </pre>
  );
}

function highlightScript(script: string) {
  // basic syntax highlight — OP_* opcodes; OP_CHECKLOCKTIMEVERIFY in primary
  const parts = script.split(/(\s+)/);
  return parts.map((p, i) => {
    if (p === "OP_CHECKLOCKTIMEVERIFY") {
      return (
        <span key={i} className="font-bold text-primary">
          {p}
        </span>
      );
    }
    if (/^OP_/.test(p)) {
      return (
        <span key={i} className="text-emerald-300">
          {p}
        </span>
      );
    }
    if (/^[0-9a-f]{8,}$/i.test(p)) {
      return (
        <span key={i} className="text-foreground/70">
          {p}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function getStr(o: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!o) return undefined;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return undefined;
}

export function Decoder() {
  const [txid, setTxid] = useState("");
  const [data, setData] = useState<DecodedTx | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const decode = async (id: string) => {
    setBusy(true);
    setErr(null);
    setNotFound(false);
    setData(null);
    try {
      const r = (await api.decode(id)) as DecodedTx;
      // crude detection of "not found"
      if (!r || (r.error as string) || Object.keys(r).length === 0) {
        setNotFound(true);
      } else {
        setData(r);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      if (msg.includes("404")) setNotFound(true);
      else setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const loadExample = () => {
    setTxid(EXAMPLE_TXID);
    decode(EXAMPLE_TXID);
  };

  // Try to extract fields from various shapes
  const meta =
    (data?.op_return && typeof data.op_return === "object"
      ? (data.op_return as Record<string, unknown>)
      : undefined) ?? (data?.metadata as Record<string, unknown> | undefined);

  const bounty = data?.bounty as Record<string, unknown> | undefined;

  const p2shObj =
    (data?.p2sh && typeof data.p2sh === "object"
      ? (data.p2sh as Record<string, unknown>)
      : undefined) ?? bounty;

  const redeemScript =
    (typeof data?.p2sh === "string" ? (data.p2sh as string) : undefined) ??
    getStr(p2shObj, "redeem_script", "redeemScript", "script") ??
    (data?.redeem_script as string | undefined) ??
    (data?.script as string | undefined);

  const protocol = getStr(meta, "protocol", "proto") ?? "HLC1";
  const algorithm = getStr(meta, "algorithm", "algo") ?? "SHA256";
  const targetHash =
    getStr(meta, "target_hash", "targetHash", "target") ??
    getStr(bounty, "target_hash", "targetHash", "target");
  const metaDeadline =
    getStr(meta, "deadline", "deadline_block", "locktime") ??
    getStr(bounty, "deadline", "deadline_block", "locktime");

  const creatorPubkey =
    getStr(p2shObj, "creator_pubkey", "creatorPubkey", "pubkey") ??
    getStr(bounty, "creator_pubkey", "creatorPubkey", "pubkey");

  const amount =
    getStr(bounty, "amount", "value") ??
    getStr(data as Record<string, unknown>, "amount", "value");
  const status =
    getStr(bounty, "status") ??
    getStr(data as Record<string, unknown>, "status") ??
    "Unknown";
  const escrowDeadline =
    getStr(bounty, "deadline", "deadline_block", "locktime") ?? metaDeadline;

  const blockHeight =
    getStr(data as Record<string, unknown>, "block_height", "height", "blockHeight");
  const confirmations = getStr(data as Record<string, unknown>, "confirmations");
  const txidShown =
    getStr(data as Record<string, unknown>, "txid", "txId", "hash") ?? txid;

  const metaTerminal = [
    `> Protocol:    ${protocol}`,
    `> Algorithm:   ${algorithm}`,
    `> Target Hash: ${targetHash ?? "—"}`,
    `> Deadline:    Block ${metaDeadline ?? "—"}`,
  ].join("\n");

  return (
    <div className="space-y-6">
      {/* Input bar */}
      <div className="glass rounded-xl p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          $ hashlatch-cli decoderawtransaction &lt;txid&gt;
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={txid}
            onChange={(e) => setTxid(e.target.value.trim())}
            placeholder="Enter TXID..."
            className="w-full rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-xs outline-none focus:border-primary"
          />
          <button
            onClick={() => txid && decode(txid)}
            disabled={!txid || busy}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            {busy ? "Decoding…" : "Decode"}
          </button>
          <button
            onClick={loadExample}
            className="rounded-md border border-primary/50 px-4 py-2 font-mono text-xs text-primary hover:bg-primary/10"
          >
            Load Example
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
          ⚠ {err}
        </div>
      )}

      {notFound && (
        <div className="glass rounded-xl p-6 text-center font-mono text-sm text-muted-foreground">
          ⚠ Transaction not found on chain
        </div>
      )}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* CARD 1 — Overview */}
          <div className="glass rounded-xl p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary">
              01 · Transaction Overview
            </div>
            <dl className="space-y-2 font-mono text-xs">
              <div>
                <dt className="text-muted-foreground">TXID</dt>
                <dd className="mt-0.5 flex items-start justify-between gap-2">
                  <code className="break-all text-foreground/90">{txidShown}</code>
                  <CopyChip value={txidShown} />
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-muted-foreground">Block Height</dt>
                  <dd className="text-foreground/90">{blockHeight ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Confirmations</dt>
                  <dd className="text-foreground/90">{confirmations ?? "—"}</dd>
                </div>
              </div>
            </dl>
          </div>

          {/* CARD 2 — OP_RETURN typing */}
          <div className="glass rounded-xl p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary">
              02 · OP_RETURN metadata
            </div>
            <Typed text={metaTerminal} />
          </div>

          {/* CARD 3 — P2SH script */}
          <div className="glass rounded-xl p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                03 · P2SH redeem script
              </div>
              {creatorPubkey && (
                <div className="font-mono text-[10px] text-muted-foreground">
                  creator pubkey:{" "}
                  <span className="text-foreground/80">
                    {creatorPubkey.slice(0, 10)}…{creatorPubkey.slice(-8)}
                  </span>
                </div>
              )}
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border bg-background/60 p-3 font-mono text-xs leading-relaxed">
              {redeemScript ? highlightScript(redeemScript) : "— script unavailable —"}
            </pre>
          </div>

          {/* CARD 4 — Escrow */}
          <div className="glass rounded-xl p-5 md:col-span-2">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary">
              04 · Escrow details
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground">
                  Amount Locked
                </div>
                <div className="font-mono text-lg text-primary">
                  {amount ?? "—"} <span className="text-xs">HLC</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground">
                  Status
                </div>
                <div className="font-mono text-sm text-foreground/90">{status}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground">
                  Deadline
                </div>
                <div className="font-mono text-sm text-foreground/90">
                  Block {escrowDeadline ?? "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Raw collapsible */}
          <details className="glass rounded-xl p-5 md:col-span-2">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              raw decode (json)
            </summary>
            <pre className="mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-foreground/70">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
