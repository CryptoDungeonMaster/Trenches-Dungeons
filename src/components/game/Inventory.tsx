"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Item rarities
const RARITY_COLORS = {
  common: { bg: "bg-parchment/20", border: "border-parchment/30", text: "text-parchment" },
  uncommon: { bg: "bg-green-900/30", border: "border-green-500/40", text: "text-green-400" },
  rare: { bg: "bg-blue-900/30", border: "border-blue-500/40", text: "text-blue-400" },
  epic: { bg: "bg-purple-900/30", border: "border-purple-500/40", text: "text-purple-400" },
  legendary: { bg: "bg-gold/20", border: "border-gold/50", text: "text-gold" },
};

type Rarity = keyof typeof RARITY_COLORS;

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  type: "weapon" | "armor" | "accessory" | "consumable";
  stats?: {
    damage?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  equipped?: boolean;
  quantity?: number;
}

// Sample items for demo
const SAMPLE_ITEMS: InventoryItem[] = [
  { id: "1", name: "Rusty Sword", description: "A worn but serviceable blade", icon: "🗡️", rarity: "common", type: "weapon", stats: { damage: 5 } },
  { id: "2", name: "Leather Armor", description: "Basic protection from the trenches", icon: "🛡️", rarity: "common", type: "armor", stats: { defense: 3 }, equipped: true },
  { id: "3", name: "Health Potion", description: "Restores 30 HP", icon: "🧪", rarity: "common", type: "consumable", stats: { health: 30 }, quantity: 3 },
  { id: "4", name: "Mana Crystal", description: "Restores 20 MP", icon: "💎", rarity: "uncommon", type: "consumable", stats: { mana: 20 }, quantity: 2 },
  { id: "5", name: "Steel Longsword", description: "A finely crafted blade", icon: "⚔️", rarity: "rare", type: "weapon", stats: { damage: 12 }, equipped: true },
  { id: "6", name: "Ring of Power", description: "Increases damage output", icon: "💍", rarity: "epic", type: "accessory", stats: { damage: 5 } },
];

interface InventoryProps {
  items?: InventoryItem[];
  gold?: number;
  onUseItem?: (itemId: string) => void;
  onEquipItem?: (itemId: string) => void;
  onSellItem?: (itemId: string) => void;
  onClose?: () => void;
  className?: string;
}

