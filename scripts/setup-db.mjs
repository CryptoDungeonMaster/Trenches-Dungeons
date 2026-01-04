import postgres from 'postgres';

// Supabase database connection
// You need to get the password from Supabase Dashboard > Settings > Database
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.voskmcxmtvophehityoa.supabase.co:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
});

async function setupDatabase() {
  console.log("🔧 Setting up Trenches & Dragons database...\n");

  try {
    // Create td_sessions table
    console.log("📦 Creating td_sessions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS td_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        entry_sig TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'claimed')),
        score INTEGER DEFAULT 0,
        seed TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("   ✓ td_sessions created");

    // Create indexes for td_sessions
    console.log("   Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS idx_td_sessions_player ON td_sessions(player)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_td_sessions_entry_sig ON td_sessions(entry_sig)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_td_sessions_status ON td_sessions(status)`;
    console.log("   ✓ Indexes created");

    // Create td_claims table
    console.log("\n📦 Creating td_claims table...");
    await sql`
      CREATE TABLE IF NOT EXISTS td_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player TEXT NOT NULL,
        session_id UUID NOT NULL REFERENCES td_sessions(id),
        claim_sig TEXT,
        amount DECIMAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("   ✓ td_claims created");

    // Create indexes for td_claims
    console.log("   Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS idx_td_claims_player ON td_claims(player)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_td_claims_session_id ON td_claims(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_td_claims_status ON td_claims(status)`;
    console.log("   ✓ Indexes created");

    // Create td_settings table
    console.log("\n📦 Creating td_settings table...");
    await sql`
      CREATE TABLE IF NOT EXISTS td_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("   ✓ td_settings created");

    // Create td_used_signatures table
    console.log("\n📦 Creating td_used_signatures table...");
    await sql`
      CREATE TABLE IF NOT EXISTS td_used_signatures (
        signature TEXT PRIMARY KEY,
        used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        player TEXT NOT NULL
      )
    `;
    console.log("   ✓ td_used_signatures created");

    // Create index
    await sql`CREATE INDEX IF NOT EXISTS idx_td_used_signatures_player ON td_used_signatures(player)`;
    console.log("   ✓ Index created");

    // Insert default settings
    console.log("\n📝 Inserting default settings...");
    
    const defaultSettings = [
      { key: "entryFee", value: "1000000" },
      { key: "rewardAmount", value: "500000" },
      { key: "treasuryPublicKey", value: "4mhyTcSHaxV81BxcaoWf5FKNrCY6N9Wc611wi5Ryo5MA" },
      { key: "difficulty", value: "normal" },
      { key: "payoutEnabled", value: "false" },
    ];

    for (const setting of defaultSettings) {
      await sql`
        INSERT INTO td_settings (key, value)
        VALUES (${setting.key}, ${setting.value})
        ON CONFLICT (key) DO NOTHING
      `;
      console.log(`   ✓ ${setting.key} = ${setting.value}`);
    }

    console.log("\n✅ Database setup complete!");
    console.log("\n📊 Tables created:");
    console.log("   - td_sessions");
    console.log("   - td_claims");
    console.log("   - td_settings");
    console.log("   - td_used_signatures");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("password")) {
      console.log("\n💡 Tip: Check that the database password is correct.");
    }
  } finally {
    await sql.end();
  }
}

setupDatabase();
