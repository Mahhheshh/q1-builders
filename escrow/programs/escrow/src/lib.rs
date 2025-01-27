use anchor_lang::prelude::*;

mod state;

mod instructions;

use instructions::*;

declare_id!("4jdso4ATK23r34T1dU9Sa3MSuSQMTLdWwGLSzJCYPPNt");

#[program]
pub mod escrow {

    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64, receive: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.deposite(deposit)?;
        Ok(())
    }
    
    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit()?;
        ctx.accounts.withdraw_and_close()?;
        Ok(())
    }
    
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()?;
        Ok(())
    }

}
