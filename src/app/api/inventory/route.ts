import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { TABLES } from "@/lib/db-tables";

// GET /api/inventory - Get player's inventory
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerAddress = searchParams.get("player");

    if (!playerAddress) {
      return NextResponse.json({ error: "Player address required" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();

    // Fetch inventory with item details
    const { data, error } = await supabase
      .from(TABLES.playerInventory)
      .select(`
        id,
        quantity,
        equipped_slot,
        acquired_at,
        item:td_item_definitions (
          id,
          name,
          description,
          item_type,
          rarity,
          icon,
          stat_health,
          stat_max_health,
          stat_damage,
          stat_defense,
          stat_speed,
          stat_crit_chance,
          effect_type,
          effect_value,
          effect_duration,
          required_level,
          required_class,
          sell_price
        )
      `)
      .eq("player_address", playerAddress);

    if (error) {
      console.error("Inventory fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }

    // Separate equipped items and inventory
    const equipped: Record<string, unknown> = {};
    const inventory: unknown[] = [];

    data.forEach((entry) => {
      if (entry.equipped_slot) {
        equipped[entry.equipped_slot] = entry;
      } else {
        inventory.push(entry);
      }
    });

    return NextResponse.json({ equipped, inventory });
  } catch (error: unknown) {
    console.error("Inventory error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/inventory - Add item to inventory (e.g., from loot)
const addItemSchema = z.object({
  playerAddress: z.string().min(32).max(44),
  itemId: z.string(),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = addItemSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { playerAddress, itemId, quantity } = parseResult.data;
    const supabase = createServiceRoleSupabaseClient();

    // Check if item exists
    const { data: itemDef, error: itemError } = await supabase
      .from(TABLES.itemDefinitions)
      .select("id, stackable, max_stack")
      .eq("id", itemId)
      .single();

    if (itemError || !itemDef) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if player already has this item (for stacking)
    const { data: existing } = await supabase
      .from(TABLES.playerInventory)
      .select("id, quantity")
      .eq("player_address", playerAddress)
      .eq("item_id", itemId)
      .is("equipped_slot", null)
      .single();

    if (existing && itemDef.stackable) {
      // Update quantity (up to max stack)
      const newQuantity = Math.min(existing.quantity + quantity, itemDef.max_stack);
      
      const { error: updateError } = await supabase
        .from(TABLES.playerInventory)
        .update({ quantity: newQuantity })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
      }

      return NextResponse.json({ message: "Item stacked", quantity: newQuantity });
    }

    // Insert new inventory entry
    const { error: insertError } = await supabase.from(TABLES.playerInventory).insert({
      player_address: playerAddress,
      item_id: itemId,
      quantity: itemDef.stackable ? quantity : 1,
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
    }

    return NextResponse.json({ message: "Item added" });
  } catch (error: unknown) {
    console.error("Add item error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/inventory - Equip/unequip item
const equipSchema = z.object({
  playerAddress: z.string().min(32).max(44),
  inventoryId: z.string().uuid(),
  action: z.enum(["equip", "unequip"]),
  slot: z.enum(["weapon", "armor", "helmet", "boots", "accessory"]).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = equipSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { playerAddress, inventoryId, action, slot } = parseResult.data;
    const supabase = createServiceRoleSupabaseClient();

    // Get the inventory item
    const { data: invItem, error: invError } = await supabase
      .from(TABLES.playerInventory)
      .select(`
        *,
        item:td_item_definitions (item_type)
      `)
      .eq("id", inventoryId)
      .eq("player_address", playerAddress)
      .single();

    if (invError || !invItem) {
      return NextResponse.json({ error: "Item not found in inventory" }, { status: 404 });
    }

    if (action === "equip") {
      const itemType = invItem.item?.item_type;
      const targetSlot = slot || itemType;

      if (!targetSlot || itemType === "consumable") {
        return NextResponse.json({ error: "Cannot equip this item type" }, { status: 400 });
      }

      // Unequip any existing item in that slot
      await supabase
        .from(TABLES.playerInventory)
        .update({ equipped_slot: null })
        .eq("player_address", playerAddress)
        .eq("equipped_slot", targetSlot);

      // Equip the new item
      const { error: equipError } = await supabase
        .from(TABLES.playerInventory)
        .update({ equipped_slot: targetSlot })
        .eq("id", inventoryId);

      if (equipError) {
        return NextResponse.json({ error: "Failed to equip item" }, { status: 500 });
      }

      return NextResponse.json({ message: "Item equipped", slot: targetSlot });
    } else {
      // Unequip
      const { error: unequipError } = await supabase
        .from(TABLES.playerInventory)
        .update({ equipped_slot: null })
        .eq("id", inventoryId);

      if (unequipError) {
        return NextResponse.json({ error: "Failed to unequip item" }, { status: 500 });
      }

      return NextResponse.json({ message: "Item unequipped" });
    }
  } catch (error: unknown) {
    console.error("Equip error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/inventory - Sell or discard item
const removeSchema = z.object({
  playerAddress: z.string().min(32).max(44),
  inventoryId: z.string().uuid(),
  action: z.enum(["sell", "discard"]),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = removeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { playerAddress, inventoryId, action } = parseResult.data;
    const supabase = createServiceRoleSupabaseClient();

    // Get the item with its sell price
    const { data: invItem, error: invError } = await supabase
      .from(TABLES.playerInventory)
      .select(`
        *,
        item:td_item_definitions (sell_price)
      `)
      .eq("id", inventoryId)
      .eq("player_address", playerAddress)
      .single();

    if (invError || !invItem) {
      return NextResponse.json({ error: "Item not found in inventory" }, { status: 404 });
    }

    // Cannot sell/discard equipped items
    if (invItem.equipped_slot) {
      return NextResponse.json({ error: "Unequip item first" }, { status: 400 });
    }

    // Delete from inventory
    const { error: deleteError } = await supabase
      .from(TABLES.playerInventory)
      .delete()
      .eq("id", inventoryId);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
    }

    const goldEarned = action === "sell" ? (invItem.item?.sell_price || 0) * invItem.quantity : 0;

    return NextResponse.json({
      message: action === "sell" ? "Item sold" : "Item discarded",
      goldEarned,
    });
  } catch (error: unknown) {
    console.error("Remove item error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
