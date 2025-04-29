// index.js
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const sequelize = require("./src/config/db");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (req.method === "POST") {
  }
  next();
});
app.use(methodOverride("_method"));

const mainRoutes = require("./src/routes/mainRoutes");
app.use("/", mainRoutes);

app.use("/admin/productos", require("./src/routes/admin/productosRoutes"));

app.use((req, res, next) => {
  res.status(404).send("La página no existe");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));