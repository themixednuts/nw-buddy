import { CommonModule, DecimalPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, inject, input, viewChild } from '@angular/core'
import { patchState } from '@ngrx/signals'
import saveAs from 'file-saver'
import { NwModule } from '~/nw'
import { IconsModule } from '~/ui/icons'
import { svgDownload } from '~/ui/icons/svg'
import { ItemFrameModule } from '~/ui/item-frame'
import { TooltipModule } from '~/ui/tooltip'
import { GatherableDetailMapComponent } from './gatherable-detail-map.component'
import { GatherableDetailStore } from './gatherable-detail.store'

@Component({
  standalone: true,
  selector: 'nwb-gatherable-detail',
  template: '<ng-content/>',
  exportAs: 'detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, GatherableDetailMapComponent, IconsModule, TooltipModule],
  providers: [DecimalPipe, GatherableDetailStore],
  host: {
    class: 'block',
  },
})
export class GatherableDetailComponent {
  protected store = inject(GatherableDetailStore)
  protected map = viewChild(GatherableDetailMapComponent)

  public showMap = input(false)
  public showProps = input(false)

  @Input()
  public set gatherableId(value: string) {
    patchState(this.store, { gatherableId: value })
  }


  public get tradeSkill() {
    return this.store.tradeSkill()
  }
  public get sizeSiblings() {
    return this.store.sizeSiblings()
  }
  public get variations() {
    return this.store.variations()
  }
  public get lootTable() {
    return this.store.lootTable()
  }
  public get lootTables() {
    return this.store.lootTables()
  }
  public get gatherableIds() {
    return this.store.idsForMap()
  }
  public get gameEvent() {
    return this.store.gameEvent()
  }
  protected iconDownload = svgDownload

  protected downloadPositions() {
    // const data = this.map().spawns()
    // const fileName = `${this.gatherableId}.json`
    // const object = {
    //   gatherableID: this.gatherableId,
    //   points: data.points,
    // }
    // const blob = new Blob([JSON.stringify(object, null, 2)], {
    //   type: 'application/json',
    // })
    // saveBlobToFile(blob, fileName)
  }
}
