require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "mxn",
                    product_data: {
                        name: "Producto PWA",
                    },
                    unit_amount: 5000, // $50.00 MXN
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/success.html",
        cancel_url: "http://localhost:3000/cancel.html",
    });

    res.json({ id: session.id });
});

app.listen(4242, () => console.log("Servidor corriendo en puerto 4242"));