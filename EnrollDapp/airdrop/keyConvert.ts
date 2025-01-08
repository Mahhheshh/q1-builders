import bs58 from "bs58";
import prompt from "prompt-sync";

const promptSync = prompt();

function base58ToWallet() {
  const privateKeyBase58 = promptSync(
    "Enter your private key in base58 format: "
  );

  const privateKeyBytes = bs58.decode(privateKeyBase58);
  console.log("Private Key (Byte Array):", privateKeyBytes);
}

function walletToBase58() {
  const prompt = promptSync("Enter your private key: ");
  const wallet = Uint8Array.from(prompt.split(",").map(Number));
  const privateKeyBase58 = bs58.encode(wallet).toString();
  console.log("Base58 Private Key:", privateKeyBase58);
}

base58ToWallet();
walletToBase58();
