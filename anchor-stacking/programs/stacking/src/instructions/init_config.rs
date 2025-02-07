use anchor_lang::prelude::*;
use anchor_spl::{token::Token, token_interface::Mint};

use crate::Config;

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"config"],
        space = Config::INIT_SPACE,
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = admin,
        seeds = [b"rewards", config.key().as_ref()],
        mint::decimals = 6,
        mint::authority = config,
        bump,
    )]
    pub rewards_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
