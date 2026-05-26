// HashLatch (HLC) non-custodial wallet — pure browser crypto, no Node Buffer.
// All key material stays in the browser. The server NEVER sees seeds/keys.
//
// Network parameters (chainparams.cpp):
//   PUBKEY_ADDRESS = 88   (addresses start with "c")
//   SECRET_KEY     = 188  (WIF starts with "U"/"L")

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { HDKey } from "@scure/bip32";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import bs58check from "bs58check";

const PUBKEY_VERSION = 88;
const WIF_VERSION = 188;

export interface HlcWallet {
  address: string;
  wif: string;
  mnemonic: string;
}

function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

function pubkeyToAddress(pubkey: Uint8Array): string {
  const h = hash160(pubkey);
  const payload = new Uint8Array(1 + h.length);
  payload[0] = PUBKEY_VERSION;
  payload.set(h, 1);
  return bs58check.encode(payload);
}

function privkeyToWIF(priv: Uint8Array): string {
  const payload = new Uint8Array(1 + priv.length + 1);
  payload[0] = WIF_VERSION;
  payload.set(priv, 1);
  payload[1 + priv.length] = 0x01;
  return bs58check.encode(payload);
}

function wifToPrivkey(wif: string): Uint8Array {
  const decoded = bs58check.decode(wif.trim());
  if (decoded[0] !== WIF_VERSION) throw new Error("Wrong network WIF");
  let priv = decoded.slice(1);
  if (priv.length === 33 && priv[32] === 0x01) priv = priv.slice(0, 32);
  return priv;
}

export function generateWallet(): HlcWallet {
  const mnemonic = generateMnemonic(wordlist, 128);
  return walletFromMnemonic(mnemonic);
}

export function walletFromMnemonic(mnemonic: string): HlcWallet {
  const normalized = mnemonic.trim().toLowerCase().split(/\s+/).join(" ");
  if (!validateMnemonic(normalized, wordlist)) {
    throw new Error("Invalid 12-word recovery phrase");
  }
  const seed = mnemonicToSeedSync(normalized);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive("m/44'/175'/0'/0/0");
  if (!child.privateKey || !child.publicKey) throw new Error("Derivation failed");
  return {
    address: pubkeyToAddress(child.publicKey),
    wif: privkeyToWIF(child.privateKey),
    mnemonic: normalized,
  };
}

export function walletFromWIF(wif: string): { address: string; wif: string } {
  const priv = wifToPrivkey(wif);
  const pub = secp256k1.getPublicKey(priv, true);
  return { address: pubkeyToAddress(pub), wif: wif.trim() };
}
