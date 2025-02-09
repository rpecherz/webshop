const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../db/db");

function admid(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/");
    }
    next();
}

router.get("/", admid, async (req, res) => {
    try {
        const productsResult = db.query("SELECT * FROM products");
        const usersResult = db.query("SELECT * FROM users");
        const cartsResult = db.query("SELECT * FROM carts"); 

        const [products, users, carts] = await Promise.all([productsResult, usersResult, cartsResult]);

        res.render("admin", {
            products: products.rows,
            users: users.rows,
            carts: carts.rows
        });
    } catch (err) {
        console.error('db query err', err.stack);
        res.status(500).send('db query err');
    }
});


router.post("/products/add", [
    body("name").escape(),
    body("price").isFloat({ min: 0 }).withMessage("Cena musi być liczbą"),
    body("image_url").notEmpty().withMessage("URL obrazu jest wymagany")
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Błąd walidacji");
    }

    const { name, price, image_url } = req.body;
    db.query('INSERT INTO products (name, image_url, price) VALUES ($1, $2, $3)', [name, image_url, price])
        .then(() => res.redirect("/admin"))
        .catch(err => {
            console.error('Database insert error', err.stack);
            res.status(500).send('Error adding product');
        });

});

router.post("/products/delete", async (req, res) => {
    const { productId } = req.body;
    console.log(productId);

    if (!productId) {
        return res.status(400).send("nie ma takiego ciuszka");
    }

    try {
        await db.query("DELETE FROM products WHERE id = $1", [productId]);
        res.redirect("/admin");
    } catch (err) {
        console.error("error deleting ciuszek", err.stack);
        res.status(500).send("error deleting ciuszek");
    }
});

module.exports = router;
