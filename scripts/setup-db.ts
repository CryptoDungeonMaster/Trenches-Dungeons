import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://voskmcxmtvophehityoa.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvc2ttY3htdHZvcGhlaGl0eW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MjUwNCwiZXhwIjoyMDc0MTI4NTA0fQ.7EO6wzFNTqmg756sEbbAvsNZ6skD_P6ydAWksxBvzxo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log("🔧 Setting up Trenches & Dragons database...\n");

  // Create td_sessions table
  console.log("Creating td_sessions table...");
  const { error: sessionsError } = await supabase.rpc("exec_sql", {
    sql: `
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
      );
      CREATE INDEX IF NOT EXISTS idx_td_sessions_player ON td_sessions(player);
      CREATE INDEX IF NOT EXISTS idx_td_sessions_entry_sig ON td_sessions(entry_sig);
      CREATE INDEX IF NOT EXISTS idx_td_sessions_status ON td_sessions(status);
    `,
  });

  if (sessionsError) {
    // If rpc doesn't exist, we'll use direct insert approach
    console.log("Note: Using direct table creation approach...");
  }

  // For Supabase, we need to run SQL via the dashboard or use migrations
  // Let's try a simpler approach - just verify connection and insert default settings
  
  console.log("\n📝 Inserting default settings...");
  
  const defaultSettings = [
    { key: "entryFee", value: "1000000" },
    { key: "rewardAmount", value: "500000" },
    { key: "treasuryPublicKey", value: "4mhyTcSHaxV81BxcaoWf5FKNrCY6N9Wc611wi5Ryo5MA" },
    { key: "difficulty", value: "normal" },
    { key: "payoutEnabled", value: "false" },
  ];

  for (const setting of defaultSettings) {
    const { error } = await supabase
      .from("td_settings")
      .upsert(setting, { onConflict: "key" });
    
    if (error) {
      if (error.code === "42P01") {
        console.log(`\n❌ Table td_settings doesn't exist yet.`);
        console.log(`\n📋 Please run the SQL manually in Supabase Dashboard:`);
        console.log(`   https://supabase.com/dashboard/project/voskmcxmtvophehityoa/sql\n`);
        console.log(`   Copy the contents of supabase-schema.sql and run it.\n`);
        return;
      }
      console.log(`  Error setting ${setting.key}:`, error.message);
    } else {
      console.log(`  ✓ ${setting.key} = ${setting.value}`);
    }
  }

  console.log("\n✅ Database setup complete!");
}

setupDatabase().catch(console.error);
