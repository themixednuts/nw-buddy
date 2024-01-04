import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ViewChild, computed, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router'
import { IonHeader } from '@ionic/angular/standalone'
import { NwModule } from '~/nw'
import { DataViewModule, DataViewService, provideDataView } from '~/ui/data/data-view'
import { DataGridModule } from '~/ui/data/table-grid'
import { VirtualGridModule } from '~/ui/data/virtual-grid'
import { IconsModule } from '~/ui/icons'
import { QuicksearchModule, QuicksearchService } from '~/ui/quicksearch'
import { TooltipModule } from '~/ui/tooltip'
import { HtmlHeadService, eqCaseInsensitive, injectUrlParams, selectSignal } from '~/utils'
import { ItemTableRecord } from '~/widgets/data/item-table'
import { ZoneDetailModule } from '~/widgets/data/zone-detail'
import { ZoneTableAdapter } from '~/widgets/data/zone-table'
import { ScreenshotModule } from '~/widgets/screenshot'

@Component({
  standalone: true,
  selector: 'nwb-zones-page',
  templateUrl: './zones-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DataGridModule,
    DataViewModule,
    IonHeader,
    NwModule,
    QuicksearchModule,
    RouterModule,
    ScreenshotModule,
    TooltipModule,
    VirtualGridModule,
    IconsModule,
    ZoneDetailModule,
  ],
  host: {
    class: 'layout-col',
  },
  providers: [
    provideDataView({
      adapter: ZoneTableAdapter,
    }),
    QuicksearchService.provider({
      queryParam: 'search',
    }),
  ],
})
export class ZonePageComponent {
  protected title = 'Zones'
  protected defaultRoute = 'table'
  protected filterParam = 'filter'
  protected selectionParam = 'id'
  protected persistKey = 'zone-table'
  private urlParams$ = injectUrlParams('/zones/:category/:id/:vitalId')
  protected zoneIdParam = selectSignal(this.urlParams$, (it) => it?.['id'])
  protected vitalIdParam = selectSignal(this.urlParams$, (it) => it?.['vitalId'])
  protected categoryParam = selectSignal(this.urlParams$, (it) => it?.['category'])
  protected category = computed(() => {
    const category = this.categoryParam()
    return eqCaseInsensitive(category, this.defaultRoute) ? null : category
  })
  protected router = inject(Router)
  protected route = inject(ActivatedRoute)

  @ViewChild(RouterOutlet, { static: true })
  protected outlet: RouterOutlet

  public constructor(
    protected service: DataViewService<ItemTableRecord>,
    protected search: QuicksearchService,
    head: HtmlHeadService,
  ) {
    service.patchState({ mode: 'table', modes: ['table'] })
    head.updateMetadata({
      url: head.currentUrl,
      title: 'New World - Territories and POIs DB',
    })
  }

  protected onZoneClicked(zoneId: string) {
    this.router.navigate(['/zones/table', zoneId])
  }

  protected onVitalClicked(vitalId: string) {
    this.router.navigate(['/zones/table', this.zoneIdParam(), vitalId || ''])
  }
}
