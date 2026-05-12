import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [media] = await connection.query(
  `select title, url
   from media
   where lower(title) like '%cachoeira%'
      or lower(title) like '%chapada%'
      or lower(title) like '%macaco%'
      or lower(title) like '%logo%'
      or lower(title) like '%vale%'
   order by id desc
   limit 30`,
);
const [pages] = await connection.query(
  `select title, slug
   from pages
   where status = 'PUBLISHED'
   order by updated_at desc
   limit 20`,
);

await connection.end();

console.log("MEDIA");
console.log(JSON.stringify(media, null, 2));
console.log("PAGES");
console.log(JSON.stringify(pages, null, 2));
