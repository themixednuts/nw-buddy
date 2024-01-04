import { Directive, inject, Input } from '@angular/core'
import { ZoneDetailStore } from './zone-detail.store'

@Directive({
  standalone: true,
  selector: '[nwbZoneDetail]',
  exportAs: 'zoneDetail',
  providers: [ZoneDetailStore],
})
export class ZoneDetailDirective {
  public readonly store = inject(ZoneDetailStore)

  @Input()
  public set nwbZoneDetail(value: string | number) {
    this.store.patchState({ recordId: value })
  }

  @Input()
  public set markVital(value: string) {
    this.store.patchState({ markedVitalId: value })
  }

}
