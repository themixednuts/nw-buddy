import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, computed, effect, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { NW_MAX_ENEMY_LEVEL, getVitalCategoryInfo, getVitalFamilyInfo, getVitalTypeMarker } from '@nw-data/common'
import { interval, map, takeUntil } from 'rxjs'
import { NwModule } from '~/nw'
import { humanize, mapProp, selectSignal } from '~/utils'
import { VitalDetailStore } from './vital-detail.store'
import { TooltipModule } from '~/ui/tooltip'
import { GsInputComponent, GsSliderComponent } from '~/ui/gs-input'
import { FormsModule } from '@angular/forms'
import { LayoutModule } from '~/ui/layout'
import { patchState } from '@ngrx/signals'

@Component({
  standalone: true,
  selector: 'nwb-vital-detail-header',
  templateUrl: './vital-detail-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, RouterLink, TooltipModule, LayoutModule, GsSliderComponent, FormsModule],
  host: {
    class: 'relative flex flex-col items-center justify-center p-2'
  }
})
export class VitalDetailHeaderComponent {
  @Input()
  public editableLevel = false
  protected levelEditorOpen = false
  protected store = inject(VitalDetailStore)
  protected minLevel = 1
  protected maxLevel = NW_MAX_ENEMY_LEVEL
  protected id = this.store.vitalId
  protected name = this.store.displayName
  protected aliasNames = this.store.aliasNames
  protected health = this.store.health
  protected level = this.store.level
  protected typeMarker = selectSignal(this.store.vital, getVitalTypeMarker)
  protected familyInfo = selectSignal(this.store.vital, getVitalFamilyInfo)
  protected categoryInfos = selectSignal(this.store.vital, getVitalCategoryInfo)
  protected familyIcon = computed(() => this.categoryInfos()?.[0]?.IconBane)

  protected setLevel(value: number) {
    patchState(this.store, { levelOverride: value })
  }
}
