import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function migrate() {
  const existing = await sql`
    SELECT column_name::text FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name IN ('plan_type', 'polar_customer_id', 'polar_subscription_id', 'plan_expires_at')
  `;
  const cols = existing.map((r) => r.column_name);
  console.log("Existing columns:", cols);

  if (!cols.includes("plan_type")) {
    await sql`ALTER TABLE profiles ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'free'`;
    console.log("Added: plan_type");
  } else {
    console.log("Skipped: plan_type (already exists)");
  }

  if (!cols.includes("polar_customer_id")) {
    await sql`ALTER TABLE profiles ADD COLUMN polar_customer_id TEXT`;
    console.log("Added: polar_customer_id");
  } else {
    console.log("Skipped: polar_customer_id (already exists)");
  }

  if (!cols.includes("polar_subscription_id")) {
    await sql`ALTER TABLE profiles ADD COLUMN polar_subscription_id TEXT`;
    console.log("Added: polar_subscription_id");
  } else {
    console.log("Skipped: polar_subscription_id (already exists)");
  }

  if (!cols.includes("plan_expires_at")) {
    await sql`ALTER TABLE profiles ADD COLUMN plan_expires_at TIMESTAMPTZ`;
    console.log("Added: plan_expires_at");
  } else {
    console.log("Skipped: plan_expires_at (already exists)");
  }

  console.log("\nMigration complete!");
  await sql.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
