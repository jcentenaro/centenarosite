const transporter = require("../utils/nodemailer");
const db = require("../config/db");

const index = (req, res) => {
  res.render("index");
};

const login = (req, res) => {
  res.render("login", { layout: false });
};

const loginSubmit = (req, res) => {
  const { key } = req.body;

  if (key === process.env.ACCESS_KEY) {
    req.session.isAuthenticated = true;
    res.redirect("/");
  } else {
    res.render("login", { layout: false, error: "Clave incorrecta" });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
    }
    res.redirect("/login");
  });
};

const sendContact = async (req, res) => {
  console.log("Método:", req.method, "URL:", req.url, "Body:", req.body);

  if (!req.body) {
    console.error("req.body is undefined");
    return res.render("index", {
      layout: "layouts/layout",
      error: "No se recibieron datos del formulario",
    });
  }

  const { name, email, subject, message } = req.body;

  console.log("Campos recibidos:", { name, email, subject, message });

  if (!name || !email || !subject || !message) {
    console.error("Faltan campos en el formulario");
    return res.render("index", {
      layout: "layouts/layout",
      error: "Todos los campos son obligatorios",
    });
  }

  try {
    // Insertar datos en la base de datos
    const [result] = await db.query(
      "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );
    console.log("Datos guardados en la base de datos:", result);

    // Enviar el correo
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
    res.render("contact-success", { layout: "layouts/layout" });
  } catch (error) {
    console.error("Error:", error);
    res.render("index", {
      layout: "layouts/layout",
      error: "Error al procesar el formulario",
    });
  }
};

module.exports = {
  index,
  sendContact,
  login,
  loginSubmit,
  logout,
};