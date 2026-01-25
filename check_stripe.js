
const Stripe = require('stripe');
require('dotenv').config();

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
    console.error("STRIPE_SECRET_KEY is missing from .env");
    process.exit(1);
}

const stripe = new Stripe(key, {
    apiVersion: '2024-06-20',
});

async function check() {
    try {
        console.log("Checking Stripe Connection...");
        const prices = await stripe.prices.list({ limit: 10, active: true });
        console.log("--- Connected Successfully ---");
        console.log("Available Prices:");
        prices.data.forEach(p => {
            const product = typeof p.product === 'string' ? p.product : p.product.id;
            console.log(`- Price ID: ${p.id} | Amount: ${p.unit_amount} ${p.currency} | Product: ${product} | Nickname: ${p.nickname}`);
        });
        if (prices.data.length === 0) {
            console.log("No active prices found.");
        }
    } catch (error) {
        console.error("FAILED to connect to Stripe:", error.message);
    }
}

check();
