// index.js
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
// const session = require("express-session");
// const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require("./src/config/db");

// Configuración del almacén de sesiones
// const sessionStore = new SequelizeStore({
//   db: sequelize,
//   tableName: "sessions",
//   checkExpirationInterval: 15 * 60 * 1000,
//   expiration: 24 * 60 * 60 * 1000,
//   logging: false,
//   disableTouch: true, // Evita actualizaciones automáticas
//   extendDefaultFields: (defaults, session) => ({
//     data: defaults.data,
//     expires: defaults.expires,
//   }),
// });

// Sincronizar la tabla de sesiones (comentar después de crear la tabla)
// sessionStore.sync().catch((err) => {
//   console.error("Error al sincronizar la tabla de sesiones:", err);
// });

// Configuración de sesiones
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   })
// );

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
// app.use((req, res, next) => {
//   const publicPaths = ["/login", "/login-submit", "/logout", "/contact"];
//   if (publicPaths.includes(req.path)) {
//     return next();
//   }
//   if (req.session.isAuthenticated) {
//     return next();
//   }
//   res.redirect("/login");
// });

const mainRoutes = require("./src/routes/mainRoutes");
app.use("/", mainRoutes);

app.use("/admin/productos", require("./src/routes/admin/productosRoutes"));

app.use((req, res, next) => {
  res.status(404).send("La página no existe");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));