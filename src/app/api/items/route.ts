import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { TABLES } from "@/lib/db-tables";

// GET /api/items - Get all item definitions (for shop, loot tables, etc.)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // weapon, armor, consumable, etc.
    const rarity = searchParams.get("rarity"); // common, uncommon, rare, epic, legendary
    const maxLevel = searchParams.get("maxLevel");

    const supabase = createServiceRoleSupabaseClient();

    let query = supabase.from(TABLES.itemDefinitions).select("*");

    if (type) {
      query = query.eq("item_type", type);
    }

    if (rarity) {
      query = query.eq("rarity", rarity);
    }

    if (maxLevel) {
      query = query.lte("required_level", parseInt(maxLevel, 10));
    }

    const { data, error } = await query.order("required_level", { ascending: true });

    if (error) {
      console.error("Items fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (error: unknown) {
    console.error("Items error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
