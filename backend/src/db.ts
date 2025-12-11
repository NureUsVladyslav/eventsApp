import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// дістаємо та нормалізуємо значення з .env
const DB_SERVER = process.env.DB_SERVER ?? "localhost";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433;

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: DB_SERVER, // тут вже точно string
  port: DB_PORT, // тут точно number
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("✅ Connected to SQL Server");
  }
  return pool;
}
