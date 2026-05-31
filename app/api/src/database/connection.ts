import "dotenv/config";
import mysql, { Pool } from "mysql2/promise";

let pool: Pool | null = null;

/**
 * Pool de conexões MySQL (singleton preguiçoso).
 *
 * Lê as credenciais do ambiente (.env). O pool é criado sob demanda para não
 * abrir conexão durante os testes unitários, que injetam um pool fake.
 */
export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "codehub",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return pool;
}
