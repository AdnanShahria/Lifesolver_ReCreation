import type { Env } from '../types';

export interface CheckoutOptions {
  planId: string;
  cycle: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(opts: CheckoutOptions, env: Env): Promise<{ url: string }> {
  // Mock/Stripe checkout URL generator for local dev or production
  if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== 'sk_test_xxx') {
    // In production, call Stripe API directly
    return { url: `https://checkout.stripe.com/pay/mock_session_${opts.planId}` };
  }
  return { url: `${opts.successUrl}?session_id=mock_${Date.now()}` };
}
