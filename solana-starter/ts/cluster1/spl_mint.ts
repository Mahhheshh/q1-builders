import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "./wallet/wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("2dgk3J95dJifE7WWUeZxHZxUuDZnNGVd4GyFwHSd4L39");

(async () => {
    try {
        // create ata
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
            true,
            commitment
          );
      
          // console log address;
          console.log(`ATA mint address; ${ata.address.toBase58()}`); // 2oZLfzUyHhBxYY43bn2QtbwUrb7mweF3wvPNURmgv6Hk
      
          // minting tokens
          const tx = await mintTo(
            connection,
            keypair,
            mint,
            ata.address,
            keypair.publicKey,
            token_decimals,
            [],
            { commitment }
          );
      
          console.log(`transaction hash is ${tx}`); // 22Pbomvap6cUqM8NAy94AGSZ1gTJoBPhtaAwKLZJeopMzmNMEjpM4zuhGtssWQHg4DXSqAfvBiuM1uzwmfpD1Uoo
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
