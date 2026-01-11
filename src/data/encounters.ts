/**
 * Encounters Data - Rich dialogue, branching paths, and consequences
 * Each encounter has multiple choice paths with class-specific options
 */

import { CharacterClass } from "@/types/game";

export interface DialogueOption {
  id: string;
  text: string;
  requirement?: {
    class?: CharacterClass;
    gold?: number;
    item?: string;
    stat?: { name: string; value: number };
  };
  outcome: {
    text: string;
    effects: {
      gold?: number;
      health?: number;
      score?: number;
      item?: string;
      unlock?: string;
      combat?: boolean;
      escape?: boolean;
      special?: string;
    };
  };
}

export interface Encounter {
  id: string;
  type: "dialogue" | "combat" | "event" | "rest" | "merchant" | "boss";
  title: string;
  description: string;
  floor: number;
  dialogue?: {
    speaker?: string;
    text: string;
    options: DialogueOption[];
  };
  rewards?: {
    gold?: { min: number; max: number };
    items?: string[];
    experience?: number;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function checkRequirement(
  req: DialogueOption["requirement"],
  player: { class: CharacterClass; gold: number; items: string[]; stats: Record<string, number> }
): boolean {
  if (!req) return true;
  if (req.class && req.class !== player.class) return false;
  if (req.gold && player.gold < req.gold) return false;
  if (req.item && !player.items.includes(req.item)) return false;
  if (req.stat && player.stats[req.stat.name] < req.stat.value) return false;
  return true;
}

// ============================================
// FLOOR 1 - THE UPPER TRENCHES
// ============================================

export const FLOOR_1_ENCOUNTERS: Encounter[] = [
  {
    id: "f1_entrance",
    type: "dialogue",
    title: "The Trench Gate",
    description: "Ancient stone doors creak open, revealing darkness below...",
    floor: 1,
    dialogue: {
      speaker: "A Weathered Sign",
      text: "Those who enter seek fortune or folly. The Trenches do not discriminate—they consume all who are unprepared. Turn back now, or descend forever.",
      options: [
        {
          id: "proceed_bold",
          text: "Stride forward confidently. Glory awaits!",
          outcome: {
            text: "You march through the gate with your head held high. The darkness seems to part before your resolve. You find a small pouch of coins left by a less fortunate adventurer.",
            effects: { gold: 25, score: 10 },
          },
        },
        {
          id: "proceed_cautious",
          text: "Move carefully, checking for traps...",
          outcome: {
            text: "Your caution is rewarded. You spot a tripwire near the entrance and disarm it, revealing a hidden compartment with a health tonic.",
            effects: { score: 15, item: "health_tonic" },
          },
        },
        {
          id: "warrior_kick",
          text: "Kick the door fully open with warrior's strength!",
          requirement: { class: "warrior" },
          outcome: {
            text: "Your powerful kick echoes through the trenches. Somewhere below, you hear creatures scatter in fear. Your reputation precedes you!",
            effects: { score: 30, unlock: "fearsome_entry" },
          },
        },
        {
          id: "mage_detect",
          text: "Cast a detection spell to reveal magical auras...",
          requirement: { class: "mage" },
          outcome: {
            text: "Arcane symbols glow briefly on the walls, revealing an ancient blessing. Your mana reserves feel strengthened by the lingering enchantment.",
            effects: { score: 25, special: "mana_boost" },
          },
        },
        {
          id: "rogue_search",
          text: "Search the shadows for hidden paths...",
          requirement: { class: "rogue" },
          outcome: {
            text: "Your trained eyes spot a narrow passage others would miss. Inside, you find a stash of coins and a map fragment.",
            effects: { gold: 50, score: 20, item: "map_fragment" },
          },
        },
      ],
    },
  },
  {
    id: "f1_wounded_soldier",
    type: "dialogue",
    title: "The Fallen Guard",
    description: "A soldier lies against the wall, clutching a bloody wound...",
    floor: 1,
    dialogue: {
      speaker: "Wounded Soldier",
      text: "Cough... you're the first living soul I've seen in days. The creatures came from below—dozens of them. My squad... all gone. I won't last much longer. Please... take my badge to Captain Vera in the village. Tell her... we tried.",
      options: [
        {
          id: "help_soldier",
          text: "Give him your healing supplies (-20 HP to self)",
          outcome: {
            text: "You tend to his wounds with your own limited supplies. Color returns to his face. 'You're a good soul,' he whispers. 'Take this—my grandfather's charm. It's kept me alive this long.' He presses a golden amulet into your hands.",
            effects: { health: -20, item: "veterans_amulet", score: 50, unlock: "merciful_heart" },
          },
        },
        {
          id: "take_badge",
          text: "Take the badge and promise to deliver it",
          outcome: {
            text: "You take his badge solemnly. His eyes close with relief. 'Thank you... friend.' As life leaves him, you notice a few coins in his pouch. He'd want them put to use.",
            effects: { gold: 15, item: "guard_badge", score: 20 },
          },
        },
        {
          id: "search_body",
          text: "He's already dead. Search for valuables.",
          outcome: {
            text: "You rifle through his belongings, finding coins and a serviceable dagger. As you stand, you feel a chill—was that judgment from beyond? The trenches remember all things.",
            effects: { gold: 40, item: "guard_dagger", score: -10, unlock: "cold_heart" },
          },
        },
        {
          id: "mage_heal",
          text: "Channel healing magic into his wounds",
          requirement: { class: "mage" },
          outcome: {
            text: "Your hands glow with restorative energy. The soldier gasps as his wounds close. 'A miracle!' He gives you his entire coin purse and swears to spread word of your kindness to any who will listen.",
            effects: { gold: 60, score: 75, unlock: "healer_renown" },
          },
        },
      ],
    },
  },
  {
    id: "f1_goblin_camp",
    type: "dialogue",
    title: "Goblin Outpost",
    description: "Firelight flickers ahead. You hear guttural laughter...",
    floor: 1,
    dialogue: {
      speaker: "Goblin Lookout",
      text: "Halt! Big-person enter goblin territory! You pay toll or we take toll from your flesh! Fifty gold pieces, or we see how loud you scream!",
      options: [
        {
          id: "pay_toll",
          text: "Pay the 50 gold toll",
          requirement: { gold: 50 },
          outcome: {
            text: "The goblins snatch your coins greedily. 'Smart big-person! Go through, go through!' They even point out a safe path. Expensive, but bloodless.",
            effects: { gold: -50, score: 5 },
          },
        },
        {
          id: "fight_goblins",
          text: "Draw your weapon and attack!",
          outcome: {
            text: "The goblins screech battle cries as three of them charge at you! This won't be easy, but their hoard awaits the victor!",
            effects: { combat: true },
          },
        },
        {
          id: "intimidate",
          text: "Roar a battle cry and charge at them!",
          requirement: { class: "warrior" },
          outcome: {
            text: "Your terrifying war cry echoes through the tunnels. The goblins freeze, then scatter into the darkness, abandoning their camp. You help yourself to their meager treasures.",
            effects: { gold: 75, score: 40, unlock: "goblin_terror" },
          },
        },
        {
          id: "deceive",
          text: "Convince them a dragon is coming behind you",
          requirement: { class: "rogue" },
          outcome: {
            text: "'DRAGON?! WHERE?!' The goblins panic, trampling each other to escape. You casually stroll through their camp, pocketing everything shiny.",
            effects: { gold: 80, score: 35, item: "goblin_trinket" },
          },
        },
        {
          id: "magic_scare",
          text: "Create an illusion of flames surrounding them",
          requirement: { class: "mage" },
          outcome: {
            text: "Illusory fire springs to life around the goblins. They scream, convinced they're burning, and flee in all directions. Not your most ethical spell, but effective.",
            effects: { gold: 65, score: 30 },
          },
        },
        {
          id: "negotiate",
          text: "Offer to trade information instead",
          outcome: {
            text: "'Information? What big-person know?' You tell them about the wounded soldier's squad. Their eyes light up—salvage! They let you pass free and give you a 'gift' from their hoard.",
            effects: { gold: 20, score: -5, unlock: "goblin_informant" },
          },
        },
      ],
    },
  },
  {
    id: "f1_mysterious_chest",
    type: "dialogue",
    title: "The Ornate Chest",
    description: "A beautifully crafted chest sits in an otherwise empty room...",
    floor: 1,
    dialogue: {
      text: "The chest glimmers with golden inlays and jeweled clasps. It seems far too valuable to be left unguarded. Yet no traps are visible, and no enemies approach. Something feels wrong.",
      options: [
        {
          id: "open_carefully",
          text: "Open the chest carefully",
          outcome: {
            text: "The lid swings open to reveal... teeth! The chest is a mimic! Its tongue lashes out, but you stumble back just in time. The creature gives chase!",
            effects: { combat: true, health: -10 },
          },
        },
        {
          id: "attack_first",
          text: "Strike the chest before opening it",
          requirement: { class: "warrior" },
          outcome: {
            text: "Your blade sinks into the 'chest' which shrieks in pain—a mimic! But your preemptive strike gives you the advantage. The weakened creature is easier to defeat.",
            effects: { combat: true, score: 25 },
          },
        },
        {
          id: "detect_trap",
          text: "Cast detect magic on the chest",
          requirement: { class: "mage" },
          outcome: {
            text: "Your spell reveals the chest's true nature—a mimic! Worse, it reveals YOUR nature to the mimic. But knowing is half the battle, and you're prepared for its attack.",
            effects: { combat: true, score: 20 },
          },
        },
        {
          id: "throw_rock",
          text: "Throw a rock at it from a distance",
          requirement: { class: "rogue" },
          outcome: {
            text: "Your thrown stone bounces off—and the 'chest' yelps! The mimic, realizing its cover is blown, scurries away into the darkness. You lose the loot but keep your life.",
            effects: { score: 15, escape: true },
          },
        },
        {
          id: "leave_it",
          text: "Trust your instincts and walk away",
          outcome: {
            text: "You back away slowly. The chest's lid opens slightly, revealing rows of teeth in a disappointed frown. It closes and somehow looks sulky. Wise choice.",
            effects: { score: 20, escape: true },
          },
        },
      ],
    },
  },
  {
    id: "f1_ancient_shrine",
    type: "dialogue",
    title: "The Forgotten Altar",
    description: "An ancient shrine to an unknown deity stands here, covered in moss...",
    floor: 1,
    dialogue: {
      speaker: "Whispers in the Air",
      text: "Make... an offering... receive... a blessing...",
      options: [
        {
          id: "offer_gold",
          text: "Place 30 gold on the altar",
          requirement: { gold: 30 },
          outcome: {
            text: "The coins vanish in golden light. Warmth spreads through your body as minor wounds heal and your spirit feels refreshed. The ancient ones are pleased.",
            effects: { gold: -30, health: 40, score: 25 },
          },
        },
        {
          id: "offer_blood",
          text: "Cut your palm and offer blood",
          outcome: {
            text: "Your blood sizzles on the altar. The shrine pulses with dark power, and you feel... stronger. Darker. But strength is strength in these trenches.",
            effects: { health: -15, score: 30, item: "blood_blessing", unlock: "dark_pact" },
          },
        },
        {
          id: "pray",
          text: "Simply pray without offering",
          outcome: {
            text: "You kneel and offer sincere words. The whispers fall silent, but you feel a gentle presence. A sense of peace washes over you, and somehow the path ahead seems clearer.",
            effects: { score: 15, unlock: "humble_prayer" },
          },
        },
        {
          id: "desecrate",
          text: "Smash the altar for hidden treasures",
          outcome: {
            text: "Your weapon crashes into the ancient stone. Gems spill out—but so does a terrible curse! Shadows coil around you, draining your vitality. Was it worth it?",
            effects: { gold: 100, health: -30, score: -20, unlock: "defiler" },
          },
        },
        {
          id: "mage_commune",
          text: "Attempt to commune with the deity",
          requirement: { class: "mage" },
          outcome: {
            text: "Your mind touches something vast and ancient. It shows you visions—treasure rooms, trap locations, hidden paths. When you awaken, the knowledge remains.",
            effects: { score: 50, unlock: "divine_vision", item: "vision_map" },
          },
        },
      ],
    },
  },
  {
    id: "f1_trapped_merchant",
    type: "dialogue",
    title: "The Merchant's Plea",
    description: "A trader sits in a cage, guarded by sleeping creatures...",
    floor: 1,
    dialogue: {
      speaker: "Caged Merchant",
      text: "Psst! Over here! Name's Korvin, trader of fine goods. These beasts caught me three days ago—been saving me for a 'special meal.' Help me escape and I'll make it worth your while! I've got connections, friend. Valuable connections.",
      options: [
        {
          id: "free_stealth",
          text: "Quietly pick the lock while guards sleep",
          outcome: {
            text: "The lock clicks open. Korvin slips out and presses a pouch into your hands. 'You're a lifesaver! If you survive, find me in the village. I'll have something special waiting.'",
            effects: { gold: 40, score: 30, unlock: "merchant_friend", item: "korvin_token" },
          },
        },
        {
          id: "free_fight",
          text: "Kill the guards and free him openly",
          outcome: {
            text: "Your attack wakes them all! But with Korvin's help pointing out weak spots, you dispatch them efficiently. 'Brutal but effective! Here's your reward, warrior.'",
            effects: { combat: true, gold: 60, score: 40 },
          },
        },
        {
          id: "demand_payment",
          text: "Demand payment upfront before helping",
          outcome: {
            text: "Korvin sighs and slides a ring through the bars. 'My grandmother's. It's all I have on me.' You free him, ring in pocket. He looks at you differently now.",
            effects: { item: "silver_ring", score: 10 },
          },
        },
        {
          id: "leave_him",
          text: "It's too risky. Leave him.",
          outcome: {
            text: "You back away silently. Korvin's expression shifts from hope to despair to cold fury. 'I'll remember this,' he hisses. 'If I survive, I'll remember.' You feel his eyes on your back as you leave.",
            effects: { score: -10, unlock: "merchant_enemy" },
          },
        },
        {
          id: "rogue_barter",
          text: "Offer to free him in exchange for thievery lessons",
          requirement: { class: "rogue" },
          outcome: {
            text: "Korvin grins. 'A professional! I like you.' After the escape, he teaches you a few tricks of the trade. Your fingers feel quicker, your eyes sharper.",
            effects: { score: 35, unlock: "merchant_friend", special: "skill_boost" },
          },
        },
      ],
    },
  },
];

// ============================================
// FLOOR 2 - THE DEEP TRENCHES
// ============================================

export const FLOOR_2_ENCOUNTERS: Encounter[] = [
  {
    id: "f2_entrance",
    type: "dialogue",
    title: "The Descent",
    description: "A spiral staircase descends into deeper darkness...",
    floor: 2,
    dialogue: {
      text: "The air grows colder as you descend. Strange luminescent fungi provide dim light, and the walls are slick with moisture. You hear distant sounds—dripping water, scuttling creatures, and something that might be chanting.",
      options: [
        {
          id: "proceed_quiet",
          text: "Move silently, staying in shadows",
          outcome: {
            text: "Your careful approach allows you to observe the area undetected. You spot patrols and plan your route accordingly. Knowledge is survival down here.",
            effects: { score: 25, unlock: "shadow_walker" },
          },
        },
        {
          id: "proceed_fast",
          text: "Move quickly before anything notices you",
          outcome: {
            text: "You rush through the corridor—and nearly run into a patrol! A brief scuffle ensues, but you dispatch them before they can raise an alarm. Close call.",
            effects: { combat: true, score: 15 },
          },
        },
        {
          id: "harvest_fungi",
          text: "Collect some of the glowing fungi",
          outcome: {
            text: "The fungi pulse warmly in your hands. You pocket several specimens. They might be useful as light sources... or perhaps alchemical ingredients.",
            effects: { item: "glow_fungi", score: 10 },
          },
        },
      ],
    },
  },
  {
    id: "f2_skeleton_crew",
    type: "dialogue",
    title: "The Undead Legion",
    description: "Rows of armored skeletons stand motionless in formation...",
    floor: 2,
    dialogue: {
      speaker: "Skeletal Commander",
      text: "HALT. You stand before the Eternal Legion. We have guarded these halls for centuries. State your purpose, or be added to our ranks.",
      options: [
        {
          id: "state_purpose",
          text: "I seek passage through, nothing more.",
          outcome: {
            text: "The commander's empty eye sockets study you. 'Acceptable. Pass through, but disturb nothing. The treasures here are not for the living.' The skeletons part, creating a path.",
            effects: { score: 30 },
          },
        },
        {
          id: "challenge",
          text: "I answer to no dusty corpse! Stand aside!",
          outcome: {
            text: "The legion rattles to life, drawing ancient weapons. 'INSOLENCE. Your bones will join ours.' At least three dozen skeletons advance on your position.",
            effects: { combat: true, health: -15 },
          },
        },
        {
          id: "offer_service",
          text: "I offer my services to the Legion.",
          outcome: {
            text: "The commander considers. 'Interesting. A task, then. Destroy the necromancer in the eastern halls. He commands undead without honor. Do this, and earn our blessing.'",
            effects: { score: 40, unlock: "legion_quest" },
          },
        },
        {
          id: "mage_commune",
          text: "I sense the magic binding you. Who cast it?",
          requirement: { class: "mage" },
          outcome: {
            text: "The commander pauses. 'You have the sight. We were bound by Archmage Veridian, to guard against... something worse. Something below. Proceed with caution, magic-wielder.'",
            effects: { score: 50, unlock: "legion_secret", item: "legion_pass" },
          },
        },
      ],
    },
  },
  {
    id: "f2_underground_river",
    type: "dialogue",
    title: "The Dark Waters",
    description: "A underground river blocks your path. Strange shapes move beneath...",
    floor: 2,
    dialogue: {
      text: "The black water flows silently, its depth unknowable. Occasionally, something breaks the surface—scales? Tentacles? The only visible crossing is a rotting rope bridge that sways ominously.",
      options: [
        {
          id: "cross_bridge",
          text: "Risk the bridge carefully",
          outcome: {
            text: "The bridge creaks and sways with each step. Halfway across, something brushes your leg from below—but you make it! Barely. Your heart won't slow for minutes.",
            effects: { score: 20 },
          },
        },
        {
          id: "swim_across",
          text: "Swim across quickly",
          outcome: {
            text: "You dive in. The water is freezing. Something wraps around your ankle! You kick frantically and scramble onto the far shore, missing a boot but keeping your life.",
            effects: { health: -20, score: 15, special: "lost_boot" },
          },
        },
        {
          id: "throw_food",
          text: "Throw food to distract whatever's in there",
          outcome: {
            text: "Your rations splash into the water. The river erupts with thrashing as creatures fight for the morsel. You sprint across the bridge while they're occupied.",
            effects: { score: 25, special: "lost_rations" },
          },
        },
        {
          id: "warrior_jump",
          text: "Take a running leap to the other side",
          requirement: { class: "warrior" },
          outcome: {
            text: "Your powerful legs launch you across the gap. You land hard but safely, leaving the bridge and its terrors behind. Sometimes brute force IS the answer.",
            effects: { score: 35 },
          },
        },
        {
          id: "rogue_find_path",
          text: "Look for another way around",
          requirement: { class: "rogue" },
          outcome: {
            text: "Your sharp eyes spot handholds in the cavern wall—an old climbing route. It's treacherous, but keeps you dry. You even find a small cache hidden in a crevice.",
            effects: { gold: 45, score: 30, item: "climbers_cache" },
          },
        },
        {
          id: "mage_freeze",
          text: "Freeze a path across the water",
          requirement: { class: "mage" },
          outcome: {
            text: "Ice spreads from your hands, forming a solid bridge. Below, creatures slam against it in fury. You walk across casually, enjoying their frustration.",
            effects: { score: 40 },
          },
        },
      ],
    },
  },
  {
    id: "f2_dark_merchant",
    type: "dialogue",
    title: "The Shadow Trader",
    description: "A cloaked figure emerges from nowhere, wares floating around them...",
    floor: 2,
    dialogue: {
      speaker: "The Shadow Trader",
      text: "Ah, a customer! How delightful. I deal in things... difficult to find elsewhere. Curses lifted, secrets revealed, futures glimpsed. Everything has a price, of course. Even your deepest desires.",
      options: [
        {
          id: "buy_info",
          text: "Buy information about what lies ahead (40 gold)",
          requirement: { gold: 40 },
          outcome: {
            text: "The trader's laugh echoes strangely. 'The boss below fears fire and light. His weakness is his pride. Also, there's a trap three rooms ahead. Watch the left wall.' Cryptic, but useful.",
            effects: { gold: -40, score: 30, unlock: "boss_weakness" },
          },
        },
        {
          id: "buy_item",
          text: "Purchase a mysterious item (60 gold)",
          requirement: { gold: 60 },
          outcome: {
            text: "The trader produces a vial of swirling darkness. 'Shadow Essence. Drink it to become invisible for a short time. Very useful for... avoiding unpleasantness.'",
            effects: { gold: -60, item: "shadow_essence", score: 20 },
          },
        },
        {
          id: "buy_healing",
          text: "Purchase powerful healing (30 gold)",
          requirement: { gold: 30 },
          outcome: {
            text: "A vial of crimson liquid appears in your hands. 'Drink deep, and be restored.' The potion tastes of copper and starlight, but your wounds seal shut completely.",
            effects: { gold: -30, health: 60, score: 10 },
          },
        },
        {
          id: "sell_soul",
          text: "Sell a piece of your soul for power",
          outcome: {
            text: "The trader's eyes gleam. 'Bold! I'll give you strength beyond measure.' Power floods through you, but something feels... missing. Your reflection looks slightly different now.",
            effects: { score: -50, unlock: "soul_fragment", special: "power_boost", health: 50 },
          },
        },
        {
          id: "attack_trader",
          text: "Try to rob the shadow trader",
          outcome: {
            text: "Your attack passes through empty air. The trader's laugh comes from everywhere. 'Foolish! You'll pay for that discourtesy.' Shadows cut at you before the trader vanishes.",
            effects: { health: -40, score: -20 },
          },
        },
        {
          id: "decline_politely",
          text: "Thank them but decline",
          outcome: {
            text: "The trader shrugs. 'Your loss. I'll be around if you change your mind.' They step backward into shadow and vanish, leaving only a lingering chill.",
            effects: { score: 5 },
          },
        },
      ],
    },
  },
  {
    id: "f2_prisoner_dilemma",
    type: "dialogue",
    title: "The Sacrifice Chamber",
    description: "Three prisoners hang in cages above a ritual pit...",
    floor: 2,
    dialogue: {
      speaker: "Cultist Voice (echoing)",
      text: "You've arrived just in time, interloper! Our ritual requires a sacrifice. Choose which of these three dies, and you may pass. Refuse, and join them in oblivion.",
      options: [
        {
          id: "sacrifice_merchant",
          text: "Choose the wealthy-looking merchant",
          outcome: {
            text: "The merchant screams as the cage drops. The cultists cheer. The other two prisoners look at you with horror and relief. 'Monster,' one whispers. The path opens, but at what cost?",
            effects: { score: -30, unlock: "blood_passage" },
          },
        },
        {
          id: "sacrifice_soldier",
          text: "Choose the wounded soldier",
          outcome: {
            text: "'Mercy,' the soldier whispers as the cage drops. 'Thank you.' Perhaps a kinder fate than slowly dying from his wounds. The cultists are satisfied, the path opens.",
            effects: { score: -15, unlock: "mercy_kill" },
          },
        },
        {
          id: "sacrifice_child",
          text: "Choose the young child",
          outcome: {
            text: "You open your mouth to speak—but something deep inside rebels. You cannot say the words. Some lines should never be crossed. 'Changed your mind?' the voice taunts.",
            effects: { score: 10 },
          },
        },
        {
          id: "attack_mechanism",
          text: "Attack the cage mechanism to free them all",
          outcome: {
            text: "Your strike shatters the mechanism! Cages crash down safely, prisoners tumble out. Furious cultists emerge from the shadows. 'Kill them all!' At least you'll die with honor.",
            effects: { combat: true, score: 50, unlock: "liberator" },
          },
        },
        {
          id: "offer_self",
          text: "Offer yourself as the sacrifice",
          outcome: {
            text: "Silence. Then laughter. 'A willing sacrifice? That changes the equation entirely!' The cultists argue among themselves. While distracted, you notice an escape route...",
            effects: { score: 40, unlock: "selfless_offer", escape: true },
          },
        },
        {
          id: "rogue_distract",
          text: "Create a distraction and slip past",
          requirement: { class: "rogue" },
          outcome: {
            text: "A thrown smoke bomb fills the chamber. In the chaos, you free the prisoners and guide them to safety through a side passage. The cultists find only empty cages.",
            effects: { score: 60, gold: 30, unlock: "shadow_rescuer" },
          },
        },
      ],
    },
  },
];

// ============================================
// BOSS ENCOUNTERS
// ============================================

export const BOSS_ENCOUNTERS: Encounter[] = [
  {
    id: "boss_trench_lord",
    type: "boss",
    title: "The Trench Lord",
    description: "A massive figure emerges from the darkness, ancient and terrible...",
    floor: 3,
    dialogue: {
      speaker: "The Trench Lord",
      text: "Another insect crawls into my domain. Centuries I have slumbered, and now you DARE disturb my rest? Look upon me and despair, mortal. Your bones will decorate my throne.",
      options: [
        {
          id: "fight_honorably",
          text: "Face the Trench Lord in honorable combat",
          outcome: {
            text: "The Trench Lord respects your courage. 'Very well, insect. Let us see what you're made of.' The battle for the trenches begins!",
            effects: { combat: true, score: 100 },
          },
        },
        {
          id: "use_weakness",
          text: "Exploit his pride—challenge his honor!",
          requirement: { item: "boss_weakness" },
          outcome: {
            text: "'You're just a guardian for something else, aren't you? A servant!' The Trench Lord roars in fury, attacking recklessly. His rage makes him sloppy.",
            effects: { combat: true, score: 150, special: "boss_weakened" },
          },
        },
        {
          id: "offer_allegiance",
          text: "Offer to serve the Trench Lord",
          outcome: {
            text: "The Trench Lord laughs. 'Serve me? You would abandon your quest so easily?' He considers. 'No. Those without conviction are worthless to me. DIE!'",
            effects: { combat: true, score: -50 },
          },
        },
        {
          id: "show_legion_pass",
          text: "Show the Legion's token of passage",
          requirement: { item: "legion_pass" },
          outcome: {
            text: "The Trench Lord freezes. 'The Legion... sent you?' His demeanor shifts slightly. 'They remember their duty, then. Very well. I will test you, but fairly.'",
            effects: { combat: true, score: 75, special: "fair_fight" },
          },
        },
      ],
    },
  },
];

// ============================================
// UTILITY: GET ENCOUNTERS BY FLOOR
// ============================================

export function getEncountersForFloor(floor: number): Encounter[] {
  switch (floor) {
    case 1:
      return FLOOR_1_ENCOUNTERS;
    case 2:
      return FLOOR_2_ENCOUNTERS;
    case 3:
      return BOSS_ENCOUNTERS;
    default:
      return FLOOR_1_ENCOUNTERS;
  }
}

export function getRandomEncounter(floor: number, excludeIds: string[] = []): Encounter | null {
  const encounters = getEncountersForFloor(floor);
  const available = encounters.filter((e) => !excludeIds.includes(e.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
