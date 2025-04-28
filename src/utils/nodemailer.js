const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // Puedes usar otro servicio como SendGrid, Outlook, etc.
  auth: {
    user: process.env.EMAIL_USER, // Tu correo (definido en .env)
    pass: process.env.EMAIL_PASS, // Tu contraseña o clave de aplicación (definido en .env)
  },
});

module.exports = transporter;