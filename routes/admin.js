const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();


function admid(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/");
    }
    next();
}

// Dane testowe
let products = [];

// Panel administratora
router.get("/", admid, (req, res) => {
    res.render("admin", { users: [], products, orders: [] });
});

router.post("/products/add", [
    body("name").escape(),
    body("price").isFloat({ min: 0 }).withMessage("Cena musi być liczbą")
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Błąd walidacji");
    }
    products.push({ id: products.length + 1, name: req.body.name, price: req.body.price });
    res.redirect("/admin");
});

module.exports = router;
