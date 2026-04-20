import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = postgres(DATABASE_URL, {
  ssl: "require",
  prepare: false,
  onnotice: () => {},
});

export async function initSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id                   TEXT PRIMARY KEY,
      name                 VARCHAR NOT NULL UNIQUE,
      gender               VARCHAR NOT NULL,
      gender_probability   DOUBLE PRECISION NOT NULL,
      age                  INTEGER NOT NULL,
      age_group            VARCHAR NOT NULL,
      country_id           VARCHAR(2) NOT NULL,
      country_name         VARCHAR NOT NULL,
      country_probability  DOUBLE PRECISION NOT NULL,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await Promise.all([
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles (gender)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles (age)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_age_group ON profiles (age_group)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_country_id ON profiles (country_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles (created_at)`,
  ]);
}
