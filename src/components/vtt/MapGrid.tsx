"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================
interface Position {
  x: number;
  y: number;
}

interface Tile {
  id: string;
  type: "floor" | "wall" | "door" | "entrance" | "exit" | "trap" | "treasure" | "water" | "lava";
  isExplored: boolean;
  isVisible: boolean;
  decoration?: "bones" | "torch" | "barrel" | "rubble" | "blood" | "moss" | "chains";
}

interface Token {
  id: string;
  type: "player" | "enemy" | "npc" | "loot";
  position: Position;
  icon: string;
  name: string;
  health?: number;
  maxHealth?: number;
  isSelected?: boolean;
}

interface MapGridProps {
  width: number;
  height: number;
  tiles: Tile[][];
  tokens: Token[];
  playerPosition: Position;
  onTileClick?: (pos: Position) => void;
  onTokenClick?: (token: Token) => void;
  onMovePlayer?: (pos: Position) => void;
  showGrid?: boolean;
  fogOfWar?: boolean;
  tileSize?: number;
  className?: string;
}

// ============================================
// TILE STYLES
// ============================================
const TILE_STYLES: Record<string, { bg: string; border: string }> = {
  floor: { bg: "bg-gradient-to-br from-trench-mud/80 to-abyss-light", border: "border-trench-mud/30" },
  wall: { bg: "bg-gradient-to-br from-trench-stone to-abyss", border: "border-trench-metal/50" },
  door: { bg: "bg-gradient-to-br from-trench-rust to-trench-mud", border: "border-gold/40" },
  entrance: { bg: "bg-gradient-to-br from-green-900/60 to-trench-mud", border: "border-green-500/30" },
  exit: { bg: "bg-gradient-to-br from-gold/30 to-trench-mud", border: "border-gold/50" },
  trap: { bg: "bg-gradient-to-br from-blood-dark/30 to-trench-mud", border: "border-blood/20" },
  treasure: { bg: "bg-gradient-to-br from-gold/20 to-trench-mud", border: "border-gold/30" },
  water: { bg: "bg-gradient-to-br from-blue-900/60 to-blue-950/80", border: "border-blue-400/20" },
  lava: { bg: "bg-gradient-to-br from-orange-600/40 to-red-900/60", border: "border-orange-500/30" },
};

const DECORATION_ICONS: Record<string, string> = {
  bones: "🦴",
  torch: "🔥",
  barrel: "🛢️",
  rubble: "🪨",
  blood: "🩸",
  moss: "🌿",
  chains: "⛓️",
};

// ============================================
// TILE COMPONENT
// ============================================
function MapTile({
  tile,
  position,
  isPlayerAdjacent,
  isSelected,
  onClick,
  tileSize,
  fogOfWar,
}: {
  tile: Tile;
  position: Position;
  isPlayerAdjacent: boolean;
  isSelected: boolean;
  onClick: () => void;
  tileSize: number;
  fogOfWar: boolean;
}) {
  const style = TILE_STYLES[tile.type] || TILE_STYLES.floor;
  const isHidden = fogOfWar && !tile.isExplored;
  const isDim = fogOfWar && tile.isExplored && !tile.isVisible;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isHidden ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "relative border transition-all duration-200 cursor-pointer",
        style.bg,
        style.border,
        isPlayerAdjacent && tile.type !== "wall" && "ring-1 ring-gold/30 hover:ring-gold/60",
        isSelected && "ring-2 ring-gold",
        isDim && "opacity-50",
        isHidden && "bg-abyss border-abyss pointer-events-none"
      )}
      style={{ width: tileSize, height: tileSize }}
      whileHover={tile.type !== "wall" && isPlayerAdjacent ? { scale: 1.05 } : {}}
      whileTap={tile.type !== "wall" && isPlayerAdjacent ? { scale: 0.95 } : {}}
    >
      {/* Tile texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {tile.type === "floor" && (
          <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        )}
      </div>

      {/* Decoration */}
      {tile.decoration && !isHidden && (
        <div className="absolute inset-0 flex items-center justify-center text-xs opacity-60">
          {DECORATION_ICONS[tile.decoration]}
        </div>
      )}

      {/* Special tile indicators */}
      {tile.type === "door" && !isHidden && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[60%] h-[80%] bg-trench-rust/60 rounded-t border-2 border-trench-metal/50" />
        </div>
      )}

      {tile.type === "trap" && !isHidden && tile.isVisible && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center text-blood text-xs"
        >
          ⚠️
        </motion.div>
      )}

      {tile.type === "treasure" && !isHidden && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center text-gold text-sm"
        >
          💰
        </motion.div>
      )}

      {tile.type === "entrance" && !isHidden && (
        <div className="absolute inset-0 flex items-center justify-center text-green-400 text-xs">↑</div>
      )}

      {tile.type === "exit" && !isHidden && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center text-gold text-sm"
        >
          🚪
        </motion.div>
      )}

      {/* Grid coordinates (debug) */}
      {/* <div className="absolute bottom-0 right-0 text-[6px] text-white/20">{position.x},{position.y}</div> */}
    </motion.div>
  );
}

