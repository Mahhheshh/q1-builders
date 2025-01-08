import {
  Connection,
  LAMPORTS_PER_SOL,
  Keypair,
  clusterApiUrl,
} from "@solana/web3.js";

import wallet from "./dev-wallet.json";

const keyPair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection(clusterApiUrl("devnet"));

(async () => {
  try {
    const txhash = await connection.requestAirdrop(
      keyPair.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.log(`Opps, Something went wrong while requesting airdrop: ${e}`);
  }
})();
