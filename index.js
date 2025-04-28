require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { Sequelize } = require("sequelize");

// Configuración de la base de datos para sesiones
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions", // Nombre de la tabla para sesiones
});

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 horas
  })
);

// Sincronizar la tabla de sesiones
sessionStore.sync();

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
  // Permitir acceso a la ruta de login y al procesamiento del login
  if (
    req.path === "/login" ||
    req.path === "/login-submit" ||
    req.path === "/logout"
  ) {
    return next();
  }
  // Si el usuario está autenticado, continuar
  if (req.session.isAuthenticated) {
    return next();
  }
  // Redirigir al formulario de login
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