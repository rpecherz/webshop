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
            return res.status(404).send("nie ma takiego ciuszka");
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


router.post("/checkout", mid, async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).send("Musisz być zalogowany");
    }

    try {
        const cartItems = await db.query(`
            SELECT c.product_id, p.name, p.price, c.quantity 
            FROM carts c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1
        `, [userId]);

        if (cartItems.rows.length === 0) {
            return res.send(`
                <script>
                    alert("Twój koszyk jest pusty!");
                    window.location.href = "/user";
                </script>
            `);
        }
        const totalAmount = cartItems.rows.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        res.render("checkout", { cart: cartItems.rows, total: totalAmount });
    } catch (err) {
        console.error("err to checkout:", err);
        res.status(500).send("server err");
    }
});

router.get("/checkout", mid, async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.redirect("/login");
    }

    try {
        const cartItems = await db.query(`
            SELECT c.product_id, p.name, p.price, c.quantity 
            FROM carts c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1
        `, [userId]);

        const totalAmount = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.render("checkout", { cart: cartItems.rows, total: totalAmount });
    } catch (err) {
        console.error("err to checkout:", err);
        res.status(500).send("server err");
    }
});




router.post("/cart/remove/:productId", mid, async (req, res) => {
    const userId = req.session.user?.id;
    const productId = req.params.productId;

    if (!userId) {
        return res.status(401).send("Login");
    }

    try {
        const cartItem = await db.query(
            "SELECT quantity FROM carts WHERE user_id = $1 AND product_id = $2",
            [userId, productId]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).send("nie ma takiego ciuszka");
        }

        if (cartItem.rows[0].quantity > 1) {
            await db.query(
                "UPDATE carts SET quantity = quantity - 1 WHERE user_id = $1 AND product_id = $2",
                [userId, productId]
            );
        } 
        else {
            await db.query(
                "DELETE FROM carts WHERE user_id = $1 AND product_id = $2",
                [userId, productId]
            );
        }
        res.redirect(req.get("Referer") || "/user");
    }   catch (err) {
        console.error("err deleting:", err);
        res.status(500).send("server err");
    }
});

router.post("/cart/clear", mid, async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).send("Musisz być zalogowany");
    }

    try {
        await db.query("DELETE FROM carts WHERE user_id = $1", [userId]);
        res.redirect(req.get("Referer") || "/user");
    } catch (err) {
        console.error("err clearing:", err);
        res.status(500).send("server err");
    }
});




module.exports = router;
