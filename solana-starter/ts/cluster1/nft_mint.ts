import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import wallet from "./wallet/wba-wallet.json";
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
  let tx = await createNft(umi, {
    mint,
    name: "fartRug",
    uri: "https://devnet.irys.xyz/DdvfMeZr7ybCTmYLr4VqiWxxY45onhq3bbofJshQ5GF9",
    sellerFeeBasisPoints: percentAmount(5),
  });
  let result = await tx.sendAndConfirm(umi);
  const signature = base58.encode(result.signature);

  console.log(
    `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  console.log("Mint Address: ", mint.publicKey);

  //   https://explorer.solana.com/tx/kCpHYPQPvP1WkMiK9gbszMibYwwa22Y1r1yznwVgVEETZZfn1c8ms7BLGFGdpsMks8Qwmbet8G6XxQzRkrx2Pc3?cluster=devnet
  // Mint Address:  2za8NFvqPNiRyD19HooYR4d9sLCxTdf6XUgGahsMktGF
})();
