const express = require("express");
const pool = require("../db/db");

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("Email from form:", email);
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.render("login", { error: `Nieprawidłowy login lub hasło` });
        }
        if(userResult.rows[0].password !== password)
        {
            return res.send(`
                <script>
                    alert("Zly email bądź hasło!");
                    window.location.href = "/login";
                </script>
            `);
        }

        const user = userResult.rows[0];

        req.session.user = { id: user.id, email: user.email, role: user.is_admin ? "admin" : "user" };

        if (user.is_admin) {
            return res.redirect("/admin");
        } else {
            return res.redirect("/user");
        }

    } catch (err) {
        console.error(err);
        res.render("login", { error: "server err" });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
