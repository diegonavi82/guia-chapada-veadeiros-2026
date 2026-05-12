import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao configurado no .env");
}

let connection;

try {
  connection = await mysql.createConnection(process.env.DATABASE_URL);
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    console.error("Conexao recusada.");
    console.error("Se DATABASE_URL usa localhost, o teste so funciona dentro do servidor da hospedagem.");
    console.error("Para testar do seu computador, habilite Remote MySQL no Hostinger e use o host remoto no DATABASE_URL.");
    process.exit(1);
  }

  throw error;
}

const [rows] = await connection.query("select database() as database_name, current_user() as db_user");

await connection.end();

const result = rows[0];

console.log("Conexao MySQL OK");
console.log(`Banco: ${result.database_name}`);
console.log(`Usuario: ${result.db_user}`);
