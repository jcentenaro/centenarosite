// src/controllers/mainController.js
const { QueryTypes } = require("sequelize");
const transporter = require("../utils/nodemailer");
const db = require("../config/db");

const index = (req, res) => {
  console.log("Accediendo a index, autenticado:", req.session.isAuthenticated, "error:", null);
  res.render("index", { showLoginModal: false, error: null });
};

const sendContact = async (req, res) => {
  console.log("Procesando POST /contact, autenticado:", req.session.isAuthenticated, "Session ID:", req.sessionID);
  console.log("Método:", req.method, "URL:", req.url, "Body:", req.body);

  if (!req.session.isAuthenticated) {
    console.log("No autenticado en sendContact, mostrando modal");
    return res.render("index", { showLoginModal: true, error: "Debes iniciar sesión" });
  }

  if (!req.body) {
    console.error("req.body is undefined");
    return res.render("index", {
      showLoginModal: false,
      error: "No se recibieron datos del formulario",
    });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    console.error("Faltan campos en el formulario:", { name, email, subject, message });
    return res.render("index", {
      showLoginModal: false,
      error: "Todos los campos son obligatorios",
    });
  }

  try {
    console.log("Intentando guardar en la base de datos...");
    const [result] = await db.query(
      "INSERT INTO contacts (name, email, subject, message) VALUES (:name, :email, :subject, :message)",
      {
        replacements: { name, email, subject, message },
        type: db.QueryTypes.INSERT,
      }
    );
    console.log("Datos guardados en la base de datos:", result);

    console.log("Intentando enviar correo...");
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_TO,
      subject: `Nuevo mensaje de contacto: ${subject}`,
      text: `
        Nombre: ${name}
        Email: ${email}
        Asunto: ${subject}
        Mensaje: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo enviado, renderizando contact-success");
    res.render("contact-success", { layout: "layouts/layout", showLoginModal: false, error: null });
  } catch (error) {
    console.error("Error en sendContact:", error);
    res.render("index", {
      showLoginModal: false,
      error: "Error al procesar el formulario: " + error.message,
    });
  }
};

module.exports = {
  index,
  sendContact,
};