use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
    TransferChecked,
};

use crate::state::Escrow; // import the EscrowState, pda

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>, // Account executing the take action and receiving tokenA

    #[account(mut)]
    pub maker: SystemAccount<'info>, // Original creator of the escrow, will receive tokenB

    // Token mint accounts
    #[account(
        mint::token_program = token_program
    )]
    pub mint_a: InterfaceAccount<'info, Mint>, // Mint account for tokenA being held in escrow

    #[account(
        mint::token_program = token_program
    )]
    pub mint_b: InterfaceAccount<'info, Mint>, // Mint account for tokenB offered by taker

    // Associated Token Accounts (ATAs)
    #[account(
        init_if_needed, // Create if doesn't exist
        payer = taker,  // Taker pays for account creation
        associated_token::mint = mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program
    )]
    pub taker_ata_a: InterfaceAccount<'info, TokenAccount>, // Taker's ATA to receive tokenA

    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program
    )]
    pub taker_ata_b: InterfaceAccount<'info, TokenAccount>, // Taker's ATA containing tokenB

    #[account(
        init_if_needed, // Create if doesn't exist
        payer = taker,  // Taker pays for account creation
        associated_token::mint = mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_b: InterfaceAccount<'info, TokenAccount>, // Maker's ATA to receive tokenB

    #[account(
        mut,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
        close = maker, // Close escrow account and return rent to maker
        has_one = mint_a, // Verify escrow is for correct tokenA
        has_one = mint_b, // Verify escrow is for correct tokenB
        has_one = maker, // Verify escrow belongs to correct maker
    )]
    pub escrow: Account<'info, Escrow>, // PDA holding escrow state

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, // Vault holding tokenA in escrow

    // Required programs
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Take<'info> {
    pub fn deposit(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.taker_ata_b.to_account_info(),
            to: self.maker_ata_b.to_account_info(),
            authority: self.taker.to_account_info(),
            mint: self.mint_b.to_account_info(),
        };

        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        transfer_checked(cpi_context, self.escrow.recieve, self.mint_b.decimals)?;
        Ok(())
    }

    pub fn withdraw_and_close(&mut self) -> Result<()> {
        // Create PDA signer seeds for vault authority
        let seeds = [
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Set up CPI for transferring tokenA from vault to taker
        let transfer_acconts = TransferChecked {
            from: self.vault.to_account_info(),       // Source: vault
            to: self.taker_ata_a.to_account_info(),   // Destination: taker's ATA
            mint: self.mint_a.to_account_info(),      // Mint for amount verification
            authority: self.escrow.to_account_info(), // Vault authority (escrow PDA)
        };

        // Create CPI context with PDA signer
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_acconts,
            signer_seeds,
        );

        // Execute transfer with amount and decimals check
        transfer_checked(cpi_ctx, self.vault.amount, self.mint_a.decimals)?;

        // Set up CPI for closing vault account
        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(), // Vault account to close
            destination: self.maker.to_account_info(), // Send rent to maker
            authority: self.escrow.to_account_info(), // Vault authority (escrow PDA)
        };

        // Create and execute CPI to close vault
        let close_cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            close_accounts,
            signer_seeds,
        );
        close_account(close_cpi_ctx)?;

        Ok(())
    }
}
