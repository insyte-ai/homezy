import Stripe from 'stripe';
import { BadRequestError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import { createPurchase } from './credit.service';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

/**
 * Credit packages available for purchase
 * Following the Tradezy pricing structure
 */
export const CREDIT_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    bonusCredits: 0,
    totalCredits: 50,
    priceAED: 250,
    priceUSD: 68,
    perCreditCost: 5.0,
    savings: 0,
    description: 'Perfect for testing the waters',
  },
  professional: {
    id: 'professional',
    name: 'Professional Pack',
    credits: 150,
    bonusCredits: 10,
    totalCredits: 160,
    priceAED: 600,
    priceUSD: 163,
    perCreditCost: 4.0,
    savings: 20, // 20% savings vs Starter
    popular: true,
    description: 'Most popular for active pros',
  },
  business: {
    id: 'business',
    name: 'Business Pack',
    credits: 400,
    bonusCredits: 40,
    totalCredits: 440,
    priceAED: 1400,
    priceUSD: 381,
    perCreditCost: 3.5,
    savings: 30, // 30% savings vs Starter
    description: 'Best value for growing businesses',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    bonusCredits: 150,
    totalCredits: 1150,
    priceAED: 3000,
    priceUSD: 817,
    perCreditCost: 3.0,
    savings: 40, // 40% savings vs Starter
    description: 'Maximum value for established companies',
  },
} as const;

export type PackageId = keyof typeof CREDIT_PACKAGES;

/**
 * Create a Stripe Checkout Session for credit purchase
 */
export const createCheckoutSession = async (params: {
  professionalId: string;
  packageId: PackageId;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) => {
  const { professionalId, packageId, successUrl, cancelUrl, customerEmail } = params;

  const package_ = CREDIT_PACKAGES[packageId];
  if (!package_) {
    throw new BadRequestError(`Invalid package ID: ${packageId}`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: package_.name,
              description: `${package_.totalCredits} credits (${package_.credits} + ${package_.bonusCredits} bonus) - ${package_.description}`,
              metadata: {
                packageId,
                credits: package_.totalCredits.toString(),
                baseCredits: package_.credits.toString(),
                bonusCredits: package_.bonusCredits.toString(),
              },
            },
            unit_amount: package_.priceAED * 100, // Stripe expects amount in fils (cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      client_reference_id: professionalId,
      metadata: {
        professionalId,
        packageId,
        credits: package_.totalCredits.toString(),
        baseCredits: package_.credits.toString(),
        bonusCredits: package_.bonusCredits.toString(),
        priceAED: package_.priceAED.toString(),
      },
      payment_intent_data: {
        metadata: {
          professionalId,
          packageId,
          credits: package_.totalCredits.toString(),
          priceAED: package_.priceAED.toString(),
        },
      },
    });

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      professionalId,
      packageId,
      credits: package_.totalCredits,
      baseCredits: package_.credits,
      bonusCredits: package_.bonusCredits,
      priceAED: package_.priceAED,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      package: package_,
    };
  } catch (error: any) {
    logger.error('Failed to create Stripe checkout session', error, {
      professionalId,
      packageId,
    });
    throw new BadRequestError('Failed to create checkout session');
  }
};

/**
 * Handle Stripe webhook events
 * Called when payment is confirmed, failed, or refunded
 */
export const handleWebhookEvent = async (
  event: Stripe.Event,
  rawBody: string | Buffer,
  signature: string
) => {
  // Verify webhook signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured');
    throw new Error('Webhook secret not configured');
  }

  let verifiedEvent: Stripe.Event;
  try {
    verifiedEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: any) {
    logger.error('Stripe webhook signature verification failed', error);
    throw new BadRequestError('Invalid webhook signature');
  }

  logger.info('Stripe webhook event received', {
    type: verifiedEvent.type,
    id: verifiedEvent.id,
  });

  switch (verifiedEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(verifiedEvent.data.object as Stripe.Checkout.Session);
      break;

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(verifiedEvent.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(verifiedEvent.data.object as Stripe.PaymentIntent);
      break;

    case 'charge.refunded':
      await handleChargeRefunded(verifiedEvent.data.object as Stripe.Charge);
      break;

    default:
      logger.debug('Unhandled webhook event type', { type: verifiedEvent.type });
  }

  return { received: true };
};

