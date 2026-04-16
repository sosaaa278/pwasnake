require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

console.log("KEY:", process.env.STRIPE_SECRET_KEY); //linea 
app.post("/create-payment-intent", async (req, res) => {

    const { amount } = req.body;

    try {

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "mxn",
            payment_method_types: ["card"],
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: error.message
        });

    }

});

app.listen(4242, () => {
    console.log("Servidor corriendo en http://localhost:4242");
});