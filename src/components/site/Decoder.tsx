import { useState } from "react";
import { api, EXAMPLE_TXID } from "@/lib/hashlatch-api";

export function Decoder() {
  const [txid, setTxid] = useState("");
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const decode = async (id: string) => {
    setBusy(true);
    setErr(null);
    setData(null);
    try {
      const r = await api.decode(id);
      setData(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  };

  const loadExample = () => {
    setTxid(EXAMPLE_TXID);
    decode(EXAMPLE_TXID);
  };

  // Try to extract OP_RETURN / P2SH details from common response shapes.
  const obj = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const opReturn =
    (obj.op_return as unknown) ??
    (obj.opReturn as unknown) ??
    (obj.metadata as unknown);
  const p2sh =
    (obj.p2sh as unknown) ??
    (obj.script as unknown) ??
    (obj.redeem_script as unknown);

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          $ hashlatch-cli decoderawtransaction &lt;txid&gt;
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            placeholder="Enter TXID..."
            className="w-full rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-xs outline-none focus:border-primary"
          />
          <button
            onClick={() => txid && decode(txid)}
            disabled={!txid || busy}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Decoding…" : "Decode"}
          </button>
          <button
            onClick={loadExample}
            className="rounded-md border border-primary/50 px-4 py-2 text-xs text-primary hover:bg-primary/10"
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

      {data !== null && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass rounded-xl p-5">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
                OP_RETURN · metadata
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-foreground/90">
                {opReturn ? JSON.stringify(opReturn, null, 2) : "— none —"}
              </pre>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
                P2SH · redeem script
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-foreground/90">
                {p2sh ? JSON.stringify(p2sh, null, 2) : "— none —"}
              </pre>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              raw decode
            </div>
            <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-foreground/80">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