// ============================================
// TOKEN COMPONENT
// ============================================
function TokenSprite({
  token,
  tileSize,
  onClick,
}: {
  token: Token;
  tileSize: number;
  onClick: () => void;
}) {
  const colors = {
    player: "from-gold to-gold-dark ring-gold/50",
    enemy: "from-blood to-blood-dark ring-blood/50",
    npc: "from-green-500 to-green-700 ring-green-500/50",
    loot: "from-gold-pale to-gold ring-gold/30",
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      layoutId={token.id}
      onClick={onClick}
      className={cn(
        "absolute rounded-full cursor-pointer transition-all",
        "flex items-center justify-center",
        "bg-gradient-to-br shadow-lg",
        token.isSelected && "ring-2",
        colors[token.type]
      )}
      style={{
        width: tileSize * 0.8,
        height: tileSize * 0.8,
        left: token.position.x * tileSize + tileSize * 0.1,
        top: token.position.y * tileSize + tileSize * 0.1,
      }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon */}
      <span className="text-lg select-none" style={{ fontSize: tileSize * 0.4 }}>
        {token.icon}
      </span>

      {/* Health bar for enemies */}
      {token.type === "enemy" && token.health !== undefined && token.maxHealth !== undefined && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[90%] h-1 bg-abyss/80 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${(token.health / token.maxHealth) * 100}%` }}
            className={cn(
              "h-full rounded-full",
              token.health / token.maxHealth > 0.5 ? "bg-green-500" : 
              token.health / token.maxHealth > 0.25 ? "bg-yellow-500" : "bg-blood"
            )}
          />
        </div>
      )}

      {/* Selection indicator */}
      {token.isSelected && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-4px] border-2 border-dashed border-gold/60 rounded-full"
        />
      )}
    </motion.div>
  );
}

// ============================================
// FOG OF WAR OVERLAY
// ============================================
function FogOverlay({
  width,
  height,
  tiles,
  tileSize,
}: {
  width: number;
  height: number;
  tiles: Tile[][];
  tileSize: number;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {tiles.map((row, y) =>
        row.map((tile, x) => {
          if (tile.isVisible) return null;
          
          return (
            <motion.div
              key={`fog-${x}-${y}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: tile.isExplored ? 0.6 : 1 }}
              className="absolute bg-abyss"
              style={{
                width: tileSize,
                height: tileSize,
                left: x * tileSize,
                top: y * tileSize,
              }}
            />
          );
        })
      )}
    </div>
  );
}

// ============================================
// MAIN MAP GRID COMPONENT
// ============================================
export default function MapGrid({
  width,
  height,
  tiles,
  tokens,
  playerPosition,
  onTileClick,
  onTokenClick,
  onMovePlayer,
  showGrid = true,
  fogOfWar = true,
  tileSize = 48,
  className,
}: MapGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate if a tile is adjacent to player
  const isAdjacent = useCallback((pos: Position) => {
    const dx = Math.abs(pos.x - playerPosition.x);
    const dy = Math.abs(pos.y - playerPosition.y);
    return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
  }, [playerPosition]);

  // Handle tile click
  const handleTileClick = (pos: Position) => {
    const tile = tiles[pos.y]?.[pos.x];
    if (!tile || tile.type === "wall") return;

    setSelectedTile(pos);
    onTileClick?.(pos);

    // If adjacent and walkable, move player
    if (isAdjacent(pos) && onMovePlayer) {
      onMovePlayer(pos);
    }
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) { // Middle or right click
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Center view on player
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const playerX = playerPosition.x * tileSize + tileSize / 2;
      const playerY = playerPosition.y * tileSize + tileSize / 2;
      
      setViewOffset({
        x: containerWidth / 2 - playerX,
        y: containerHeight / 2 - playerY,
      });
    }
  }, [playerPosition, tileSize]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg border-2 border-trench-metal/30",
        "bg-abyss shadow-inset-lg",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Map viewport */}
      <motion.div
        animate={{ x: viewOffset.x, y: viewOffset.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative"
        style={{
          width: width * tileSize,
          height: height * tileSize,
        }}
      >
        {/* Grid background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(184, 134, 11, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(184, 134, 11, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: `${tileSize}px ${tileSize}px`,
            }}
          />
        )}

        {/* Tiles */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${width}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${height}, ${tileSize}px)`,
          }}
        >
          {tiles.map((row, y) =>
            row.map((tile, x) => (
              <MapTile
                key={tile.id}
                tile={tile}
                position={{ x, y }}
                isPlayerAdjacent={isAdjacent({ x, y })}
                isSelected={selectedTile?.x === x && selectedTile?.y === y}
                onClick={() => handleTileClick({ x, y })}
                tileSize={tileSize}
                fogOfWar={fogOfWar}
              />
            ))
          )}
        </div>

        {/* Tokens layer */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {tokens.map((token) => (
              <div key={token.id} className="pointer-events-auto">
                <TokenSprite
                  token={token}
                  tileSize={tileSize}
                  onClick={() => onTokenClick?.(token)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Fog of war layer */}
        {fogOfWar && (
          <FogOverlay width={width} height={height} tiles={tiles} tileSize={tileSize} />
        )}

        {/* Ambient effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Torch light around player */}
          <motion.div
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute rounded-full bg-gold/20 blur-2xl"
            style={{
              width: tileSize * 5,
              height: tileSize * 5,
              left: playerPosition.x * tileSize - tileSize * 2,
              top: playerPosition.y * tileSize - tileSize * 2,
            }}
          />
        </div>
      </motion.div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Controls hint */}
      <div className="absolute bottom-2 right-2 text-xs text-parchment/30 font-cinzel">
        Click adjacent tiles to move
      </div>
    </div>
  );
}
