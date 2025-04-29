const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2"); // Importar mysql2 explícitamente

const sequelize = new Sequelize({
  dialect: "mysql",
  dialectModule: mysql2, // Forzar el uso de mysql2
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // Habilitar logs para depuración
  // logging: (msg) => console.log("Sequelize:", msg),
  // Deshabilito logs
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  },
});

// Probar la conexión a la base de datos
(async () => {
  try {
    await sequelize.authenticate();
    // console.log("Conexión a la base de datos establecida");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
})();

module.exports = sequelize;