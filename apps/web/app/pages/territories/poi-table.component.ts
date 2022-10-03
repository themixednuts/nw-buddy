import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NwModule } from '~/nw'
import { DataTableAdapter, DataTableModule } from '~/ui/data-table'
import { QuicksearchService } from '~/ui/quicksearch'
import { PoiTableAdapter } from './poi-table-adapter'

@Component({
  standalone: true,
  selector: 'nwb-poi-table',
  templateUrl: './poi-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, DataTableModule, RouterModule],
  providers: [DataTableAdapter.provideClass(PoiTableAdapter), QuicksearchService],
  host: {
    class: 'layout-row gap-4',
  },
})
export class PoiTableComponent {
  public constructor(public search: QuicksearchService) {
    //
  }
}
