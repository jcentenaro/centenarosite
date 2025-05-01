require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const multer = require("multer");
const sequelize = require("./src/config/db");

app.set("trust proxy", 1); // Confiar en el primer proxy
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar multer para manejar multipart/form-data (solo campos de texto)
const upload = multer();
app.use(upload.none()); // Procesar formularios sin archivos

app.use(methodOverride("_method"));

// Configurar el almacén de sesiones
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "Sessions",
  checkExpirationInterval: 15 * 60 * 1000, // Limpieza cada 15 minutos
  expiration: 24 * 60 * 60 * 1000, // Sesiones expiran en 24 horas
});
sessionStore.sync();

// Configurar sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false, // Usar secure en producción
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Depuración: Log para todas las solicitudes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Autenticado: ${req.session.isAuthenticated || false}, Session ID: ${req.sessionID}`);
  next();
});

// Ruta para manejar el login
app.post("/login-submit", (req, res) => {
  console.log("Procesando POST /login-submit, Body:", req.body);
  const { key } = req.body;
  if (!key || key.trim() === "") {
    console.log("Clave vacía, mostrando error");
    return res.render("index", { showLoginModal: true, error: "La clave no puede estar vacía" });
  }
  if (key === process.env.ACCESS_KEY) {
    req.session.isAuthenticated = true;
    console.log("Autenticación exitosa, guardando sesión:", req.session);
    req.session.save((err) => {
      if (err) {
        console.error("Error al guardar la sesión:", err);
        return res.status(500).send("Error al guardar la sesión");
      }
      console.log("Sesión guardada, redirigiendo a /");
      return res.redirect("/");
    });
  } else {
    console.log("Clave incorrecta, mostrando error");
    return res.render("index", { showLoginModal: true, error: "Clave incorrecta" });
  }
});

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  console.log("Verificando autenticación:", {
    sessionID: req.sessionID,
    isAuthenticated: req.session.isAuthenticated,
    session: req.session,
  });
  if (req.session.isAuthenticated) {
    return next();
  }
  console.log("No autenticado, mostrando modal de login");
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