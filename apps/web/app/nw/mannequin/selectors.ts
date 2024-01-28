import {
  AttributeRef,
  EquipSlotId,
  getAmmoTypeFromWeaponTag,
  getAverageGearScore,
  getWeaponTagFromWeapon,
  solveAttributePlacingMods,
} from '@nw-data/common'
import { Ability, Damagetable, ItemdefinitionsAmmo, Statuseffect } from '@nw-data/generated'
import { minBy, sum } from 'lodash'
import { eqCaseInsensitive } from '~/utils'

import {
  getItemGsBonus,
  getItemPerkIdsWithOverride,
  getPerkMultiplier,
  isItemArmor,
  isItemConsumable,
  isItemJewelery,
  isItemShield,
  isItemTool,
  isItemWeapon,
} from '@nw-data/common'
import { NW_WEAPON_TYPES } from '../weapon-types/nw-weapon-types'
import { checkAllConditions } from './conditions'
import {
  ActiveAbility,
  ActiveAttribute,
  ActiveAttributes,
  ActiveConsumable,
  ActiveEffect,
  ActivePerk,
  ActiveWeapon,
  AttributeModsSource,
  DbSlice,
  EquippedItem,
  MannequinState,
} from './types'

export function selectLevel({ level }: MannequinState) {
  return level
}

export function selectActiveWeapon(
  { items, weapons, ammos }: DbSlice,
  { weaponActive, weaponUnsheathed, equippedItems }: MannequinState,
): ActiveWeapon {
  const equpped = equippedItems.find((it) => isWeaponActive(weaponActive, it.slot))
  const item = items.get(equpped?.itemId)
  const weapon = weapons.get(item?.ItemStatsRef) || weapons.get('Unarmed')
  const weaponTag = getWeaponTagFromWeapon(weapon)
  const ammoType = getAmmoTypeFromWeaponTag(weaponTag)

  let ammo: ItemdefinitionsAmmo
  if (weapon?.AmmoType === 'Arrow') {
    ammo = ammos.get(equippedItems.find((it) => it.slot === 'arrow')?.itemId)
  }
  if (weapon?.AmmoType === 'Shot') {
    ammo = ammos.get(equippedItems.find((it) => it.slot === 'cartridge')?.itemId)
  }
  return {
    item: item,
    weapon: weapon,
    weaponTag: getWeaponTagFromWeapon(weapon),
    gearScore: equpped?.gearScore, // || 0,
    slot: equpped?.slot,
    unsheathed: weaponUnsheathed,
    ammo: eqCaseInsensitive(ammo?.AmmoType, ammoType) ? ammo : null,
  }
}

export function selectWeaponAttacks(db: DbSlice, weapon: ActiveWeapon, state: MannequinState) {
  const weaponSpec = NW_WEAPON_TYPES.find((it) => it.WeaponTag === weapon.weaponTag)
  if (weapon.weaponTag && !weaponSpec) {
    return []
  }
  //const abilities = selectWeaponAbilities(db, weapon, state).filter((it) => it.IsActiveAbility)
  const tablePrefix = weaponSpec?.DamageTablePrefix || 'Unarmed_'
  const result: Damagetable[] = []
  for (const row of db.damagaTable) {
    if (!row.DmgCoef) {
      continue
    }
    if (!row.DamageID.startsWith(tablePrefix)) {
      continue
    }
    if (row.AttackType === 'Light' || row.AttackType === 'Heavy') {
      result.push(row)
      continue
    }
    // if (row.AttackType === 'Ability') {
    //   for (const ability of abilities) {
    //     if (eqCaseInsensitive(ability.DamageTableRow?.[0], row.DamageID)) {
    //       result.push(Object.assign({}, row, { $ability: ability }))
    //     }
    //   }
    // }
  }
  return result
}

export function selectDamageTableRow(rows: Damagetable[], state: MannequinState) {
  return rows?.find((it) => it.DamageID === state.selectedAttack) || rows?.[0]
}

export function selectEquipLoad(
  { items, weapons, armors }: DbSlice,
  { equippedItems }: MannequinState,
  perks: ActivePerk[],
) {
  const weights = equippedItems
    .map((it) => items.get(it.itemId))
    .filter((it) => it && (isItemArmor(it) || isItemShield(it)))
    .map((it) => {
      const weapon = weapons.get(it.ItemStatsRef)
      const armor = armors.get(it.ItemStatsRef)
      const weight = (Math.floor(weapon?.WeightOverride || armor?.WeightOverride || it.Weight) || 0) / 10
      const scale = 1 + (perks.find((perk) => perk.item === it)?.affix?.WeightMultiplier || 0)
      return weight * scale
    })
  return sum(weights)
}

