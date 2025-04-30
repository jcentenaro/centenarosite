// index.js
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const sequelize = require("./src/config/db");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

// Configurar sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 horas
  })
);

// Depuración: Log para todas las solicitudes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Autenticado: ${req.session.isAuthenticated || false}`);
  next();
});

// Ruta para manejar el login
app.post("/login-submit", (req, res) => {
  console.log("Procesando POST /login-submit");
  const { key } = req.body;
  console.log("Clave recibida:", key);
  if (key === process.env.ACCESS_KEY) {
    req.session.isAuthenticated = true;
    console.log("Sesión actualizada:", req.session);
    req.session.save((err) => {
      if (err) {
        console.error("Error al guardar la sesión:", err);
        return res.status(500).send("Error al guardar la sesión");
      }
      console.log("Sesión guardada, redirigiendo a /");
      res.redirect("/");
    });
  } else {
    console.log("Clave incorrecta, renderizando index con error");
    res.render("index", { showLoginModal: true, error: "Clave incorrecta" });
  }
});

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  console.log("Estado de la sesión:", req.session);
  if (req.session.isAuthenticated) {
    return next();
  }
  console.log("No autenticado, mostrando modal");
  res.render("index", { showLoginModal: true, error: null });
};

// Aplicar isAuthenticated a todas las rutas
app.use("/", isAuthenticated);

// Declarar rutas específicas
const mainRoutes = require("./src/routes/mainRoutes");
app.use("/", mainRoutes);
app.use("/admin/productos", require("./src/routes/admin/productosRoutes"));

// Ruta para logout
app.get("/logout", (req, res) => {
  console.log("Cerrando sesión");
  req.session.destroy();
  res.redirect("/");
});

app.use((req, res, next) => {
  res.status(404).send("La página no existe");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));