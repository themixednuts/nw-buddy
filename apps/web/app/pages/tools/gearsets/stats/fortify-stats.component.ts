import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { groupBy, sumBy } from 'lodash'
import { NwModule } from '~/nw'
import { Mannequin } from '~/nw/mannequin'
import { ModifierResult } from '~/nw/mannequin/modifier'
import { damageTypeIcon } from '~/nw/weapon-types'
import { TooltipModule } from '~/ui/tooltip'
import { ModifierTipComponent } from './modifier-tip.component'
import { LIST_COUNT_ANIMATION } from './utils/animation'
import { FlashDirective } from './utils/flash.directive'

@Component({
  standalone: true,
  selector: 'nwb-fortify-stats',
  templateUrl: './fortify-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, TooltipModule, ModifierTipComponent, FlashDirective],
  host: {
    class: 'block',
    '[class.hidden]': '!rowCount()',
  },
  animations: [LIST_COUNT_ANIMATION],
})
export class FortifyStatsComponent {
  private mannequin = inject(Mannequin)
  private absStat = toSignal(this.mannequin.statAbs$)
  private armorStat = toSignal(this.mannequin.statArmor$)

  protected damageTypes = computed(() => {
    return collect(this.absStat()?.DamageCategories)
  })
  protected vitalTypes = computed(() => {
    return collect(this.absStat()?.VitalsCategories)
  })
  protected physicalArmor = computed(() => {
    return this.armorStat()?.PhysicalArmor
  })
  protected elementalArmor = computed(() => {
    return this.armorStat()?.ElementalArmor
  })
  protected hasStats = computed(() => {
    return this.rowCount() > 0
  })
  protected rowCount = computed(() => {
    return (
      (this.damageTypes()?.length || 0) +
      (this.vitalTypes()?.length || 0) +
      (this.physicalArmor()?.value ? 1 : 0) +
      (this.elementalArmor()?.value ? 1 : 0)
    )
  })
}

function collect(data: Record<string, ModifierResult> | null) {
  const entires = Object.entries(data || {})
    .map(([key, entry]) => {
      return {
        category: key,
        source: entry.source,
        value: entry.value,
        capped: sumBy(entry.source, (it) => it.value * it.scale) > entry.value,
        icon: damageTypeIcon(key),
      }
    })
    .filter((it) => !!it.value)

  const groups = groupBy(entires, (it) => it.value)

  return Object.entries(groups).map(([value, entries]) => {
    return {
      value: Number(value),
      entries: entries,
      track: entries.map((it) => it.category).join(',')
    }
  })
}
