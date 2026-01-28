import { Request, Response } from 'express';
import { stripe } from '../stripe/stripe';

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { seatIds, eventId } = req.body;

  if (!seatIds?.length) {
    return res.status(400).json({ message: 'No seats selected' });
  }

  // ⚠️ For demo: flat price
  const PRICE_PER_SEAT = 300;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Movie Ticket',
            },
            unit_amount: PRICE_PER_SEAT * 100,
          },
          quantity: seatIds.length,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        seatIds: JSON.stringify(seatIds),
        eventId,
        userId: 'user-1', // mocked for now
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create payment session' });
  }
};
