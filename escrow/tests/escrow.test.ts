import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

const seed = new anchor.BN(1); // seed

const decimals = 6;
const initial_balance = 100_000;

describe("escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Escrow as Program<Escrow>;
  const provider = anchor.getProvider();

  let taker: anchor.web3.Keypair;
  let maker: anchor.web3.Keypair;

  let mintA: anchor.web3.PublicKey;
  let mintB: anchor.web3.PublicKey;

  let maker_ata_a: anchor.web3.PublicKey;
  let maker_ata_b: anchor.web3.PublicKey;

  let taker_ata_a: anchor.web3.PublicKey;
  let taker_ata_b: anchor.web3.PublicKey;

  let vault: anchor.web3.PublicKey;
  let escrow: anchor.web3.PublicKey;

  before("Do Setup", async () => {
    maker = anchor.web3.Keypair.generate();
    console.log("Maker public key:", maker.publicKey.toString());

    taker = anchor.web3.Keypair.generate();
    console.log("Taker public key:", taker.publicKey.toString());

    const latestBlockHash = await provider.connection.getLatestBlockhash({
      commitment: "confirmed",
    });

    const makerAirdropTx = await provider.connection.requestAirdrop(
      maker.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: makerAirdropTx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const takerAirdropTx = await provider.connection.requestAirdrop(
      taker.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: takerAirdropTx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    // mint;s
    console.log("Creating Mint A...");
    mintA = await createMint(
      provider.connection,
      maker,
      maker.publicKey,
      null,
      6
    );
    console.log("Mint A created:", mintA.toString());

    console.log("Creating Mint B...");
    mintB = await createMint(
      provider.connection,
      taker,
      taker.publicKey,
      null,
      6
    );
    console.log("Mint B created:", mintB.toString());

    // escrow account
    console.log("Deriving escrow address...");
    [escrow] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        seed.toBuffer("le", 8),
        maker.publicKey.toBuffer(),
      ],
      program.programId
    );
    console.log("Escrow address:", escrow.toString());

    // vault address
    console.log("Deriving vault address...");
    vault = await getAssociatedTokenAddress(mintA, escrow, true);
    console.log("Vault address:", vault.toString());

    console.log("Creating maker's token A account...");
    maker_ata_a = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        maker,
        mintA,
        maker.publicKey
      )
    ).address;
    console.log("Maker's token A account:", maker_ata_a.toString());

    console.log("Creating maker's token B account...");
    maker_ata_b = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        maker,
        mintB,
        maker.publicKey
      )
    ).address;
    console.log("Maker's token B account:", maker_ata_b.toString());

    console.log("Creating taker's token A account...");
    taker_ata_a = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        taker,
        mintA,
        taker.publicKey
      )
    ).address;
    console.log("Taker's token A account:", taker_ata_a.toString());

    console.log("Creating taker's token B account...");
    taker_ata_b = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        taker,
        mintB,
        taker.publicKey
      )
    ).address;
    console.log("Taker's token B account:", taker_ata_b.toString());

    console.log("Minting tokens to maker...");
    await mintTo(
      provider.connection,
      maker,
      mintA,
      maker_ata_a,
      maker,
      100_000 // 1e18
    );
    console.log("Tokens minted successfully");
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .make(seed, new anchor.BN(10000), new anchor.BN(5000))
      .accountsPartial({
        maker: maker.publicKey,
        mintA: mintA,
        mintB: mintB,
        vault: vault,
        escrow: escrow,
        makerAtaA: maker_ata_a,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([maker])
      .rpc({ skipPreflight: true });

    console.log("Your transaction signature", tx);
  });
});
