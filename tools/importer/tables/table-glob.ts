export const TABLE_GLOB_PATTERNS = [
  '*_affixdefinitions',
  '*_affixstats',
  '*_afflictions',
  '*_areadefinitions',
  '*_attributeconstitution',
  '*_attributedexterity',
  '*_attributefocus',
  '*_attributeintelligence',
  '*_attributestrength',
  '*_categoricalprogression',
  '*_crafting',
  '*_craftingcategories',
  '*_damagetable_*',
  '*_damagetable',
  '*_damagetypes',
  '*_gameevents',
  '*_gamemodes',
  '*_gatherables',
  '*_housingitems',
  '*_housetypes',
  '*_itemdefinitions_consumables',
  '*_itemdefinitions_master_*',
  '*_itemdefinitions_resources',
  '*_itemdefinitions_weapons',
  '*_itemdefinitions_armor',
  '*_itemdefinitions_ammo',
  '*_itemdefinitions_runes',
  '*_itemappearancedefinitions',
  '*_itemdefinitions_weaponappearances',
  '*_itemdefinitions_instrumentsappearances',
  '*_lootbuckets',
  '*_lootlimits',
  '*_loottables*',
  '*_manacosts_player',
  '*_metaachievements',
  '*_milestonerewards',
  '*_perkbuckets',
  '*_perks',
  '*_spelltable_*',
  '*_spelltable',
  '*_staminacosts_player',
  '*_statuseffectcategories',
  '*_statuseffects_*',
  '*_statuseffects',
  '*_territory_standing',
  '*_territorydefinitions',
  '*_territorygovernance',
  '*_tradeskill*',
  '*_umbralgsupgrades',
  '*_vitals',
  '*_vitalsmetadata',
  '*_vitalscategories',
  '*_vitalsleveldata',
  '*_vitalsmodifierdata',
  '*_weaponmastery',
  '*_xpamountsbylevel',
  'arenas/*',
  'charactertables/**/*',
  'gamemodemutators/*',
  'pointofinterestdefinitions/*',
  'weaponabilities/*',
  'mtx/*',
].map((it) => it + '.json')
