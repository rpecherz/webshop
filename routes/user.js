const express = require("express");
const router = express.Router();


function mid(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    next();
}

let products = [];
let cart = [];

router.get("/", mid, (req, res) => {
    res.render("user", { user: req.session.user, products, cart });
});

module.exports = router;
