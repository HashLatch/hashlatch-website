// HashLatch (HLC) non-custodial wallet — all key material stays in the browser.
// The server NEVER sees the seed phrase or private key.
//
// Network parameters (from chainparams.cpp):
//   PUBKEY_ADDRESS = 88   (addresses start with "c")
//   SECRET_KEY     = 188  (WIF starts with "U"/"L")

import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

// HashLatch network definition for bitcoinjs-lib
export const HLC_NETWORK: bitcoin.networks.Network = {
  messagePrefix: "\x18HashLatch Signed Message:\n",
  bech32: "hlc", // unused (no segwit addresses on HLC)
  bip32: {
    public: 0x04882676,
    private: 0x04884567,
  },
  pubKeyHash: 88,   // 'c' addresses
  scriptHash: 33,
  wif: 188,
};

export interface HlcWallet {
  address: string;
  wif: string;
  mnemonic: string;
}

// Generate a brand-new wallet entirely in the browser.
export function generateWallet(): HlcWallet {
  const mnemonic = bip39.generateMnemonic(128); // 12 words
  return walletFromMnemonic(mnemonic);
}

// Derive the wallet (address + WIF) from a 12-word mnemonic.
// Uses BIP44-style path m/44'/175'/0'/0/0 (175 is a HLC-chosen coin type).
export function walletFromMnemonic(mnemonic: string): HlcWallet {
  const normalized = mnemonic.trim().toLowerCase().split(/\s+/).join(" ");
  if (!bip39.validateMnemonic(normalized)) {
    throw new Error("Invalid 12-word recovery phrase");
  }
  const seed = bip39.mnemonicToSeedSync(normalized);
  const root = bip32.fromSeed(seed, HLC_NETWORK);
  const child = root.derivePath("m/44'/175'/0'/0/0");
  const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey!), {
    network: HLC_NETWORK,
  });
  const { address } = bitcoin.payments.p2pkh({
    pubkey: Buffer.from(keyPair.publicKey),
    network: HLC_NETWORK,
  });
  return {
    address: address!,
    wif: keyPair.toWIF(),
    mnemonic: normalized,
  };
}

// Recover the address+WIF from an existing WIF private key.
export function walletFromWIF(wif: string): { address: string; wif: string } {
  const keyPair = ECPair.fromWIF(wif.trim(), HLC_NETWORK);
  const { address } = bitcoin.payments.p2pkh({
    pubkey: Buffer.from(keyPair.publicKey),
    network: HLC_NETWORK,
  });
  return { address: address!, wif: wif.trim() };
}