export function selectEquppedArmor({ items }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems.filter((it) => {
    const item = items.get(it.itemId)
    return isItemArmor(item) || isItemJewelery(item)
  })
}

export function selectEquppedWeapons({ items }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems.filter((it) => {
    const item = items.get(it.itemId)
    return isItemWeapon(item) || isItemShield(item)
  })
}

export function selectEquppedTools({ items }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems.filter((it) => {
    const item = items.get(it.itemId)
    return isItemTool(item)
  })
}

export function selectEquppedConsumables({ items }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems.filter((it) => {
    const item = items.get(it.itemId)
    return isItemConsumable(item)
  })
}

export function selectPlacedHousings({ housings }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems.filter((it) => !!housings.get(it.itemId)?.HousingStatusEffect)
}

export function selectEquippedPerks(
  { items, perks, affixes, weapons, armors, runes }: DbSlice,
  { equippedItems }: MannequinState,
) {
  return equippedItems
    .map((it) => {
      const item = items.get(it.itemId)
      return getItemPerkIdsWithOverride(item, it.perks)
        .map((id) => perks.get(id))
        .filter((it) => !!it)
        .map((perk): ActivePerk => {
          return {
            slot: it.slot,
            item,
            gearScore: it.gearScore,
            perk,
            affix: affixes.get(perk.Affix),
            weapon: weapons.get(item.ItemStatsRef),
            armor: armors.get(item.ItemStatsRef),
            rune: runes.get(item.ItemStatsRef),
          }
        })
    })
    .flat()
    .filter((it) => !!it?.perk)
}

export function selectActivePerks(db: DbSlice, state: MannequinState) {
  const weapon = selectActiveWeapon(db, state)
  return selectEquippedPerks(db, state).filter((it) => isPerkActive(it, weapon))
}

export function selectAttributeAbilities({ abilities }: DbSlice, attributes: ActiveAttributes) {
  const result: Ability[] = []
  for (const attr of Object.values(attributes)) {
    for (const abilityId of attr.abilities) {
      const ability = abilities.get(abilityId)
      if (ability) {
        result.push(ability)
      }
    }
  }
  return result
}

export function selectActivatedAbilities({ abilities }: DbSlice, { activatedAbilities }: MannequinState) {
  return activatedAbilities.map((it) => abilities.get(it))
}

export function selectWeaponAbilities(
  { abilities }: DbSlice,
  { weaponTag }: ActiveWeapon,
  { equippedSkills1, equippedSkills2 }: MannequinState,
) {
  return [equippedSkills1, equippedSkills2]
    .filter((it) => eqCaseInsensitive(it?.weapon, weaponTag))
    .map((it) => [it?.tree1 || [], it?.tree2 || []])
    .flat(2)
    .map((id) => abilities.get(id))
    .filter((ability) => !!ability)
}

export function selectPerkAbilities({ abilities, effects }: DbSlice, perks: ActivePerk[], state: MannequinState) {
  const result: ActiveAbility[] = []
  for (const activePerk of perks) {
    for (const abilityId of activePerk.perk.EquipAbility || []) {
      const ability = abilities.get(abilityId)
      if (!ability) {
        continue
      }
      result.push({
        ability: ability,
        selfEffects: getStatusEffectList(ability.SelfApplyStatusEffect, effects),
        perk: activePerk,
        scale: getAbilityScale(ability, state),
      })
    }
  }
  return result
}

export function selectActiveAbilities(
  db: DbSlice,
  attributes: ActiveAttributes,
  weapon: ActiveWeapon,
  attack: Damagetable,
  perks: ActivePerk[],
  state: MannequinState,
) {
  return selectAllAbilities(db, attributes, weapon, attack, perks, state).filter(({ ability }) =>
    isActiveAbility(ability, attack, state),
  )
}

export function selectAllAbilities(
  db: DbSlice,
  attributes: ActiveAttributes,
  weapon: ActiveWeapon,
  attack: Damagetable,
  perks: ActivePerk[],
  state: MannequinState,
) {
  return [
    //
    selectAttributeAbilities(db, attributes).map((it): ActiveAbility => {
      return {
        ability: it,
        selfEffects: getStatusEffectList(it?.SelfApplyStatusEffect, db.effects),
        attribute: true,
        scale: getAbilityScale(it, state),
      }
    }),
    //
    selectWeaponAbilities(db, weapon, state).map((it): ActiveAbility => {
      return {
        ability: it,
        selfEffects: getStatusEffectList(it?.SelfApplyStatusEffect, db.effects),
        weapon: weapon,
        scale: getAbilityScale(it, state),
        cooldown: db.cooldowns.get(it?.AbilityID),
      }
    }),
    //
    selectPerkAbilities(db, perks, state),
  ].flat()
}

