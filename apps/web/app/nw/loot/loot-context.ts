import { CaseInsensitiveMap, CaseInsensitiveSet } from '~/utils'
import { LootBucketRow, LootTableEntry, LootTableRow } from '../utils'

export type LootBucketConditionNames =
  | 'Level'
  | 'EnemyLevel'
  | 'MinContLevel'
  // watermark
  | 'HWMBlunderbuss'
  | 'HWMLoot2HAxe'
  | 'HWMLoot2HHammer'
  | 'HWMLootAmulet'
  | 'HWMLootBow'
  | 'HWMLootChest'
  | 'HWMLootFeet'
  | 'HWMLootFireStaff'
  | 'HWMLootHands'
  | 'HWMLootHatchet'
  | 'HWMLootHead'
  | 'HWMLootIceMagic'
  | 'HWMLootLegs'
  | 'HWMLootLifeStaff'
  | 'HWMLootMusket'
  | 'HWMLootRapier'
  | 'HWMLootRing'
  | 'HWMLootShield'
  | 'HWMLootSpear'
  | 'HWMLootSword'
  | 'HWMLootToken'
  | 'HWMLootVoidGauntlet'

export type LootTableConditionNames = 'Level' | 'EnemyLevel' | 'MinPOIContLevel' // zone

export type LootTableTags =
  | 'GlobalMod'
  // mobs
  | 'Common'
  | 'Elite'
  | 'Named'
  | 'Goblin'
  // dungeons
  | 'Amrine'
  | 'CutlassKeys00'
  | 'Ebonscale00'
  | 'Ebonscale00_Mut'
  | 'Edengrove00'
  | 'Reekwater00'
  | 'RestlessShores01'
  | 'ShatterMtn00'
  | 'ShatteredObelisk'
  | 'MutDiff'
  // dungeon mutations
  | 'Fire'
  | 'Ice'
  | 'Void'
  | 'Nature'
  // fishing
  | 'FishRarity'
  | 'FishSize'
  | 'Fresh'
  | 'Salt'
  | 'SummerFishRarity'
  | 'LootTableDiverted'
  // gypsum conditions
  | 'GypsumBlack'
  | 'GypsumBlue'
  | 'GypsumYellow'

export class LootContext {
  /**
   * Tags in this context
   */
  public readonly tags: Set<string>

  /**
   * Condition values in this context
   */
  public readonly values: Map<string, number | string>

  /**
   * Table and bucket ids to ignore
   */
  public ignoreTablesAndBuckets: string[]

  /**
   * Collect only bucket items that have one of these tags
   */
  public bucketTags: string[]

  public constructor(options: { tags: string[]; values: Record<string, number | string> }) {
    this.tags = new CaseInsensitiveSet(options.tags || [])
    this.values = new CaseInsensitiveMap(Object.entries(options.values || {}))
  }

  public static create(options: {
    tags: string[]
    values: Partial<Record<LootBucketConditionNames | LootTableConditionNames, number | string>>
  }) {
    return new LootContext(options)
  }

  /**
   * Resolves accessible items from given loottable
   */
  public accessLoottable(table: LootTableEntry) {
    if (this.isIgnoredId(table.LootTableID)) {
      return []
    }
    const tags = table.Conditions
    if (!tags?.length) {
      return [...table.Items]
    }
    return table.Items.filter((item) => {
      return tags.every((tag) => testTableRowCondition(tag, this, item))
    })
  }

  /**
   * Checks whether this context can access the given loot table
   */
  public accessTable(table: LootTableEntry): boolean {
    if (this.isIgnoredId(table.LootTableID)) {
      return false
    }
    const tags = table.Conditions
    if (!tags?.length) {
      return true
    }
    return tags.every((tag) => testTableCondition(tag, this))
  }

  /**
   * Checks whether this context can access the given loot table row
   */
  public accessTableRow(table: LootTableEntry, row: LootTableRow): boolean {
    if (this.isIgnoredId(table.LootTableID)) {
      return false
    }
    const tags = table.Conditions
    if (!tags?.length) {
      return true
    }
    return tags.every((tag) => testTableRowCondition(tag, this, row))
  }

  /**
   * Checks whether this context can access the given lootbucket
   */
  public accessBucketRow(entry: LootBucketRow): boolean {
    if (this.isIgnoredId(entry.LootBucket) || this.isExcludedEntry(entry)) {
      return false
    }
    const tags = Array.from(entry.Tags.keys())
    if (entry.MatchOne) {
      for (const tag of tags) {
        if (testBucketCondition(tag, this, entry)) {
          return true
        }
      }
      return false
    } else {
      for (const tag of tags) {
        if (!testBucketCondition(tag, this, entry)) {
          return false
        }
      }
      return true
    }
  }

  private isIgnoredId(tableOrBucketId: string) {
    return this.ignoreTablesAndBuckets?.includes(tableOrBucketId)
  }

  private isExcludedEntry(entry: LootBucketRow) {
    if (!this.bucketTags) {
      return false
    }
    return !this.bucketTags.some((tag) => entry.Tags.has(tag))
  }
}

function testTableCondition(condition: string, context: LootContext) {
  if (!condition) {
    return true
  }
  return context.tags.has(condition) || context.values.has(condition)
}

function testTableRowCondition(condition: string, context: LootContext, item: LootTableRow) {
  if (!condition) {
    return true
  }
  if (context.values.has(condition)) {
    return context.values.get(condition) >= Number(item.Prob)
  }
  return context.tags.has(condition)
}

function testBucketCondition(condition: string, context: LootContext, item: LootBucketRow) {
  if (!condition) {
    return true
  }
  if (context.values.has(condition)) {
    const tag = item.Tags?.get(condition)
    const value = context.values.get(condition)
    switch (tag?.Value?.length) {
      case 1: {
        return tag.Value[0] <= Number(value)
      }
      case 2: {
        return tag.Value[0] <= Number(value) && Number(value) <= tag.Value[1]
      }
    }
  }
  return context.tags.has(condition)
}
