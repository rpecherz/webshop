const express = require("express");
const crypto = require("crypto");
const pool = require("../db/db");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("register", { error: null });
});

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || email.length < 6 || password.length < 7)
    {
        return res.render("register", { error: "Nieprawidłowy email lub hasloo!" });
    }

    try
    {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.render("register", { error: "Użytkownik już istnieje!" });
        }
        const salt = crypto.randomBytes(16).toString("hex");
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");

        await pool.query("INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3)", [
            email,
            `${salt}:${hashedPassword}`, 
            false
        ]);

        res.redirect("/login");

    } 
    catch (err) {
        console.error(err);
        res.render("register", { error: "serva err" });
    }
});

module.exports = router;
