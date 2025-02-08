const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const client = require("../db/db");

function admid(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/");
    }
    next();
}

// Panel administratora
router.get("/", admid, (req, res) => {
    client.query("SELECT * FROM products")
        .then(result => {
            const products = result.rows;
            res.render("admin", { users: [], products, orders: [] });
        })
        .catch(err => {
            console.error('Database query error', err.stack);
            res.status(500).send('Database query error');
        });
});

router.post("/products/add", [
    body("name").escape(),
    body("price").isFloat({ min: 0 }).withMessage("Cena musi być liczbą")
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Błąd walidacji");
    }

    const { name, price } = req.body;
    client.query('INSERT INTO products (name, price) VALUES ($1, $2)', [name, price])
        .then(() => {
            res.redirect("/admin");
        })
        .catch(err => {
            console.error('Database insert error', err.stack);
            res.status(500).send('Error adding product');
        });
});

module.exports = router;
