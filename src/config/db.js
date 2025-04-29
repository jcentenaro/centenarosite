// src/config/db.js
// Forzar nuevo despliegue en Vercel
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: console.log, // Temporalmente habilitado para depuración
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 60000,
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
})();

module.exports = sequelize;