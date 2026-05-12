import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const tables = ["posts", "pages", "products", "categories", "tags", "media", "seo_metadata"];

for (const table of tables) {
  const [rows] = await connection.query(`select count(*) as total from ${table}`);
  console.log(`${table}: ${rows[0].total}`);
}

const [posts] = await connection.query(
  "select title, slug, status, featured_image from posts order by updated_at desc limit 5",
);
const [pages] = await connection.query(
  "select title, slug, status, featured_image from pages order by updated_at desc limit 5",
);

console.log("posts_amostra:", posts);
console.log("pages_amostra:", pages);

await connection.end();
