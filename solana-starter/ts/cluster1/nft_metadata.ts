import wallet from "./wallet/wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        // const image = await umi.downloader.download(["DgrGZJpNUsnDggL27GxmUimutyXoUS95QtYKk2jZEtTR"])
        const image = "https://devnet.irys.xyz/DgrGZJpNUsnDggL27GxmUimutyXoUS95QtYKk2jZEtTR";
        const metadata = {
            name: "fartRug",
            symbol: "FRug",
            description: "The king of no where farterd in this art",
            image: image,
            attributes: [
                {trait_type: 'Brown', value: '1'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata)
        console.log("Your metadata URI: ", myUri); // DdvfMeZr7ybCTmYLr4VqiWxxY45onhq3bbofJshQ5GF9
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
