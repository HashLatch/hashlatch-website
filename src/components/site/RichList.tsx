import React, { useEffect, useState } from 'react';

export const RichList = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch('https://explorer.hashlatch.online/ext/richlist');
        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        const data = await response.json();
        const walletList = Array.isArray(data) ? data : data.data || [];
        setWallets(walletList.slice(0, 100));
      } catch (err: any) {
        console.error("Błąd pobierania:", err);
        setError(err.message || "Błąd pobierania danych. Sprawdź CORS na explorerze.");
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  if (loading) return <div className="text-center p-8 text-xl">Loading top wallets...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Wystąpił błąd: {error}</div>;
  if (wallets.length === 0) return <div className="text-center p-8">Brak portfeli.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Top 100 Wallets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">Address</th>
              <th className="p-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900">
                <td className="p-3 font-mono text-sm">{wallet.address || wallet.a}</td>
                <td className="p-3 font-mono">{wallet.balance || wallet.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
