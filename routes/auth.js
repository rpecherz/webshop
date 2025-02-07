const express = require("express");
const router = express.Router();


//tymchasowa baza danych 
const users = [
    { username: "admin", password: "pitbull", role: "admin" },
    { username: "user", password: "jusser", role: "user" }
];

router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.render("login", { error: "Nieprawidłowy login lub hasło" });
    }

    req.session.user = { username: user.username, role: user.role };

    if (user.role === "admin") {
        return res.redirect("/admin");
    } else {
        return res.redirect("/user");
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
