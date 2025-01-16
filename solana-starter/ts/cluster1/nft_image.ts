import wallet from "./wallet/wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz/" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    //1. Load image
    const imageFile = await readFile("./cluster1/img/generug.png");
    //2. Convert image to generic file.

    const imageAsGenericFile = createGenericFile(imageFile, "getRugged.png", {
      contentType: "image/jpg",
    });
    //3. Upload image
    // const image = ???

    const [myUri] = await umi.uploader.upload([imageAsGenericFile]);
    console.log("Your image URI: ", myUri); // 499SKsEBjZimDCZs59gq1rQLHMdnBtAAFwBdLM3wCLAL
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
