const express = require("express");
const router = express.Router();
const db = require("../db/db");


function mid(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    next();
}

let products = [];
let cart = [];

router.get("/", mid, async (req, res) => {
    try {
        const productsResult = await db.query("SELECT * FROM products"); 

        res.render("user", {
            user: req.session.user, 
            products: productsResult.rows,
            cart: [] 
        });
    } catch (err) {
        console.error("db query error", err.stack);
        res.status(500).send("db query error");
    }
});


router.post("/cart/add", mid, async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user?.id;

    if(!userId) 
    {
        return res.status(401).send("Musisz byc zalogowany");
    }

    if(!productId) 
    {
        return res.status(400).send("product id ni ma");
    }

    try {
        const productCheck = await db.query("SELECT id FROM products WHERE id = $1", [productId]);
        if (productCheck.rows.length === 0) {
            return res.status(404).send("Produkt nie istnieje");
        }

        await db.query(
            `INSERT INTO carts (user_id, product_id, quantity)
             VALUES ($1, $2, 1)
             ON CONFLICT (user_id, product_id) 
             DO UPDATE SET quantity = carts.quantity + 1`,
            [userId, productId]
        );

        res.redirect("/user"); 
    }
    catch (err) 
    {
        console.error("err adding to cart", err);
        res.status(500).send("server err");
    }
});




module.exports = router;