export function selectActveEffects(db: DbSlice, perks: ActivePerk[], state: MannequinState) {
  return [
    // assume consumable as being consumed and active
    selectConsumableEffects(db, state),
    // housing effects are always active
    selectHousingEffects(db, state),
    //
    selectPerkEffects(db, perks),
    // enforced effects like town buffs
    selectEnforcedEffects(db, state),
  ]
    .flat()
    .filter((it) => !!it)
}

export function selectActiveConsumables({ items, consumables, effects }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems
    .map((it): ActiveConsumable => {
      const item = items.get(it.itemId)
      const consumable = consumables.get(it.itemId)
      return {
        item,
        consumable,
      }
    })
    .filter((it) => !!it?.consumable)
}

export function selectConsumableEffects({ items, consumables, effects }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems
    .map((it): ActiveEffect[] => {
      const consumable = consumables.get(it.itemId)
      return (
        consumable?.AddStatusEffects?.map((id) => {
          return {
            item: items.get(it.itemId),
            consumable: consumable,
            effect: effects.get(id),
          }
        }) || []
      )
    })
    .flat()
    .filter((it) => !!it?.effect)
}

export function selectHousingEffects({ housings, effects }: DbSlice, { equippedItems }: MannequinState) {
  return equippedItems
    .map((it): ActiveEffect[] => {
      const housing = housings.get(it.itemId)
      return [
        {
          item: housing,
          consumable: null,
          effect: effects.get(housing?.HousingStatusEffect),
        },
      ]
    })
    .flat()
    .filter((it) => !!it?.effect)
}

export function selectPerkEffects({ affixes, effects }: DbSlice, perks: ActivePerk[]) {
  return perks
    .map((active): ActiveEffect[] => {
      return [
        {
          item: null,
          consumable: null,
          perk: active,
          effect: effects.get(affixes.get(active.perk?.Affix)?.StatusEffect),
        },
      ]
    })
    .flat()
    .filter((it) => !!it?.effect)
}

export function selectEnforcedEffects({ effects }: DbSlice, { enforcedEffects }: MannequinState) {
  enforcedEffects = enforcedEffects || []
  return enforcedEffects
    .map(({ id, stack }) => {
      return new Array(stack).fill(null).map((): ActiveEffect => {
        return {
          effect: effects.get(id),
        }
      })
    })
    .flat()
    .filter((it) => !!it.effect)
}

function isWeaponActive(weapon: 'primary' | 'secondary', slot: EquipSlotId) {
  if (weapon === 'primary' && slot === 'weapon1') {
    return true
  }
  if (weapon === 'secondary' && slot === 'weapon2') {
    return true
  }
  return false
}

function isPerkActive({ slot, perk, affix, item }: ActivePerk, weapon: ActiveWeapon) {
  let condition = perk?.ConditionEvent
  if (condition === 'OnEquip') {
    return true
  }
  if (!(isItemWeapon(item) || isItemShield(item))) {
    return true
  }
  const isActiveWeapon =
    weapon.slot === slot || (slot === 'weapon3' && (weapon.weaponTag === 'Sword' || weapon.weaponTag === 'Flail'))
  if (!isActiveWeapon) {
    return false
  }
  if (condition === 'OnActive') {
    return true
  }
  if (condition === 'OnUnsheathed') {
    return weapon.unsheathed
  }
  return false
}

export function selectEquppedAttributes(
  { attrCon, attrDex, attrFoc, attrInt, attrStr }: DbSlice,
  { perks }: AttributeModsSource,
) {
  const result: Record<AttributeRef, number> = {
    con: minBy(attrCon, (it) => it.Level).Level,
    dex: minBy(attrDex, (it) => it.Level).Level,
    foc: minBy(attrFoc, (it) => it.Level).Level,
    int: minBy(attrInt, (it) => it.Level).Level,
    str: minBy(attrStr, (it) => it.Level).Level,
  }

  for (const { perk, gearScore, affix, item } of perks) {
    if (!affix) {
      continue
    }

    let scale = 1
    if (perk.ScalingPerGearScore) {
      scale = getPerkMultiplier(perk, gearScore + getItemGsBonus(perk, item))
    }

    result.con += Math.floor((affix.MODConstitution || 0) * scale)
    result.dex += Math.floor((affix.MODDexterity || 0) * scale)
    result.foc += Math.floor((affix.MODFocus || 0) * scale)
    result.int += Math.floor((affix.MODIntelligence || 0) * scale)
    result.str += Math.floor((affix.MODStrength || 0) * scale)
  }
  return result
}

