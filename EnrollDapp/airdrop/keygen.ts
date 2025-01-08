import { Keypair } from "@solana/web3.js";

let newKp = Keypair.generate();

console.log(
  `I've generated a new Solana Wallet: ${newKp.publicKey.toBase58()}`
);

console.log(`[${newKp.secretKey}]`)