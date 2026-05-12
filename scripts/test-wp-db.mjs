import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

if (!process.env.WP_DATABASE_URL) {
  throw new Error("WP_DATABASE_URL nao configurado no .env");
}

const prefix = process.env.WP_TABLE_PREFIX ?? "wp_";
const connection = await mysql.createConnection(process.env.WP_DATABASE_URL);

const [rows] = await connection.query(
  `select post_type, post_status, count(*) as total
   from ${prefix}posts
   where post_type in ('post', 'page', 'product', 'attachment')
   group by post_type, post_status
   order by post_type, post_status`,
);

await connection.end();

console.log("Conexao WordPress OK");

for (const row of rows) {
  console.log(`${row.post_type}/${row.post_status}: ${row.total}`);
}
