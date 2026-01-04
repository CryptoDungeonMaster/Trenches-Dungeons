import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://voskmcxmtvophehityoa.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvc2ttY3htdHZvcGhlaGl0eW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MjUwNCwiZXhwIjoyMDc0MTI4NTA0fQ.7EO6wzFNTqmg756sEbbAvsNZ6skD_P6ydAWksxBvzxo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log("🔍 Testing Supabase connection...\n");

  // Test 1: Check td_settings table
  console.log("1. Checking td_settings table...");
  const { data: settings, error: settingsError } = await supabase
    .from("td_settings")
    .select("*");
  
  if (settingsError) {
    console.log("   ❌ Error:", settingsError.message);
    console.log("   Hint:", settingsError.hint || "Table might not exist");
  } else {
    console.log("   ✅ Found", settings?.length || 0, "settings");
    settings?.forEach(s => console.log(`      - ${s.key}: ${s.value}`));
  }

  // Test 2: Check td_sessions table
  console.log("\n2. Checking td_sessions table...");
  const { data: sessions, error: sessionsError } = await supabase
    .from("td_sessions")
    .select("*")
    .limit(1);
  
  if (sessionsError) {
    console.log("   ❌ Error:", sessionsError.message);
    console.log("   Code:", sessionsError.code);
  } else {
    console.log("   ✅ Table exists, found", sessions?.length || 0, "sessions");
  }

  // Test 3: Try inserting a test session
  console.log("\n3. Testing insert into td_sessions...");
  const testId = crypto.randomUUID();
  const { data: newSession, error: insertError } = await supabase
    .from("td_sessions")
    .insert({
      id: testId,
      player: "TEST_PLAYER",
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      entry_sig: `TEST_${testId}`,
      status: "active",
      score: 0,
      seed: "test_seed_12345",
    })
    .select()
    .single();

  if (insertError) {
    console.log("   ❌ Insert failed:", insertError.message);
    console.log("   Code:", insertError.code);
    console.log("   Details:", insertError.details);
  } else {
    console.log("   ✅ Insert successful! Session ID:", newSession?.id);
    
    // Clean up test data
    await supabase.from("td_sessions").delete().eq("id", testId);
    console.log("   🧹 Cleaned up test session");
  }

  console.log("\n✅ Test complete!");
}

testConnection().catch(console.error);
