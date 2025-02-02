import { ItemRarity, NW_FALLBACK_ICON, getItemIconPath, getItemId, getItemRarity, isHousingItem } from '@nw-data/common'
import { EntitlementData } from '@nw-data/generated'
import { Observable, map, of } from 'rxjs'
import { NwDataService } from '~/data'
import { NwLinkResource } from '~/nw'
import { combineLatestOrEmpty, humanize } from '~/utils'

export interface EntitlementReward {
  label: string
  icon: string
  tip?: string
  link?: [NwLinkResource, string]
  rarity?: ItemRarity
}

export function selectEntitlementRewards(
  entitlement: EntitlementData,
  db: NwDataService,
): Observable<EntitlementReward[]> {
  if (!entitlement || !entitlement['Reward(s)']?.length) {
    return of([])
  }

  switch (entitlement.RewardType) {
    case 'CampSkin':
    case 'HousingItem':
    case 'InventoryItem':
    case 'ItemDye':
    case 'ItemMountDye':
    case 'ItemSkin':
    case 'Loadout':
    case 'MountAttachment': {
      return combineLatestOrEmpty(entitlement['Reward(s)'].map((id) => db.itemOrHousingItem(id))).pipe(
        map((items) => {
          return items.map((item): EntitlementReward => {
            return {
              label: item.Name,
              icon: getItemIconPath(item) || NW_FALLBACK_ICON,
              link: [isHousingItem(item) ? 'housing' : 'item', getItemId(item)],
              rarity: getItemRarity(item),
            }
          })
        }),
      )
    }
    case 'Emote': {
      return combineLatestOrEmpty(entitlement['Reward(s)'].map((id) => db.emote(id))).pipe(
        map((items) => {
          return items.map((item): EntitlementReward => {
            return {
              label: item.DisplayName,
              icon: item.UiImage || NW_FALLBACK_ICON,
              link: ['emote', item.UniqueTagID],
            }
          })
        }),
      )
    }
    case 'Mount': {
      return combineLatestOrEmpty(entitlement['Reward(s)'].map((id) => db.mount(id))).pipe(
        map((items) => {
          return items.map((item): EntitlementReward => {
            return {
              label: item.DisplayName,
              icon: item.IconPath || NW_FALLBACK_ICON,
              link: ['mount', item.MountId],
            }
          })
        }),
      )
    }
    case 'PlayerTitle': {
      return combineLatestOrEmpty(entitlement['Reward(s)'].map((id) => db.playerTitle(id))).pipe(
        map((items) => {
          return items.map((item): EntitlementReward => {
            return {
              label: item.TitleMale,
              icon: NW_FALLBACK_ICON,
              link: ['player-title', item.TitleID],
            }
          })
        }),
      )
    }
    case 'StatusEffect': {
      return combineLatestOrEmpty(entitlement['Reward(s)'].map((id) => db.statusEffect(id))).pipe(
        map((items) => {
          return items.map((item): EntitlementReward => {
            return {
              label: item.DisplayName,
              icon: item.PlaceholderIcon || NW_FALLBACK_ICON,
              link: ['status-effect', item.StatusID],
            }
          })
        }),
      )
    }
    case 'Entitlement':
    case 'Expansion2023':
    case 'FictionalCurrency':
    case 'Misc':
    case 'GuildCrest': // TODO: add crests
    case 'SeasonsRewards': // TODO: review
    case 'Service': // TODO: add store
    case 'TransmogToken':
    case 'WorldId':
    default: {
      return of([
        {
          label: entitlement.DisplayName || entitlement.Notes || humanize(entitlement.RewardType),
          icon: NW_FALLBACK_ICON,
          tip: entitlement.Description,
        },
      ])
    }
  }
}
