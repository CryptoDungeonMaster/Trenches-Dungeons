"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CharacterClass } from "@/types/game";
import { CLASSES, CLASS_LIST } from "@/data/classes";
import Button from "@/components/ui/Button";

interface ClassSelectorProps {
  onSelect: (characterClass: CharacterClass, name: string) => void;
  onCancel?: () => void;
  className?: string;
}

function ClassCard({
  classData,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  classData: typeof CLASSES.warrior;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "relative flex flex-col items-center p-6 rounded-xl",
        "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
        "border-2 transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-gold/50",
        isSelected
          ? "border-gold shadow-candle-lg"
          : isHovered
          ? "border-gold/50 shadow-candle"
          : "border-parchment/10 hover:border-parchment/30"
      )}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${classData.color}20, transparent, ${classData.color}10)`
          : undefined,
      }}
    >
      {/* Glow effect */}
      <motion.div
        animate={{ opacity: isSelected ? 0.3 : isHovered ? 0.15 : 0 }}
        className="absolute inset-0 rounded-xl blur-xl"
        style={{ background: classData.color }}
      />

      {/* Icon */}
      <motion.div
        animate={{
          scale: isSelected ? 1.1 : 1,
          rotate: isHovered ? [0, -5, 5, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
        className="relative w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-4"
        style={{
          background: `linear-gradient(135deg, ${classData.color}40, ${classData.color}20)`,
          boxShadow: isSelected ? `0 0 30px ${classData.color}40` : "none",
        }}
      >
        {classData.icon}

        {/* Selection ring */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-[-4px] rounded-full border-2 border-gold"
          />
        )}
      </motion.div>

      {/* Name */}
      <h3
        className={cn(
          "font-cinzel text-xl font-bold mb-2 transition-colors",
          isSelected ? "text-gold" : "text-parchment"
        )}
      >
        {classData.name}
      </h3>

      {/* Description */}
      <p className="font-crimson text-sm text-parchment/60 text-center mb-4 h-12 line-clamp-2">
        {classData.description}
      </p>

      {/* Stats preview */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs w-full">
        {Object.entries(classData.baseStats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between">
            <span className="text-parchment/40 uppercase">{stat}</span>
            <span className="text-gold font-cinzel font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* Skills preview */}
      <div className="flex gap-1 mt-4">
        {classData.skills.map((skill) => (
          <div
            key={skill.id}
            className="w-8 h-8 rounded flex items-center justify-center bg-abyss/50 border border-parchment/10 text-sm"
            title={skill.name}
          >
            {skill.icon}
          </div>
        ))}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center"
        >
          <span className="text-abyss text-lg">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}

export default function ClassSelector({ onSelect, onCancel, className }: ClassSelectorProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [hoveredClass, setHoveredClass] = useState<CharacterClass | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [step, setStep] = useState<"class" | "name">("class");

  const handleConfirm = () => {
    if (selectedClass && characterName.trim()) {
      onSelect(selectedClass, characterName.trim());
    }
  };

  const activeClass = hoveredClass || selectedClass;
  const activeClassData = activeClass ? CLASSES[activeClass] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4",
        "bg-gradient-to-b from-abyss via-abyss-light/20 to-abyss",
        className
      )}
    >
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="fog-layer opacity-30" />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,134,11,0.1),transparent_70%)]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {step === "class" ? (
            <motion.div
              key="class"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-cinzel text-gold/60 text-sm uppercase tracking-[0.3em] mb-2"
                >
                  Choose Your Path
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-cinzel text-4xl md:text-5xl text-gold font-bold"
                >
                  Select Your Class
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-crimson text-parchment/60 mt-3 max-w-lg mx-auto"
                >
                  Each class offers unique abilities and playstyles. Choose wisely, adventurer.
                </motion.p>
              </div>

              {/* Class cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {CLASS_LIST.map((classData, index) => (
                  <motion.div
                    key={classData.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <ClassCard
                      classData={classData}
                      isSelected={selectedClass === classData.id}
                      isHovered={hoveredClass === classData.id}
                      onSelect={() => setSelectedClass(classData.id)}
                      onHover={(hovered) => setHoveredClass(hovered ? classData.id : null)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Class details panel */}
              <AnimatePresence>
                {activeClassData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-abyss-light/50 backdrop-blur border border-gold/10 rounded-lg p-6">
                      <h3 className="font-cinzel text-lg text-gold mb-4">
                        {activeClassData.name} Skills
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeClassData.skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-start gap-3 p-3 bg-abyss/50 rounded border border-parchment/10"
                          >
                            <div className="w-10 h-10 rounded flex items-center justify-center bg-abyss border border-gold/20 text-xl shrink-0">
                              {skill.icon}
                            </div>
                            <div>
                              <h4 className="font-cinzel text-parchment text-sm">{skill.name}</h4>
                              <p className="font-crimson text-xs text-parchment/50 mt-1">
                                {skill.description}
                              </p>
                              <p className="text-[10px] text-gold/60 mt-1">
                                {skill.manaCost} mana • {skill.cooldown}t cooldown
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex justify-center gap-4 mt-8">
                {onCancel && (
                  <Button variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button
                  variant="gold"
                  onClick={() => setStep("name")}
                  disabled={!selectedClass}
                >
                  Continue →
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${CLASSES[selectedClass!].color}40, ${CLASSES[selectedClass!].color}20)`,
                  }}
                >
                  {CLASSES[selectedClass!].icon}
                </div>
                <h1 className="font-cinzel text-3xl text-gold font-bold mb-2">
                  Name Your {CLASSES[selectedClass!].name}
                </h1>
                <p className="font-crimson text-parchment/60">
                  What shall the bards call you?
                </p>
              </div>

              {/* Name input */}
              <div className="mb-8">
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={20}
                  autoFocus
                  className={cn(
                    "w-full px-6 py-4 text-center text-xl font-cinzel text-gold",
                    "bg-abyss border-2 border-gold/30 rounded-lg",
                    "placeholder:text-parchment/30",
                    "focus:outline-none focus:border-gold focus:shadow-candle",
                    "transition-all"
                  )}
                />
                <p className="text-center text-xs text-parchment/40 mt-2">
                  {characterName.length}/20 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="ghost" onClick={() => setStep("class")}>
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={!characterName.trim()}
                >
                  Begin Adventure ⚔️
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
