import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [result] = await connection.query(
  "delete from posts where status = 'DRAFT' and trim(coalesce(title, '')) = '' and trim(coalesce(content, '')) = ''",
);

await connection.end();

console.log(`Rascunhos vazios removidos: ${result.affectedRows}`);
