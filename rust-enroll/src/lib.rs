#[cfg(test)]
mod tests {

    use solana_sdk;
    // import the required functions
    use solana_sdk::{
        pubkey::Pubkey,
        signature::{Keypair, Signer},
    };

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

    #[test]
    fn airdop() {}

    #[test]
    fn transfer_sol() {}
}
