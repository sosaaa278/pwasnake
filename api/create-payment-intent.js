import Stripe from "stripe";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

    // 🔓 Permitir CORS (muy importante para GitHub Pages)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // 🔁 Manejar preflight (CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // 🚫 Solo permitir POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        const { amount } = req.body;

        // 💳 Crear PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount || 1000, // 1000 = $10.00 MXN (centavos)
            currency: "mxn",

        });

        // 🔑 Enviar clientSecret al frontend
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message,
        });

    }

}