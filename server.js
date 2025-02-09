const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./db/db");

const app = express();



app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 
app.use(session({
    secret: "babu",
    resave: false,
    saveUninitialized: true,
    cookie: {sameSite: "strict", maxAge: 15 * 60 * 1000}
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const registerRoutes = require("./routes/register");
const adminRoutes = require("./routes/admin");


app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products");
        res.render("index", { products: result.rows }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Błąd serwera");
    }
});


app.use(authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/register", registerRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Serwer działa na http://localhost:${PORT}`));
