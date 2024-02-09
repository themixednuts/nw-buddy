import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone'
import { debounceTime, filter } from 'rxjs'
import { GearsetRecord } from '~/data'
import { NwModule } from '~/nw'
import { ShareService } from '~/pages/share'
import { VirtualGridModule } from '~/ui/data/virtual-grid'
import { IconsModule } from '~/ui/icons'
import { svgFileImport, svgPlus } from '~/ui/icons/svg'
import { ConfirmDialogComponent, ModalService, PromptDialogComponent } from '~/ui/layout'
import { NavbarModule } from '~/ui/nav-toolbar'
import { QuicksearchModule, QuicksearchService } from '~/ui/quicksearch'
import { TooltipModule } from '~/ui/tooltip'
import { GearsetsListPageStore } from './gearsets-list-page.store'
import { GearsetLoadoutItemComponent, GearsetLoadoutListComponent } from './loadout'

@Component({
  standalone: true,
  selector: 'nwb-gearsets-list-page',
  templateUrl: './gearsets-list-page.component.html',
  imports: [
    CommonModule,
    RouterModule,
    NwModule,
    QuicksearchModule,
    NavbarModule,
    IconsModule,
    TooltipModule,
    IonHeader,
    IonToolbar,
    IonContent,
    GearsetLoadoutListComponent,
    VirtualGridModule,
    GearsetLoadoutItemComponent,
  ],
  providers: [QuicksearchService, GearsetsListPageStore],
  host: {
    class: 'ion-page',
  },
})
export class GearsetsListPageComponent {
  protected iconCreate = svgPlus
  protected iconImport = svgFileImport

  private store = inject(GearsetsListPageStore)
  private quicksearch = inject(QuicksearchService)
  private modal = inject(ModalService)
  private router = inject(Router)
  private share = inject(ShareService)

  protected get tags() {
    return this.store.filterTags()
  }

  protected get items() {
    return this.store.filteredRecords()
  }

  public constructor() {
    this.store.connectDB()
    this.store.connectFilterQuery(this.quicksearch.query$.pipe(debounceTime(500)))
  }

  protected async handleCreate() {
    PromptDialogComponent.open(this.modal, {
      inputs: {
        title: 'Create new set',
        body: 'Name for the new gearset',
        value: `New Gearset`,
        positive: 'Create',
        negative: 'Cancel',
      },
    })
      .result$.pipe(filter((it) => !!it))
      .subscribe((newName) => {
        this.store.createRecord({
          id: null,
          name: newName,
        })
      })
  }

  protected handleDelete(gearset: GearsetRecord) {
    ConfirmDialogComponent.open(this.modal, {
      inputs: {
        title: 'Delete Gearset',
        body: 'Are you sure you want to delete this gearset?',
        positive: 'Delete',
        negative: 'Cancel',
      },
    })
      .result$.pipe(filter((it) => !!it))
      .subscribe(() => {
        this.store.destroyRecord(gearset.id)
      })
  }

  protected async handleImport() {
    this.share.importItem(this.modal, this.router)
  }

  protected toggleTag(value: string) {
    this.store.toggleFilterTag(value)
  }
}
