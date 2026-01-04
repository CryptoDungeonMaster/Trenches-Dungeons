"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import ToggleDial from "@/components/ui/ToggleDial";
import TorchFlicker from "@/components/effects/TorchFlicker";
import NoiseOverlay from "@/components/effects/NoiseOverlay";
import { pageFadeThrough, staggerContainer, staggerItem } from "@/lib/motion";

// Mock settings
interface Settings {
  entryCost: number;
  rewardMultiplier: number;
  combatWeight: number;
  trapWeight: number;
  treasureWeight: number;
  restWeight: number;
  hardMode: boolean;
  permaDeath: boolean;
}

// Brass dial slider component
function BrassDial({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="font-cinzel text-sm text-parchment/80">{label}</label>
        <span className="font-cinzel text-gold">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        {/* Track */}
        <div className="h-3 bg-gradient-to-b from-trench-metal to-[#2a2a2a] rounded-full border border-[#4a4a4a] shadow-inset">
          {/* Fill */}
          <div
            className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-gold-pale to-gold-dark border-2 border-gold shadow-lg pointer-events-none transition-all"
          style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 10px)` }}
        >
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

// Stamped document panel
function DocumentPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel variant="parchment" className="relative p-6">
      {/* Stamp effect */}
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 border-blood/30 flex items-center justify-center rotate-[-15deg]">
        <span className="font-cinzel text-xs text-blood/30 uppercase">Official</span>
      </div>
      
      {/* Paper clip effect */}
      <div className="absolute -top-2 left-8 w-4 h-8 bg-gradient-to-b from-trench-metal to-trench-stone rounded-t-full shadow-md" />
      
      <h3 className="font-cinzel text-lg text-blood-dark mb-4 border-b border-trench-mud/30 pb-2">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </Panel>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    entryCost: 100,
    rewardMultiplier: 1.5,
    combatWeight: 40,
    trapWeight: 15,
    treasureWeight: 25,
    restWeight: 20,
    hardMode: false,
    permaDeath: false,
  });
  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Mock save
    console.log("Saving settings:", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.main
      variants={pageFadeThrough}
      initial="initial"
      animate="animate"
      className="relative min-h-screen overflow-hidden"
    >
      {/* War table background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a2420] via-trench-mud to-[#1a1510]" />
      
      {/* Map texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 51px)
          `,
        }}
      />

      {/* Effects */}
      <TorchFlicker position="top-left" size="md" color="gold" />
      <TorchFlicker position="top-right" size="md" color="gold" />
      <NoiseOverlay opacity={0.04} />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-6 border-b border-trench-mud/50"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-gold">
              Commander&apos;s War Table
            </h1>
            <p className="font-crimson text-parchment/60 mt-1">
              Configure the trenches to your will
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            ← Return to Camp
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Entry & Rewards */}
        <motion.div variants={staggerItem}>
          <DocumentPanel title="Entry & Rewards">
            <BrassDial
              label="Entry Cost"
              value={settings.entryCost}
              min={10}
              max={1000}
              step={10}
              unit=" TND"
              onChange={(v) => updateSetting("entryCost", v)}
            />
            <BrassDial
              label="Reward Multiplier"
              value={settings.rewardMultiplier}
              min={0.5}
              max={5}
              step={0.1}
              unit="x"
              onChange={(v) => updateSetting("rewardMultiplier", v)}
            />
          </DocumentPanel>
        </motion.div>

        {/* Encounter Weights */}
        <motion.div variants={staggerItem}>
          <DocumentPanel title="Encounter Distribution">
            <BrassDial
              label="Combat Encounters"
              value={settings.combatWeight}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateSetting("combatWeight", v)}
            />
            <BrassDial
              label="Trap Encounters"
              value={settings.trapWeight}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateSetting("trapWeight", v)}
            />
            <BrassDial
              label="Treasure Encounters"
              value={settings.treasureWeight}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateSetting("treasureWeight", v)}
            />
            <BrassDial
              label="Rest Encounters"
              value={settings.restWeight}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateSetting("restWeight", v)}
            />
            
            {/* Weight total indicator */}
            <div className="pt-2 border-t border-trench-mud/20">
              <div className="flex justify-between text-sm">
                <span className="text-abyss/60">Total Weight</span>
                <span className={
                  settings.combatWeight + settings.trapWeight + settings.treasureWeight + settings.restWeight === 100
                    ? "text-green-800"
                    : "text-blood"
                }>
                  {settings.combatWeight + settings.trapWeight + settings.treasureWeight + settings.restWeight}%
                </span>
              </div>
            </div>
          </DocumentPanel>
        </motion.div>

        {/* Game Modes */}
        <motion.div variants={staggerItem}>
          <DocumentPanel title="Game Modifiers">
            <div className="space-y-4">
              <ToggleDial
                label="Hard Mode (Increased enemy damage)"
                checked={settings.hardMode}
                onChange={(v) => updateSetting("hardMode", v)}
              />
              <ToggleDial
                label="Permadeath (No session save)"
                checked={settings.permaDeath}
                onChange={(v) => updateSetting("permaDeath", v)}
              />
            </div>
          </DocumentPanel>
        </motion.div>

        {/* Treasury Info */}
        <motion.div variants={staggerItem}>
          <Panel variant="metal" className="p-6">
            <h3 className="font-cinzel text-lg text-gold mb-4">Treasury Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-parchment/70">Total Entries</span>
                <span className="font-cinzel text-parchment">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-parchment/70">Tokens Collected</span>
                <span className="font-cinzel text-gold">124,700 TND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-parchment/70">Rewards Paid</span>
                <span className="font-cinzel text-blood">87,290 TND</span>
              </div>
              <div className="flex justify-between border-t border-parchment/20 pt-2">
                <span className="text-parchment/70">Net Balance</span>
                <span className="font-cinzel text-gold font-bold">37,410 TND</span>
              </div>
            </div>
          </Panel>
        </motion.div>
      </motion.div>

      {/* Save button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 fixed bottom-6 right-6"
      >
        <Button variant="gold" onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </Button>
      </motion.div>

      {/* Pinned notes decoration */}
      <div className="absolute top-32 right-8 transform rotate-3 opacity-60 pointer-events-none hidden lg:block">
        <div className="w-32 h-40 bg-parchment/90 p-3 shadow-lg">
          <div className="w-4 h-4 rounded-full bg-blood absolute -top-2 left-1/2 -translate-x-1/2 shadow" />
          <p className="font-crimson text-xs text-abyss/70 leading-tight">
            Remember: Balance is key. Too many traps discourage return players.
          </p>
        </div>
      </div>

      <div className="absolute bottom-32 left-8 transform -rotate-2 opacity-60 pointer-events-none hidden lg:block">
        <div className="w-28 h-28 bg-parchment-dark/90 p-3 shadow-lg">
          <div className="w-4 h-4 rounded-full bg-blood absolute -top-2 left-1/2 -translate-x-1/2 shadow" />
          <p className="font-crimson text-xs text-abyss/70 leading-tight">
            Weekly rewards reset every Monday at 00:00 UTC
          </p>
        </div>
      </div>
    </motion.main>
  );
}
