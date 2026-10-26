import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error("Missing required MySQL environment variables");
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD ?? "",
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(async (connection) => {
    const [rows] = await connection.query(
      "SELECT DATABASE() AS database_name"
    );

    console.log("Connected to MySQL:", rows);
    connection.release();
  })
  .catch((error: Error) => {
    console.error("Database connection failed:", error.message);
  });

export default pool;
