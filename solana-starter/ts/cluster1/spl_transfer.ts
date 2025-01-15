import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import wallet from "./wallet/wba-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("2dgk3J95dJifE7WWUeZxHZxUuDZnNGVd4GyFwHSd4L39");

// Recipient address
const to = new PublicKey("GkiKqSVfnU2y4TeUW7up2JS9Z8g1yjGYJ8x2QNf4K6Y");

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    console.log(`from ata address: ${fromAta.address}`); // 2oZLfzUyHhBxYY43bn2QtbwUrb7mweF3wvPNURmgv6Hk

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );
    console.log(`from ata address: ${toAta.address}`); // FHwyNALLZzqXbkMyWGjX3rJk6qpdeVYymFAfh6AnZTRw

    // Transfer the new token to the "toTokenAccount" we just created
    const transferTx = await transfer(
      connection,
      keypair,
      fromAta.address,
      toAta.address,
      keypair,
      2e6
    ); 

    console.log(`tokens transfered to: ${transferTx}`); // 5mfrVAG6uvJXnRuzQY3hbV6AgnWBzQDbjfNXwCwwyjE5KWKMq7FbWUwYsNaeVuru535b9T1uTnBiniy7Vgy9QcKi
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
