import { Stripe } from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Biến môi trường STRIPE_SECRET_KEY chưa được thiết lập");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, amount, paymentMethodId } = body;
    
    if (!name || !email || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    let customer;
    const doesCustomerExist = await stripe.customers.list({
      email,
    });

    if (doesCustomerExist.data.length > 0) {
      customer = doesCustomerExist.data[0];
    } else {
      const newCustomer = await stripe.customers.create({
        name,
        email,
      });
      customer = newCustomer;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2025-08-27.basil' }
    );

    const parsedAmount = parseFloat(amount);
    const roundedAmount = Math.ceil(parsedAmount);
    const stripeAmount = Math.max(roundedAmount, 23000);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "VND",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent,
        ephemeralKey: ephemeralKey,
        customer: customer.id,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Lỗi không xác định"
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}