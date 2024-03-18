export const NW_MIN_GEAR_SCORE = 100;
export const NW_MIN_ARMOR_MITIGATION = 0;
export const NW_MAX_ARMOR_MITIGATION = 2;
export const NW_PHYSICAL_ARMOR_SCALE_FACTOR = 1850;
export const NW_ELEMENTAL_ARMOR_SCALE_FACTOR = 1850;
export const NW_ARMOR_SET_RATING_EXPONENT = 1.2;
export const NW_ARMOR_MITIGATION_EXPONENT = 1.2;
export const NW_ARMOR_RATING_DECIMAL_ACCURACY = 1;
export const NW_BASE_DAMAGE_COMPOUND_INCREASE = 0.0112;
export const NW_COMPOUND_INCREASE_DIMINISHING_MULTIPLIER = 0.6667;
export const NW_BASE_DAMAGE_GEAR_SCORE_INTERVAL = 5;
export const NW_MIN_POSSIBLE_WEAPON_GEAR_SCORE = 100;
export const NW_DIMINISHING_GEAR_SCORE_THRESHOLD = 500;
export const NW_ROUND_GEARSCORE_UP = true;
export const NW_GEAR_SCORE_ROUNDING_INTERVAL = 5;
export const NW_MAX_POINTS_PER_ATTRIBUTE = 500;
export const NW_LEVEL_DAMAGE_MULTIPLIER = 0.025;
export const NW_ITEM_RARITY_DATA = Object.freeze([
  { displayName: "@RarityLevel0_DisplayName", maxPerkCount: 0 },
  { displayName: "@RarityLevel1_DisplayName", maxPerkCount: 2 },
  { displayName: "@RarityLevel2_DisplayName", maxPerkCount: 3 },
  { displayName: "@RarityLevel3_DisplayName", maxPerkCount: 4 },
  { displayName: "@RarityLevel4_DisplayName", maxPerkCount: 5 },
]);
export const NW_CRAFTING_RESULT_LOOT_BUCKET = "FixedCraftingResults";
export const NW_ROLL_PERK_ON_UPGRADE_GS = 600;
export const NW_ROLL_PERK_ON_UPGRADE_TIER = 5;
export const NW_ROLL_PERK_ON_UPGRADE_PERK_COUNT = 4;
export const NW_PERK_GENERATION_DATA = Object.freeze([
  {
    maxPerkChannel: 0,
    generalGearScorePerkCount: [],
    craftingGearScorePerkCount: [],
    attributePerkBucket: "",
  },
  {
    maxPerkChannel: 0,
    generalGearScorePerkCount: [],
    craftingGearScorePerkCount: [],
    attributePerkBucket: "",
  },
  {
    maxPerkChannel: 2,
    generalGearScorePerkCount: [
      [{ v1: 0, v2: 169 }],
      [{ v1: 0, v2: 169 }],
      [{ v1: 170, v2: 700 }],
    ],
    craftingGearScorePerkCount: [
      [{ v1: 0, v2: 169 }],
      [{ v1: 0, v2: 169 }],
      [{ v1: 170, v2: 700 }],
    ],
    attributePerkBucket: "CraftingAttributeBucketT2",
  },
  {
    maxPerkChannel: 2,
    generalGearScorePerkCount: [
      [{ v1: 0, v2: 269 }],
      [{ v1: 0, v2: 269 }],
      [{ v1: 270, v2: 324 }],
      [{ v1: 325, v2: 700 }],
    ],
    craftingGearScorePerkCount: [
      [{ v1: 0, v2: 269 }],
      [{ v1: 0, v2: 269 }],
      [{ v1: 270, v2: 324 }],
      [{ v1: 325, v2: 700 }],
    ],
    attributePerkBucket: "CraftingAttributeBucketT3",
  },
  {
    maxPerkChannel: 3,
    generalGearScorePerkCount: [
      [{ v1: 0, v2: 369 }],
      [{ v1: 0, v2: 369 }],
      [{ v1: 0, v2: 369 }],
      [{ v1: 370, v2: 449 }],
      [{ v1: 450, v2: 700 }],
    ],
    craftingGearScorePerkCount: [
      [{ v1: 0, v2: 369 }],
      [{ v1: 0, v2: 369 }],
      [{ v1: 0, v2: 369 }],
      [{ v1: 370, v2: 449 }],
      [{ v1: 450, v2: 700 }],
    ],
    attributePerkBucket: "CraftingAttributeBucketT4",
  },
  {
    maxPerkChannel: 4,
    generalGearScorePerkCount: [
      [{ v1: 0, v2: 469 }],
      [{ v1: 0, v2: 469 }],
      [{ v1: 0, v2: 469 }],
      [{ v1: 0, v2: 469 }],
      [
        { v1: 470, v2: 599 },
        { v1: 626, v2: 674 },
      ],
      [
        { v1: 600, v2: 625 },
        { v1: 675, v2: 700 },
      ],
    ],
    craftingGearScorePerkCount: [
      [{ v1: 0, v2: 469 }],
      [{ v1: 0, v2: 469 }],
      [{ v1: 0, v2: 469 }],
      [{ v1: 0, v2: 469 }],
      [
        { v1: 470, v2: 599 },
        { v1: 626, v2: 674 },
      ],
      [
        { v1: 600, v2: 625 },
        { v1: 675, v2: 700 },
      ],
    ],
    attributePerkBucket: "CraftingAttributeBucketT5",
  },
]);
export const NW_EQUIP_LOAD_RATIO_FAST = 0;
export const NW_EQUIP_LOAD_RATIO_NORMAL = 26;
export const NW_EQUIP_LOAD_RATIO_SLOW = 46;
export const NW_EQUIP_LOAD_DAMAGE_MULT_FAST = 0.20000000298023224;
export const NW_EQUIP_LOAD_DAMAGE_MULT_NORMAL = 0.10000000149011612;
export const NW_EQUIP_LOAD_DAMAGE_MULT_SLOW = 0;
export const NW_EQUIP_LOAD_HEAL_MULT_FAST = 1.2999999523162842;
export const NW_EQUIP_LOAD_HEAL_MULT_NORMAL = 1;
export const NW_EQUIP_LOAD_HEAL_MULT_SLOW = 0.699999988079071;
