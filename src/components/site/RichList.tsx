import { useEffect, useState } from "react";

interface RichEntry {
  address: string;
  balance: number;
}

export function RichList() {
  const [wallets, setWallets] = useState<RichEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://explorer.hashlatch.online/ext/richlist")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWallets(data.slice(0, 100));
        else setWallets([]);
        setLoading(false);
      })
      .catch(() => { setError(""); setLoading(false); });
  }, []);

  if (loading) return <div className="text-muted text-sm py-4">Loading top wallets...</div>;
  if (error) return <div className="text-red text-sm py-4">{error}</div>;
  if (!wallets.length) return <div className="text-muted text-sm py-4">No wallets yet — start mining to see the rich list.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left font-mono">
        <thead className="text-xs uppercase text-muted border-b border-border">
          <tr>
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">Address</th>
            <th className="py-2 px-4 text-right">Balance (HLC)</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet, index) => (
            <tr key={wallet.address} className="border-b border-border/20 hover:bg-primary/5">
              <td className="py-2 px-4 text-muted">{index + 1}</td>
              <td className="py-2 px-4 truncate max-w-[200px]">{wallet.address}</td>
              <td className="py-2 px-4 text-right text-primary">{wallet.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
