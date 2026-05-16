import { useState, useEffect } from "react";
import { HASHLATCH_API_BASE } from "@/lib/hashlatch-api";

export function Wallet() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [showSeed, setShowSeed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hashlatch_wallet");
    if (saved) {
      const data = JSON.parse(saved);
      setAddress(data.address);
      setSeedPhrase(data.seed);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetch(`${HASHLATCH_API_BASE}/balance`)
        .then(r => r.json())
        .then(d => setBalance(typeof d === "number" ? d.toFixed(8) : d.result || "0.00"))
        .catch(() => setBalance("0.00"));
    }
  }, [loggedIn]);

  const generateWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${HASHLATCH_API_BASE}/getseedphrase`);
      const data = await res.json();
      setAddress(data.address);
      setSeedPhrase(data.seed_phrase);
      localStorage.setItem("hashlatch_wallet", JSON.stringify({ address: data.address, seed: data.seed_phrase }));
      setLoggedIn(true);
      setShowSeed(true);
    } catch (e) {
      alert("Failed to generate wallet. Check console.");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("hashlatch_wallet");
    setLoggedIn(false);
    setAddress("");
    setSeedPhrase("");
    setBalance("0.00");
    setShowSeed(false);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#00ff00] font-mono flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl mb-4">$ hashlatch wallet</h1>
          <p className="text-sm text-[#00cc00] mb-6">Generate a new regtest wallet</p>
          <button
            onClick={generateWallet}
            disabled={loading}
            className="border border-[#FFB800] text-[#FFB800] px-6 py-3 rounded hover:bg-[#FFB800] hover:text-black transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate New Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#00ff00] font-mono p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="glass-card p-6">
          <h1 className="text-xl mb-4">$ hashlatch wallet</h1>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-[#FFB800]">Address: </span>
              <span className="break-all">{address}</span>
            </div>
            <div>
              <span className="text-[#FFB800]">Balance: </span>
              <span>{balance} HLC</span>
            </div>
          </div>
        </div>

        {showSeed && (
          <div className="glass-card p-6 border border-[#FFB800]">
            <h2 className="text-lg mb-2 text-[#FFB800]">⚠ Seed Phrase</h2>
            <p className="text-xs text-[#00cc00] mb-3">Save this phrase securely. It will not be shown again.</p>
            <div className="bg-black p-3 rounded text-sm break-all">
              {seedPhrase}
            </div>
            <button
              onClick={() => setShowSeed(false)}
              className="mt-3 text-xs text-[#FFB800] underline"
            >
              Hide seed phrase
            </button>
          </div>
        )}

        <div className="glass-card p-6">
          <h2 className="text-lg mb-3 text-[#FFB800]">Actions</h2>
          <button
            onClick={logout}
            className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-black transition-all text-sm"
          >
            Lock Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
