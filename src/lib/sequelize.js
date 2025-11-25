const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "vyl_buket_db", //vylz6754_vyl_bouquet_db
  process.env.DB_USER || "root", 
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost", //vylbouquet.com
    port: process.env.DB_PORT || 3306,  //
    dialect: "mysql",
    logging: false, // Set true untuk debug SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test koneksi
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
  }
};

testConnection();

module.exports = sequelize;
