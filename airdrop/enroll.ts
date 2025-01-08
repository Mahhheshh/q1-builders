import { Keypair, Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

import courseWallet from "./course-wallet.json";
import { AnchorProvider, Idl, Program, Wallet } from "@coral-xyz/anchor";
import { IDL, Turbin3Prereq } from "./programs/Turbin3_prereq";

const kp = Keypair.fromSecretKey(new Uint8Array(courseWallet));

const connection = new Connection(clusterApiUrl("devnet"));

const ghUserName = Buffer.from("mahhheshh", "utf8");

const provider = new AnchorProvider(connection, new Wallet(kp), {
  commitment: "confirmed",
});

const program: Program<Turbin3Prereq> = new Program(IDL as Turbin3Prereq, provider);

// pda
const enrollment_seeds = [Buffer.from("prereq"), kp.publicKey.toBuffer()];
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(
  enrollment_seeds,
  program.programId
);

(async () => {
  try {
    const txHash = await program.methods
      .complete(ghUserName)
      .accounts({ signer: kp.publicKey })
      .signers([kp])
      .rpc();

    console.log(`Success! Check out your TX here:
            https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  } catch (error) {
    console.log(
      `Oops! Something went wrong sending enrollment transaction: ${error}`
    );
  }
})();
