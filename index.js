require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { Sequelize } = require("sequelize");

// Verificar carga de mysql2
try {
  const mysql2 = require("mysql2");
  console.log("mysql2 cargado correctamente:", !!mysql2);
} catch (err) {
  console.error("Error al cargar mysql2:", err);
}

// Configuración de la base de datos para sesiones
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions"
});

// Sincronizar la tabla de sesiones con manejo de errores
sessionStore.sync().catch((err) => {
  console.error("Error al sincronizar la tabla de sesiones:", err);
});

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (req.method === "POST") {
    console.log("Método:", req.method, "URL:", req.url, "Body:", req.body);
  }
  next();
});
app.use(methodOverride("_method"));

// Middleware para proteger rutas
app.use((req, res, next) => {
  if (
    req.path === "/login" ||
    req.path === "/login-submit" ||
    req.path === "/logout"
  ) {
    return next();
  }
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect("/login");
});

const mainRoutes = require("./src/routes/mainRoutes");
app.use("/", mainRoutes);

app.use("/admin/productos", require("./src/routes/admin/productosRoutes"));

app.use((req, res, next) => {
  res.status(404).send("La página no existe");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));