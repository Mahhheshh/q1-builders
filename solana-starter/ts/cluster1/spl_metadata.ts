import wallet from "./wallet/wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("2dgk3J95dJifE7WWUeZxHZxUuDZnNGVd4GyFwHSd4L39");

// Create a UMI connection
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
  try {
    // define accounts
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    let data: DataV2Args = {
      name: "mahhheshh",
      symbol: "mah",
      uri: "https://imgs.search.brave.com/L6XcjfMcWiNwjkbegKwvmA0Zp_eXcMcisr_EiYiKrEU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuY2RubG9nby5j/b20vbG9nb3Mvcy84/NS9zb2xhbmEuc3Zn",
      sellerFeeBasisPoints: 400,
      creators: null,
      collection: null,
      uses: null,
    };

    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };

    let tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    let result = await tx.sendAndConfirm(umi);
    console.log(
      `the transaction signature is: ${bs58.encode(result.signature)}`
    ); //2yoXTQ2uF6gHrujv8z5wtPUy3es5Th8TTnnEYu7chmcR9DdoRRyM9uCtAKhYmatLAEX45pjMxY8yWEyw38T5WxGU
  } catch (e) {
    ``;
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
