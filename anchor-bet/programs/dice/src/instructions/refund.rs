use anchor_lang::{prelude::*, system_program::Transfer};

use crate::state::Bet;



#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    pub house: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[
        account(
            mut,
            close = player,
            seeds = [b"bet", vault.key().as_ref(), bet.seed.to_le_bytes().as_ref()],
            bump
        )
    ]
    pub bet: Account<'info, Bet>,

    pub system_program: Program<'info, System>
}

impl<'info> Refund<'info> {
    pub fn refund(
        &mut self,
        bumps: &RefundBumps
    ) -> Result<()> {
        let transfer_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.house.to_account_info()
        };

        let cpi_program = self.system_program.to_account_info();

        let seeds: &[&[&[u8]]] = &[
            b"vault",
            self.house.key().as_ref()
            &[bumps.vault]
        ];

        transfer(
            CpiContext::new_with_signer(
                cpi_program,
                transfer_accounts,
                seeds
            )
        );

        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.house.to_account_info(),
            authority: self.system_program.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, close_accounts, signer_seeds);

        close_account(cpi_ctx);


        Ok(())
    }
}