use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TransferChecked, transfer_checked, TokenInterface, CloseAccount, close_account};

use crate::state::Escrow;

#[derive(Accounts)]
pub struct Refund<'info> {
    // The signer who initially created the escrow and wants their tokens back
    #[account(mut)]
    pub maker: Signer<'info>,

    // The mint (token type) that was originally deposited
    #[account(
    mut,
        mint::token_program = token_program
    )]
    pub mint_a: InterfaceAccount<'info, Mint>,

    // The maker's Associated Token Account that will receive the refunded tokens
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,

    // The PDA that holds the escrow state
    // Will be closed and rent returned to maker
    #[account(
        mut,
        close = maker,
        has_one = mint_a,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    // The vault ATA controlled by the escrow PDA that holds the deposited tokens
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Refund<'info> {
    // Refund process:
    // 1. Transfer tokens from vault back to maker's ATA
    // 2. Close the vault account and recover rent
    pub fn refund_and_close_vault(&mut self) -> Result<()> {
        // Create PDA signer seeds for CPI calls
        let seeds = [
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ];

        let escrow_signer_seed = &[&seeds[..]];

        // Set up token transfer from vault to maker
        let transfer_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.maker_ata_a.to_account_info(),
            authority: self.maker.to_account_info(),
        };

        // Execute transfer with PDA as signer
        let transfer_cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_accounts,
            escrow_signer_seed,
        );

        transfer_checked(transfer_cpi_ctx, self.vault.amount, self.mint_a.decimals)?;

        // Close vault account and recover rent
        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let close_cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            close_accounts,
            escrow_signer_seed,
        );

        close_account(close_cpi_ctx)
    }
}
