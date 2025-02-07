use anchor_lang::prelude::*;

mod state;
mod instructions;
mod error;

use instructions::*;
use error::*;

declare_id!("J86V1Echaw6CB1aMbGVbmgCb37RUBcev9QmruuR91mma");

#[program]
pub mod anchor_dice_2024 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        ctx.accounts.init(amount)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, seed: u128, roll: u8, amount: u64) -> Result<()> {
        ctx.accounts.create_bet(seed, roll, amount, &ctx.bumps)?;
        ctx.accounts.deposit(amount)
    }
}