function ItemTooltip({ item }: { item: InventoryItem }) {
  const rarityStyle = RARITY_COLORS[item.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "absolute z-50 left-full ml-2 top-0 p-3 rounded-lg border-2 min-w-[200px]",
        "bg-abyss/95 backdrop-blur shadow-xl",
        rarityStyle.border
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{item.icon}</span>
        <div>
          <p className={cn("font-cinzel font-bold", rarityStyle.text)}>{item.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-parchment/40 font-cinzel">
            {item.rarity} {item.type}
          </p>
        </div>
      </div>

      <p className="font-crimson text-sm text-parchment/60 italic mb-2">{item.description}</p>

      {item.stats && (
        <div className="space-y-1 pt-2 border-t border-parchment/10">
          {item.stats.damage && (
            <p className="text-xs font-cinzel text-gold">+{item.stats.damage} Damage</p>
          )}
          {item.stats.defense && (
            <p className="text-xs font-cinzel text-blue-400">+{item.stats.defense} Defense</p>
          )}
          {item.stats.health && (
            <p className="text-xs font-cinzel text-green-400">+{item.stats.health} Health</p>
          )}
          {item.stats.mana && (
            <p className="text-xs font-cinzel text-mystic-light">+{item.stats.mana} Mana</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function InventorySlot({
  item,
  onUse,
  onEquip,
  onSell,
}: {
  item?: InventoryItem;
  onUse?: () => void;
  onEquip?: () => void;
  onSell?: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showActions, setShowActions] = useState(false);

  if (!item) {
    return (
      <div className="w-14 h-14 rounded-lg bg-abyss/30 border border-parchment/10 flex items-center justify-center">
        <span className="text-parchment/10 text-lg">•</span>
      </div>
    );
  }

  const rarityStyle = RARITY_COLORS[item.rarity];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => {
          setShowTooltip(false);
          setShowActions(false);
        }}
        onClick={() => setShowActions(!showActions)}
        className={cn(
          "w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl relative",
          "transition-all",
          rarityStyle.bg,
          rarityStyle.border,
          item.equipped && "ring-2 ring-gold ring-offset-2 ring-offset-abyss"
        )}
      >
        {item.icon}
        
        {/* Quantity badge */}
        {item.quantity && item.quantity > 1 && (
          <span className="absolute -bottom-1 -right-1 bg-abyss border border-parchment/30 rounded-full w-5 h-5 text-[10px] font-cinzel flex items-center justify-center text-parchment">
            {item.quantity}
          </span>
        )}

        {/* Equipped indicator */}
        {item.equipped && (
          <span className="absolute -top-1 -right-1 bg-gold text-abyss rounded-full w-4 h-4 text-[8px] font-bold flex items-center justify-center">
            E
          </span>
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && <ItemTooltip item={item} />}

      {/* Action menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-40 left-full ml-2 top-0 bg-abyss border border-parchment/20 rounded-lg overflow-hidden shadow-xl"
          >
            {item.type === "consumable" && onUse && (
              <button
                onClick={onUse}
                className="w-full px-3 py-2 text-xs font-cinzel text-green-400 hover:bg-green-900/30 text-left"
              >
                Use
              </button>
            )}
            {(item.type === "weapon" || item.type === "armor" || item.type === "accessory") && onEquip && (
              <button
                onClick={onEquip}
                className="w-full px-3 py-2 text-xs font-cinzel text-gold hover:bg-gold/10 text-left"
              >
                {item.equipped ? "Unequip" : "Equip"}
              </button>
            )}
            {onSell && (
              <button
                onClick={onSell}
                className="w-full px-3 py-2 text-xs font-cinzel text-blood hover:bg-blood/10 text-left"
              >
                Sell
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Inventory({
  items = SAMPLE_ITEMS,
  gold = 150,
  onUseItem,
  onEquipItem,
  onSellItem,
  onClose,
  className,
}: InventoryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "weapon" | "armor" | "consumable">("all");

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter((item) => item.type === activeTab || (activeTab === "armor" && item.type === "accessory"));

  // Create grid with empty slots
  const gridSlots = [...filteredItems];
  while (gridSlots.length < 20) {
    gridSlots.push(undefined as unknown as InventoryItem);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
        "rounded-xl border-2 border-gold/20 shadow-candle-lg",
        "overflow-hidden w-full max-w-md",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cinzel text-xl text-gold font-bold">🎒 Inventory</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">💰</span>
              <span className="font-cinzel text-gold">{gold}</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-abyss/50 border border-parchment/10 flex items-center justify-center text-parchment/60 hover:text-parchment hover:border-parchment/30 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {(["all", "weapon", "armor", "consumable"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-cinzel uppercase tracking-wider transition-all",
                activeTab === tab
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-abyss/50 text-parchment/50 border border-transparent hover:border-parchment/20"
              )}
            >
              {tab === "all" ? "All" : tab === "weapon" ? "⚔️" : tab === "armor" ? "🛡️" : "🧪"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {gridSlots.slice(0, 20).map((item, index) => (
            <InventorySlot
              key={item?.id || `empty-${index}`}
              item={item}
              onUse={item && onUseItem ? () => onUseItem(item.id) : undefined}
              onEquip={item && onEquipItem ? () => onEquipItem(item.id) : undefined}
              onSell={item && onSellItem ? () => onSellItem(item.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="p-4 border-t border-gold/10 bg-abyss/30">
        <p className="text-xs text-parchment/40 font-cinzel mb-2">Equipped Stats</p>
        <div className="flex gap-4 text-sm">
          <span className="text-gold">⚔️ 12</span>
          <span className="text-blue-400">🛡️ 3</span>
          <span className="text-green-400">❤️ 100</span>
        </div>
      </div>
    </motion.div>
  );
}
