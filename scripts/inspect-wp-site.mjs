import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const prefix = process.env.WP_TABLE_PREFIX ?? "wp_";
const connection = await mysql.createConnection(process.env.WP_DATABASE_URL);
const [options] = await connection.query(
  `select option_name, option_value from ${prefix}options where option_name in ('siteurl', 'home')`,
);
const [sample] = await connection.query(
  `select p.ID, p.guid, pm.meta_value as file
   from ${prefix}posts p
   left join ${prefix}postmeta pm on pm.post_id = p.ID and pm.meta_key = '_wp_attached_file'
   where p.post_type = 'attachment' and p.post_mime_type like 'image/%'
   limit 1`,
);

await connection.end();

console.log(options);
console.log(sample);
