import { readFile } from "node:fs/promises";
import { v7 as uuidv7 } from "uuid";
import { sql, initSchema } from "../src/utils/db.js";
import type { ProfileData } from "../src/types/api.js";

type SeedProfile = Omit<ProfileData, "id" | "created_at">;

interface SeedFile {
  profiles: SeedProfile[];
}

const path = new URL("../data/seed_profiles.json", import.meta.url);
const raw = await readFile(path, "utf8");
const { profiles } = JSON.parse(raw) as SeedFile;

await initSchema();

const before = await sql<{ count: string }[]>`SELECT count(*)::text AS count FROM profiles`;

for (const p of profiles) {
  await sql`
    INSERT INTO profiles (
      id, name, gender, gender_probability,
      age, age_group, country_id, country_name, country_probability
    ) VALUES (
      ${uuidv7()}, ${p.name.toLowerCase()}, ${p.gender}, ${p.gender_probability},
      ${p.age}, ${p.age_group}, ${p.country_id}, ${p.country_name}, ${p.country_probability}
    )
    ON CONFLICT (name) DO NOTHING
  `;
}

const after = await sql<{ count: string }[]>`SELECT count(*)::text AS count FROM profiles`;

const inserted = Number(after[0].count) - Number(before[0].count);
const skipped = profiles.length - inserted;

console.log(`Seed complete. Inserted: ${inserted}, Skipped: ${skipped}, Total rows: ${after[0].count}`);

await sql.end();
