const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();



app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public"))); 
app.use(session({
    secret: "babu",
    resave: false,
    saveUninitialized: true,
    cookie: {sameSite: "strict", maxAge: 15 * 60 * 1000}
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// narazie bez bazy danych
let products = [];

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

// Główna strona
app.get("/", (req, res) => {
    res.render("index", { products });
});

app.use(authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Serwer działa na http://localhost:${PORT}`));
