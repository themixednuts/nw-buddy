import { Component, EventEmitter, Output, effect, inject, input, output, untracked, viewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { VitalsBaseData, VitalsLevelVariantData } from '@nw-data/generated'
import { NwModule } from '~/nw'
import { IconsModule } from '~/ui/icons'
import { svgDice, svgExpand, svgFire } from '~/ui/icons/svg'
import { TooltipModule } from '~/ui/tooltip'
import { GameMapComponent, GameMapCoordsComponent, GameMapLayerDirective } from '~/widgets/game-map'
import { VitalDetailMapStore, VitalMapFeature, VitalMapFeatureProperties } from './vital-detail-map.store'

@Component({
  standalone: true,
  selector: 'nwb-vital-detail-map',
  templateUrl: './vital-detail-map.component.html',
  imports: [
    FormsModule,
    GameMapComponent,
    GameMapCoordsComponent,
    GameMapLayerDirective,
    IconsModule,
    NwModule,
    TooltipModule,
  ],
  providers: [VitalDetailMapStore],
  host: {
    class: 'block rounded-md overflow-clip relative',
    '[class.hidden]': '!isVisible',
  },
})
export class VitalDetailMapComponent {
  protected store = inject(VitalDetailMapStore)

  public vitalClicked = output<VitalMapFeatureProperties>()
  protected iconExpand = svgExpand
  protected iconFire = svgFire
  protected iconDice = svgDice

  protected mapComponent = viewChild(GameMapComponent)
  public vitalId = input.required<string>()
  protected get isVisible() {
    return !!this.store.mapId()
  }

  public constructor() {
    effect(() => {
      const id = this.vitalId()
      untracked(() => this.store.load({ id }))
    })
  }

  protected onFeatureClicked(features: VitalMapFeature[]){
    const lookup = this.store.lookup()
    const feature = features?.[0]
    const properties = lookup[feature?.id]?.properties
    this.vitalClicked.emit(properties)
  }
}
