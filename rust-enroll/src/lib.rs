#[cfg(test)]
mod tests {

    use solana_sdk;
    use solana_sdk::{
        pubkey::Pubkey,
        signature::{Keypair, Signer},
    };

    // for pk conversion
    use bs58;
    use std::io::{self, BufRead};

    #[test]
    fn keygen() {
        // Create a new keypair and a new wallet with it
        let kp = Keypair::new();
        println!(
            "I've generated a new Solana wallet: {}", // Apcqkwih6xiuKTUzc51UZMeVGcbsdM1NCtPgavWRuYDp
            kp.pubkey().to_string()
        );
        println!("");
        println!("To save your wallet, copy and paste the following into a JSON file:");
        println!("{:?}", kp.to_bytes());
    }

    // base58 to bytes array
    #[test]
    fn base58_to_wallet() {
        println!("Input your private wallet");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file is:");
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("{:?}", wallet);
    }

    // bytes array to base58
    #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a wallet file byte array:");
        let stdin = io::stdin();
        let wallet = stdin
            .lock()
            .lines()
            .next()
            .unwrap()
            .unwrap()
            .trim_start_matches('[')
            .trim_end_matches(']')
            .split(',')
            .map(|s| s.trim().parse::<u8>().unwrap())
            .collect::<Vec<u8>>();

        println!("Your private key is:");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }

    // air drop some tokens
    #[test]
    fn airdop() {}

    #[test]
    fn transfer_sol() {}
}