/**
 * Handle successful checkout session
 */
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  const { client_reference_id: professionalId, metadata } = session;

  if (!professionalId || !metadata) {
    logger.error('Missing data in checkout session', { sessionId: session.id });
    return;
  }

  const { packageId, credits, priceAED } = metadata;
  const paymentIntentId = session.payment_intent as string;

  if (!paymentIntentId) {
    logger.error('No payment intent in checkout session', { sessionId: session.id });
    return;
  }

  try {
    // Create purchase record (will be completed when payment_intent.succeeded fires)
    await createPurchase({
      professionalId,
      packageId,
      credits: parseInt(credits),
      priceAED: parseFloat(priceAED),
      stripePaymentIntentId: paymentIntentId,
      stripeSessionId: session.id,
    });

    logger.info('Checkout session completed', {
      sessionId: session.id,
      professionalId,
      packageId,
      credits,
    });
  } catch (error) {
    logger.error('Failed to handle checkout session', error, {
      sessionId: session.id,
      professionalId,
    });
  }
};

/**
 * Handle successful payment intent
 * This is where we actually credit the account
 */
const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  const { id: paymentIntentId, metadata } = paymentIntent;

  if (!metadata?.professionalId) {
    logger.error('Missing professional ID in payment intent', { paymentIntentId });
    return;
  }

  try {
    // Import here to avoid circular dependency
    // @ts-expect-error - Dynamic import to avoid circular dependency
    const { completePurchase } = await import('./credit.service');

    await completePurchase(paymentIntentId);

    logger.info('Payment intent succeeded and credits added', {
      paymentIntentId,
      professionalId: metadata.professionalId,
      credits: metadata.credits,
    });
  } catch (error) {
    logger.error('Failed to handle payment intent succeeded', error, {
      paymentIntentId,
      professionalId: metadata.professionalId,
    });
  }
};

/**
 * Handle failed payment intent
 */
const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  const { id: paymentIntentId, metadata, last_payment_error } = paymentIntent;

  logger.warn('Payment intent failed', {
    paymentIntentId,
    professionalId: metadata?.professionalId,
    error: last_payment_error?.message,
  });

  // Could send notification to user here
  // Or update purchase record status to 'failed'
};

/**
 * Handle charge refund
 */
const handleChargeRefunded = async (charge: Stripe.Charge) => {
  const { payment_intent: paymentIntentId, metadata } = charge;

  if (!paymentIntentId || !metadata?.professionalId) {
    logger.error('Missing data in charge refund', { chargeId: charge.id });
    return;
  }

  logger.info('Charge refunded', {
    chargeId: charge.id,
    paymentIntentId,
    professionalId: metadata.professionalId,
    amount: charge.amount_refunded / 100, // Convert from fils to AED
  });

  // Here you would:
  // 1. Find the purchase record
  // 2. Deduct credits from the professional's account
  // 3. Update purchase status to 'refunded'
  // This is complex and should be handled carefully
};

/**
 * Get Stripe customer by email or create new one
 */
export const getOrCreateCustomer = async (email: string, name?: string) => {
  try {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
    });

    logger.info('Stripe customer created', { customerId: customer.id, email });
    return customer;
  } catch (error) {
    logger.error('Failed to get or create Stripe customer', error, { email });
    throw error;
  }
};

/**
 * Get payment intent details
 */
export const getPaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Failed to retrieve payment intent', error, { paymentIntentId });
    throw error;
  }
};

/**
 * Refund a payment
 */
export const refundPayment = async (
  paymentIntentId: string,
  reason?: string
): Promise<Stripe.Refund> => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });

    logger.info('Payment refunded', {
      refundId: refund.id,
      paymentIntentId,
      amount: refund.amount / 100, // Convert fils to AED
    });

    return refund;
  } catch (error) {
    logger.error('Failed to refund payment', error, { paymentIntentId });
    throw error;
  }
};

export default {
  createCheckoutSession,
  handleWebhookEvent,
  getOrCreateCustomer,
  getPaymentIntent,
  refundPayment,
  CREDIT_PACKAGES,
};
