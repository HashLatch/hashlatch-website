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
const SIGHASH_ALL = 1;

export interface HlcWallet {
  address: string;
  wif: string;
  mnemonic: string;
}

export interface UTXO {
  txid: string;
  outputIndex: number;
  satoshis: number;
  script: string;
  height: number;
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

// ─── Transaction Building ───────────────────────────────────────────────────

function writeUint32LE(val: number): Uint8Array {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, val, true);
  return buf;
}

function writeUint64LE(val: bigint): Uint8Array {
  const buf = new Uint8Array(8);
  new DataView(buf.buffer).setBigUint64(0, val, true);
  return buf;
}

function writeVarInt(val: number): Uint8Array {
  if (val < 0xfd) return new Uint8Array([val]);
  if (val <= 0xffff) {
    const buf = new Uint8Array(3);
    buf[0] = 0xfd;
    new DataView(buf.buffer).setUint16(1, val, true);
    return buf;
  }
  const buf = new Uint8Array(5);
  buf[0] = 0xfe;
  new DataView(buf.buffer).setUint32(1, val, true);
  return buf;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < h.length; i += 2)
    bytes[i / 2] = parseInt(h.slice(i, i + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function reversedHex(txid: string): Uint8Array {
  return hexToBytes(txid).reverse();
}

function p2pkhScript(address: string): Uint8Array {
  const decoded = bs58check.decode(address);
  const pubKeyHash = decoded.slice(1);
  return concat(
    new Uint8Array([0x76, 0xa9, 0x14]),
    pubKeyHash,
    new Uint8Array([0x88, 0xac])
  );
}

function double256(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

function buildUnsignedTxForInput(
  inputs: UTXO[],
  outputs: { address: string; satoshis: bigint }[],
  inputIndex: number
): Uint8Array {
  const version = writeUint32LE(1);
  const inCount = writeVarInt(inputs.length);
  const ins = inputs.map((utxo, i) => {
    const txidBytes = reversedHex(utxo.txid);
    const vout = writeUint32LE(utxo.outputIndex);
    const seq = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
    const script = i === inputIndex ? hexToBytes(utxo.script) : new Uint8Array(0);
    return concat(txidBytes, vout, writeVarInt(script.length), script, seq);
  });
  const outCount = writeVarInt(outputs.length);
  const outs = outputs.map(o => {
    const script = p2pkhScript(o.address);
    return concat(writeUint64LE(o.satoshis), writeVarInt(script.length), script);
  });
  const locktime = writeUint32LE(0);
  const hashType = writeUint32LE(SIGHASH_ALL);
  return concat(version, inCount, ...ins, outCount, ...outs, locktime, hashType);
}

function signInput(privkey: Uint8Array, txForSigning: Uint8Array): Uint8Array {
  const hash = double256(txForSigning);
  const sig = secp256k1.sign(hash, privkey, { lowS: true });
  const derSig = sig.toDERRawBytes();
  const sigWithType = new Uint8Array(derSig.length + 1);
  sigWithType.set(derSig);
  sigWithType[derSig.length] = SIGHASH_ALL;
  return sigWithType;
}

function buildSignedTx(
  inputs: UTXO[],
  outputs: { address: string; satoshis: bigint }[],
  privkey: Uint8Array,
  pubkey: Uint8Array
): string {
  const version = writeUint32LE(1);
  const inCount = writeVarInt(inputs.length);
  const signatures = inputs.map((_, i) => {
    const unsigned = buildUnsignedTxForInput(inputs, outputs, i);
    return signInput(privkey, unsigned);
  });
  const ins = inputs.map((utxo, i) => {
    const txidBytes = reversedHex(utxo.txid);
    const vout = writeUint32LE(utxo.outputIndex);
    const seq = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
    const sig = signatures[i];
    const scriptSig = concat(
      writeVarInt(sig.length), sig,
      writeVarInt(pubkey.length), pubkey
    );
    return concat(txidBytes, vout, writeVarInt(scriptSig.length), scriptSig, seq);
  });
  const outCount = writeVarInt(outputs.length);
  const outs = outputs.map(o => {
    const script = p2pkhScript(o.address);
    return concat(writeUint64LE(o.satoshis), writeVarInt(script.length), script);
  });
  const locktime = writeUint32LE(0);
  return bytesToHex(concat(version, inCount, ...ins, outCount, ...outs, locktime));
}

const FEE_RATE = 10; // satoshis per byte

export async function buildAndSignTx(
  wif: string,
  utxos: UTXO[],
  toAddress: string,
  amountHLC: number
): Promise<string> {
  const privkey = wifToPrivkey(wif);
  const pubkey = secp256k1.getPublicKey(privkey, true);
  const fromAddress = pubkeyToAddress(pubkey);
  const amountSats = BigInt(Math.round(amountHLC * 1e8));
  const sorted = [...utxos].sort((a, b) => b.satoshis - a.satoshis);
  let selected: UTXO[] = [];
  let total = BigInt(0);
  for (const u of sorted) {
    selected.push(u);
    total += BigInt(u.satoshis);
    const estSize = selected.length * 148 + 2 * 34 + 10;
    const fee = BigInt(estSize * FEE_RATE);
    if (total >= amountSats + fee) break;
  }
  const estSize = selected.length * 148 + 2 * 34 + 10;
  const fee = BigInt(estSize * FEE_RATE);
  const change = total - amountSats - fee;
  if (change < BigInt(0)) throw new Error("Insufficient funds");
  const outputs: { address: string; satoshis: bigint }[] = [
    { address: toAddress, satoshis: amountSats },
  ];
  if (change > BigInt(546)) {
    outputs.push({ address: fromAddress, satoshis: change });
  }
  return buildSignedTx(selected, outputs, privkey, pubkey);
}
