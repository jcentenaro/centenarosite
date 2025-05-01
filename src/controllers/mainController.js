const { QueryTypes } = require("sequelize");
const transporter = require("../utils/nodemailer");
const db = require("../config/db");

const index = (req, res) => {
  console.log("Accediendo a index, autenticado:", req.session.isAuthenticated, "error:", null);
  res.render("index", { showLoginModal: false, error: null });
};

const sendContact = async (req, res) => {
  console.log("Procesando POST /contact, autenticado:", req.session.isAuthenticated, "Session ID:", req.sessionID);
  console.log("Body:", req.body);

  if (!req.session.isAuthenticated) {
    console.log("No autenticado, mostrando modal");
    return res.status(401).render("index", { showLoginModal: true, error: "Debes iniciar sesión" });
  }

  if (!req.body) {
    console.error("req.body es undefined");
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(400).send("No se recibieron datos del formulario");
    }
    return res.status(400).render("index", {
      showLoginModal: false,
      error: "No se recibieron datos del formulario",
    });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    console.error("Faltan campos:", { name, email, subject, message });
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(400).send("Todos los campos son obligatorios");
    }
    return res.status(400).render("index", {
      showLoginModal: false,
      error: "Todos los campos son obligatorios",
    });
  }

  try {
    console.log("Guardando en la base de datos...");
    await db.query(
      "INSERT INTO contacts (name, email, subject, message) VALUES (:name, :email, :subject, :message)",
      {
        replacements: { name, email, subject, message },
        type: db.QueryTypes.INSERT,
      }
    );
    console.log("Datos guardados en la base de datos");

    console.log("Enviando correo...");
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_TO,
      subject: `Nuevo mensaje de contacto: ${subject}`,
      text: `Nombre: ${name}\nEmail: ${email}\nAsunto: ${subject}\nMensaje: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo enviado");

    // Responder con éxito para solicitudes AJAX
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(200).json({ message: "Mensaje enviado con éxito" });
    }
    // Para solicitudes no-AJAX, renderizar contact-success
    return res.render("contact-success", { layout: "layouts/layout", showLoginModal: false, error: null });
  } catch (error) {
    console.error("Error en sendContact:", error);
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(500).send("Error al procesar el formulario: " + error.message);
    }
    return res.status(500).render("index", {
      showLoginModal: false,
      error: "Error al procesar el formulario: " + error.message,
    });
  }
};

const contactSuccess = (req, res) => {
  console.log("Accediendo a contact-success, autenticado:", req.session.isAuthenticated);
  if (!req.session.isAuthenticated) {
    console.log("No autenticado, mostrando modal");
    return res.render("index", { showLoginModal: true, error: "Debes iniciar sesión" });
  }
  res.render("contact-success", { layout: "layouts/layout", showLoginModal: false, error: null });
};

module.exports = {
  index,
  sendContact,
  contactSuccess,
};