export function selectBonusAttributes(db: DbSlice, { effects }: AttributeModsSource) {
  const result: Record<AttributeRef, number> = {
    con: 0,
    dex: 0,
    foc: 0,
    int: 0,
    str: 0,
  }

  for (const { effect, consumable } of effects) {
    if (!effect || !consumable) {
      continue
    }
    result.con += effect.MODConstitution || 0
    result.dex += effect.MODDexterity || 0
    result.foc += effect.MODFocus || 0
    result.int += effect.MODIntelligence || 0
    result.str += effect.MODStrength || 0
  }
  return result
}

export function selectPlacingMods(db: DbSlice, { perks }: AttributeModsSource) {
  const result: number[] = []
  for (const { perk, gearScore, affix, item } of perks) {
    if (!affix || !affix.AttributePlacingMods) {
      continue
    }
    let scale = 1
    if (perk.ScalingPerGearScore) {
      scale = getPerkMultiplier(perk, gearScore + getItemGsBonus(perk, item))
    }
    const mods = affix.AttributePlacingMods.split(',')
    for (let i = 0; i < mods.length; i++) {
      const value = Math.floor(Number(mods[i] || 0) * scale)
      result[i] = (result[i] || 0) + value
    }
  }
  return result.map((it) => it || 0)
}

export function selectAttributes(db: DbSlice, mods: AttributeModsSource, state: MannequinState): ActiveAttributes {
  const attrsBase = selectEquppedAttributes(db, mods)
  const attrsBonus = selectBonusAttributes(db, mods)
  const attrsAssigned = state.assignedAttributes
  const attrsMagnify = selectPlacingMods(db, mods)
  const levels = {
    con: db.attrCon,
    dex: db.attrDex,
    foc: db.attrFoc,
    int: db.attrInt,
    str: db.attrStr,
  } as const
  function buildAttribute(key: AttributeRef): ActiveAttribute {
    const base = attrsBase?.[key] || 0
    const bonus = attrsBonus?.[key] || 0
    const assigned = attrsAssigned?.[key] || 0
    const value = base + bonus + assigned
    return {
      base: base,
      bonus: bonus,
      assigned: assigned,
      total: value,
      magnify: 0,
      health: 0,
      scale: 0,
      abilities: [],
    }
  }
  const result: ActiveAttributes = {
    con: buildAttribute('con'),
    dex: buildAttribute('dex'),
    foc: buildAttribute('foc'),
    int: buildAttribute('int'),
    str: buildAttribute('str'),
  }
  solveAttributePlacingMods({
    stats: Object.entries(result).map(([key, stat]) => ({ key: key as AttributeRef, value: stat.total })),
    placingMods: attrsMagnify,
  }).forEach(({ key, value }) => {
    result[key].magnify = value
    result[key].total += value
  })

  Object.keys(result).forEach((key: 'dex') => {
    const value = result[key].total
    result[key].health = levels[key].find((it) => it.Level === value)?.Health
    result[key].scale = levels[key].find((it) => it.Level === value)?.ModifierValueSum
    result[key].abilities = levels[key]
      .filter((it) => it.Level <= value && it.EquipAbilities?.length)
      .map((it) => it.EquipAbilities)
      .flat()
  })
  return result
}

export function selectGearScore(items: EquippedItem[], level: number) {
  return getAverageGearScore(
    items.map((it) => ({ id: it.slot, gearScore: it.gearScore })),
    level,
  )
}

