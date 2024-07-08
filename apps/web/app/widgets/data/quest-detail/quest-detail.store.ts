import { Injectable } from '@angular/core'
import { ComponentStore } from '@ngrx/component-store'
import { getItemIconPath, getItemId, getItemRarity, getQuestRequiredAchuevmentIds, getQuestTypeIcon, isHousingItem } from '@nw-data/common'
import { HouseItems, MasterItemDefinitions, Objectives } from '@nw-data/generated'
import { flatten } from 'lodash'
import { NwDataService } from '~/data'
import { humanize } from '~/utils'
import { GameEventReward, selectGameEventRewards } from '../game-event-detail/selectors'
import { FollowUpQuest } from './types'

@Injectable()
export class QuestDetailStore extends ComponentStore<{ questId: string }> {
  public readonly questId$ = this.select(({ questId }) => questId)

  public readonly quest$ = this.select(this.db.quest(this.questId$), (it) => it)
  public readonly title$ = this.select(this.quest$, (it) => it?.Title || humanize(it?.ObjectiveID))
  public readonly type$ = this.select(this.quest$, (it) => it?.Type)
  public readonly schedule$ = this.select(this.quest$, (it) => it?.ScheduleId)
  public readonly npcDestinationId$ = this.select(this.quest$, (it) => it?.NpcDestinationId)
  public readonly npcDestination$ = this.select(this.db.npc(this.npcDestinationId$), (it) => it)
  public readonly description$ = this.select(this.quest$, (it) => it?.Description)
  public readonly level$ = this.select(this.quest$, (it) => it?.DifficultyLevel)
  public readonly levelLabel$ = this.select(this.level$, (lvl) => (lvl ? `lvl. ${lvl}` : ''))
  public readonly prompt$ = this.select(this.quest$, (it) => it?.PlayerPrompt)
  public readonly response$ = this.select(this.quest$, (it) => it?.ObjectiveProposalResponse)
  public readonly inProgressResponse$ = this.select(this.quest$, (it) => it?.InProgressResponse)
  public readonly icon$ = this.select(this.quest$, (it) => getQuestTypeIcon(it?.Type))
  public readonly followup$ = this.select(this.quest$, this.db.questsByRequiredAchievementIdMap, selectFollowupQuests)
  public readonly previous$ = this.select(this.quest$, this.db.questsByAchievementIdMap, selectPreviousQuests)
  public readonly eventId$ = this.select(this.quest$, (it) => it?.SuccessGameEventId)
  public readonly event$ = this.select(this.db.gameEvent(this.eventId$), (it) => it)
  public readonly eventStatusEffectId$ = this.select(this.event$, (it) => it?.StatusEffectId)
  public readonly eventStatusEffect$ = this.select(this.db.statusEffect(this.eventStatusEffectId$), (it) => it)
  public readonly eventItemRewardId$ = this.select(this.event$, (it) => it?.ItemReward)
  public readonly eventItemReward$ = this.select(this.db.itemOrHousingItem(this.eventItemRewardId$), (it) => it)
  public readonly eventRewards$ = this.select(this.event$, this.eventItemReward$, selectGameEventRewards)
  public readonly rewardItemId$ = this.select(this.quest$, (it) => it?.ItemRewardName)
  public readonly rewardItem$ = this.select(this.db.itemOrHousingItem(this.rewardItemId$), (it) => it)
  public readonly rewardItemQty$ = this.select(this.quest$, (it) => it?.ItemRewardQty)
  public readonly reward$ = this.select(this.rewardItem$, this.rewardItemQty$, selectReward)
  public readonly rewards$ = this.select(this.eventRewards$, this.reward$, selectRewards)


  public readonly previousQuests$ = this.select(this.previous$, (list) => {
    if (!list?.length) {
      return null
    }
    return list?.map((it) => {
      return {
        quest: it,
        id: it?.ObjectiveID,
        icon: getQuestTypeIcon(it?.Type),
        title: it?.Title || humanize(it?.ObjectiveID),
      }
    })
  })

  public constructor(protected db: NwDataService) {
    super({ questId: null })
  }

  public update(questId: string) {
    this.patchState({ questId: questId })
  }
}

function selectFollowupQuests(
  quest: Objectives,
  questsByRequiredAchievementId: Map<string, Objectives[]>
): FollowUpQuest[] {
  if (!quest.AchievementId) {
    return null
  }
  const quests = questsByRequiredAchievementId.get(quest.AchievementId)
  if (!quests?.length) {
    return null
  }

  return quests.map((it) => {
    return {
      quest: it,
      next: selectFollowupQuests(it, questsByRequiredAchievementId),
    }
  })
}

function selectPreviousQuests(quest: Objectives, questsByAchievementId: Map<string, Objectives[]>): Objectives[] {
  const quests = getQuestRequiredAchuevmentIds(quest).map((id) => questsByAchievementId.get(id) || [])
  return flatten(quests)
}

function selectReward(item: MasterItemDefinitions | HouseItems, qty: number): GameEventReward {
  if (!item) {
    return null
  }
  return {
    icon: getItemIconPath(item),
    rarity: getItemRarity(item),
    label: item.Name,
    quantity: qty,
    link: [
      isHousingItem(item) ? 'housing' : 'item',
      getItemId(item)
    ]
  }
}
function selectRewards(event: GameEventReward[], reward: GameEventReward): GameEventReward[] {
  const result = []
  if (event?.length) {
    result.push(...event)
  }
  if (reward) {
    result.push(reward)
  }
  if (result.length === 0) {
    return null
  }
  return result
}
