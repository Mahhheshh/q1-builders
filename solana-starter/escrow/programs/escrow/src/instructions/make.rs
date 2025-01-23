use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::state::Escrow; // import the EscrowState, pda

#[derive(Accounts)]
#[instruction(seed:u64)] // parse the seed from instruction
pub struct Make<'info> {
    #[account(mut)]
    // Maker is the account initiating the escrow and must sign the transaction
    pub maker: Signer<'info>,

    // Mint A represents the token type that the maker wants to trade away
    pub mint_a: InterfaceAccount<'info, Mint>,

    // Mint B represents the token type that the maker wants to receive
    pub mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut, // Mutable because token balance will change
        associated_token::mint = mint_a, // Links to mint_a token type
        associated_token::authority = maker, // Maker has authority over this account
    )]
    // Maker's Associated Token Account (ATA) for token A, using Interface to support all token versions
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init, // Creates a new PDA account
        payer = maker, // The maker will pay for rent
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()], // PDA seeds: "escrow" + maker's public key + unique seed
        space = 8 + Escrow::INIT_SPACE, // Allocate space: 8 bytes for discriminator + custom data size
        bump // Stores the bump seed used in PDA derivation
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        init, // Creates a new token account (vault)
        payer = maker, // The maker pays for vault account creation
        associated_token::mint = mint_a, // Associates vault with token type A
        associated_token::authority = escrow, // The escrow PDA controls this vault
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    // Program to manage Associated Token Accounts
    pub associated_token_program: Program<'info, AssociatedToken>,
    // Interface for token operations (supports both SPL and Token-2022)
    pub token_program: Interface<'info, TokenInterface>,
    // Required for creating new accounts on Solana
    pub system_program: Program<'info, System>,
}

impl<'info> Make<'info> {
    // init the escrow
    pub fn init_escrow(&mut self, seed: u64, recieve: u64, bumps: &MakeBumps) -> Result<()> {
        // add the information to the pda/escrow state
        self.escrow.set_inner(Escrow {
            seed,
            maker: self.maker.key(),
            mint_a: self.mint_a.key(),
            mint_b: self.mint_b.key(),
            recieve,
            bump: bumps.escrow,
        });
        Ok(())
    }

    pub fn deposite(&mut self, amount: u64) -> Result<()> {
        let transfer_accounts = TransferChecked {
            from: self.maker_ata_a.to_account_info(),     // Source of tokens (maker's account)
            mint: self.mint_a.to_account_info(),          // Token mint being transferred
            to: self.vault.to_account_info(),             // Destination vault
            authority: self.maker.to_account_info(),      // Authority approving transfer
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), transfer_accounts);

        transfer_checked(cpi_ctx, amount, self.mint_a.decimals)
    }
}