const REJECT_ABILITIES_WITH_PROPS: Array<keyof Ability> = [
  // unsupported trigger
  'OnAttachedSpellTargetDied',
  // 'AttachedTargetSpellIds',
  'OnBlockBreak',
  'OnContributedKill',
  //'OnCrit',
  //'OnCritTaken',
  'OnBlockedHit',
  'OnBlockedHitTaken',
  //'OnHit',
  'OnHitBehind',
  'OnHitTaken',
  'OnHitTakenWhileInvulnerable',
  //'OnHeadShot',
  'OnSelfDamage',
  'OnFatalDamageTaken',
  'OnDeath',
  'OnDeathsDoor',
  'OnEquipStatusEffect',
  'OnEventConditionalActivationChance',
  'OnEventPassiveConditionsPass',
  'OnExecuted',
  'OnGatheringComplete',
  'OnHasDied',
  //'OnHealed',
  'OnHealthChanged',
  'OnInActionLongEnough',
  'OnKill',
  'OnLegShot',
  'OnProjPassedThrough',
  'OnStatusEffectApplied',
  'StatusEffectBeingApplied',
  'OnTargetBlockBreak',
  'OnTargetSet',
  'OnTargetStatusEffectRemoved',
  'OnUsedConsumable',
  'OnWeaponSwap',
  'AfterAction',
  'AbilityTrigger',
  'AbilityList',
  'CheckStatusEffectsOnTargetOwned',
  // unsupported conditions
  'TargetCollisionFilters',
  'EquipLoadCategory',
  'ExcludeFromGameModes',
  'AbilityOnCooldownOptions',
  'AbilityCooldownComparisonType',
  'RequiredEquippedAbilityId',
  'DontHaveStatusEffect',
  // 'DamageTableRow',
  'DamageTableRowOverride',
  // 'DamageCategory',
  // 'DamageIsMelee',
  // 'DamageIsRanged',
  'InAction',
  'InActionTime',
  'TargetMarker',
  'MyMarker',
  'TargetHasGritActive',
  'StatusEffect',
  'StatusEffectComparison',
  'StatusEffectStackSize',
  'TargetStatusEffect',
  'TargetStatusEffectCategory',
  'TargetStatusEffectComparison',
  'TargetStatusEffectStackSize',
  // 'NumConsecutiveHits',
  // 'MaxConsecutiveHits',
  // 'ResetConsecutiveOnSuccess',
  'IgnoreResetConsecutiveOnDeath',
  // 'LoadedAmmoCount',
  // 'LoadedAmmoCountComparisonType',
  'PerStatusEffectOnTarget',
  'PerStatusEffectOnTargetMax',
  'PerStatusEffectOnSelf',
  'PerStatusEffectOnSelfMax',

  'RangedAttackName',
  'RangedAttackNameOverride',
  'ForceStatusEffectDamageTableRow',
  'StatusEffectDamageTableIdForRowOverride',
  'StatusEffectDamageTableRowOverride',

  'SetHealthOnFatalDamageTaken',
  'ResetTrackedOnSuccess',
  'RemoteDamageTableRow',
  'MaxTrackedHitCounts',
  'DisableApplyPerStatusEffectStack',
  'DisableCastSpellDurability',
  'DisableConsecutivePotency',
]

function isActiveAbility(ability: Ability, attack: Damagetable, state: MannequinState) {
  if (!ability || !attack) {
    return false
  }
  // if (ability.AbilityID === 'Passive_Greataxe_Mauler_DmgWhenFoesNear') {
  //   debugger
  // }
  if (!checkAllConditions(ability, state)) {
    return false
  }

  // filter by attack type: Light, Heavy, Ability, Magic
  if (ability.AttackType?.length) {
    if (!attack || !ability.AttackType.includes(attack.AttackType as any)) {
      return false
    }
  }

  if (ability.DamageIsMelee) {
    if (!ability.OnHit) {
      return false
    }
    if (attack?.IsRanged) {
      return false
    }
  }
  if (ability.DamageIsRanged) {
    if (!ability.OnHit) {
      return false
    }
    if (!attack?.IsRanged) {
      return false
    }
  }
  if (ability.DamageTableRow?.length) {
    if (!ability.DamageTableRow.includes(attack?.DamageID)) {
      return false
    }
    if (!ability.OnHit) {
      return false
    }
  }

  if (ability.CDRImmediatelyOptions === 'ActiveWeapon') {
    if (ability.OnHitTaken) {
      return true
    }
    if (ability.OnHit) {
      return true
    }
  }

  if (REJECT_ABILITIES_WITH_PROPS.some((key) => !!ability[key])) {
    return false
  }
  return true
}

function getAbilityScale(ability: Ability, state: MannequinState) {
  let scale = 1
  if (!ability) {
    return scale
  }
  if (ability.NumAroundMe && ability.MaxNumAroundMe) {
    return Math.max(1, Math.min(state.numAroundMe, ability.MaxNumAroundMe))
  }
  if (ability.AbilityID === 'Ultimate_Greataxe_Mauler') {
    return Math.max(1, Math.min(state.numHits, 10)) // TODO: read from effect
  }
  return scale
}

function getStatusEffectList(ids: string[], effects: Map<string, Statuseffect>) {
  const result: Statuseffect[] = []
  for (const id of ids || []) {
    const effect = effects.get(id)
    if (effect) {
      result.push(effect)
    } else {
      console.warn(`missing effect ${id}`)
    }
  }
  return result
}
