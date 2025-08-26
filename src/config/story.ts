import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount, Address, Account } from "viem/accounts";

// Ambil private key dari environment
let privateKey = process.env.WALLET_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("WALLET_PRIVATE_KEY not found in .env.local");
}

// Hapus prefix 0x jika ada
if (privateKey.startsWith('0x')) {
  privateKey = privateKey.slice(2);
}

// Validasi panjang private key (harus 64 karakter hex)
if (privateKey.length !== 64) {
  throw new Error(`WALLET_PRIVATE_KEY must be 64 characters (without 0x), got ${privateKey.length}`);
}

// Tambahkan prefix 0x untuk viem
const privateKeyWithPrefix: Address = `0x${privateKey}`;
export const account: Account = privateKeyToAccount(privateKeyWithPrefix);

const config: StoryConfig = {
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chainId: "aeneid",
};

export const storyClient = StoryClient.newClient(config);