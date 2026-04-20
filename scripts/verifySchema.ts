import { sql, initSchema } from "../src/utils/db.js";

await initSchema();

const columns = await sql`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  ORDER BY ordinal_position
`;

const indexes = await sql`
  SELECT indexname FROM pg_indexes WHERE tablename = 'profiles' ORDER BY indexname
`;

console.log("Columns:");
console.table(columns);
console.log("Indexes:");
console.table(indexes);

await sql.end();
