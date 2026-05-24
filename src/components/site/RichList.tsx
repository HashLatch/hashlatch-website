import React, { useEffect, useState } from 'react';

export const RichList = () => {
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [displayedWallets, setDisplayedWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch('https://explorer.hashlatch.online/api/richlist');
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        const DEV_ADDRESS = 'ce6KYfjYGUH5dzxXiBLfGEVArWgLRaLF3V';
        const walletList = Array.isArray(data) ? data : data.addresses || data.data || [];
        const validWallets = walletList.filter((w: any) => w.address !== "coinbase" && w.a !== "coinbase" && !isNaN(Number(w.balance || w.b)));
        const sorted = validWallets.sort((a: any, b: any) => (b.balance || b.b) - (a.balance || a.a));
        const labeled = sorted.map((w: any) => ({
          ...w,
          label: w.address === DEV_ADDRESS ? '🔧 Dev Fee Wallet' : undefined
        }));
        setAllWallets(labeled);
        setDisplayedWallets(labeled.slice(0, 100));
      } catch (err: any) {
        console.error(err);
        setError("Cannot connect to the explorer. Please check network or CORS settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWallets, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDisplayedWallets(allWallets.slice(0, 100));
    } else {
      const filtered = allWallets.filter(w => (w.address || w.a)?.toLowerCase().includes(searchTerm.toLowerCase()));
      setDisplayedWallets(filtered);
    }
  }, [searchTerm, allWallets]);

  if (loading) return <div className="text-center p-8 text-muted-foreground font-mono">Loading top wallets...</div>;
  if (error) return <div className="text-center p-8 text-red-500 font-mono">Error: {error}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background/50 border border-border/30 rounded-xl my-12 z-10 relative backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-mono tracking-wider text-primary">Top 100 Wallets</h2>
        <input 
          type="text" 
          placeholder="Search wallet address..." 
          className="px-4 py-2 w-full md:w-96 bg-background/80 border border-border/50 rounded-md focus:outline-none focus:border-primary text-sm font-mono text-muted-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/30 bg-muted/10">
              <th className="p-4 font-mono text-sm text-muted-foreground font-semibold">Rank</th>
              <th className="p-4 font-mono text-sm text-muted-foreground font-semibold">Address</th>
              <th className="p-4 font-mono text-sm text-muted-foreground font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayedWallets.map((wallet, idx) => (
              <tr key={idx} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                <td className="p-4 font-mono text-sm text-muted-foreground">{idx + 1}</td>
                <td className="p-4 font-mono text-sm text-primary">
                  {wallet.address || wallet.a}
                  {wallet.label && <span className="ml-2 text-xs text-yellow-500 font-sans">{wallet.label}</span>}
                </td>
                <td className="p-4 font-mono text-sm">{Number(wallet.balance || wallet.b).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 4})} HLC</td>
              </tr>
            ))}
            {displayedWallets.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground font-mono">No wallets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
