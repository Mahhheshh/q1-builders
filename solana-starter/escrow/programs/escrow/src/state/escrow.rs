use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub seed: u64, // seed for the escrow account
    pub maker: Pubkey, // the creator of the escrow state
    pub mint_a: Pubkey, // mint address of first token
    pub mint_b: Pubkey, // mint address of token which will be first token swapped with
    pub recieve: u64, // the other amount person recieves
    pub bump: u8, // store the bump, so we dont have to re claculate it
}