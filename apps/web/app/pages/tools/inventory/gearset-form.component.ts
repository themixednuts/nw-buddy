import { Dialog, DialogModule } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Injector, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { EQUIP_SLOTS, EquipSlot } from '@nw-data/common'
import { filter, map, switchMap, take } from 'rxjs'
import { GearsetSignalStore, GearsetsDB, ItemInstanceRecord } from '~/data'
import { NwModule } from '~/nw'
import { PreferencesService } from '~/preferences'
import { DataViewPicker } from '~/ui/data/data-view'
import { IconsModule } from '~/ui/icons'
import {
  svgChevronLeft,
  svgEllipsisVertical,
  svgFolderOpen,
  svgLink,
  svgPaste,
  svgPlus,
  svgSquareArrowUpRight,
  svgTrashCan,
  svgXmark,
} from '~/ui/icons/svg'
import { LayoutModule, PromptDialogComponent } from '~/ui/layout'
import { TooltipModule } from '~/ui/tooltip'
import { GearsetLoadoutItemComponent, LoadoutSlotEventHandler } from '~/widgets/data/gearset-detail'
import { GearsetTableAdapter } from '~/widgets/data/gearset-table'
import { ItemDetailModule } from '~/widgets/data/item-detail'
import { GearsetFormSlotHandler } from './gearset-form-slot-handler'

@Component({
  standalone: true,
  selector: 'nwb-gearset-form',
  templateUrl: './gearset-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NwModule,
    DialogModule,
    LayoutModule,
    IconsModule,
    ItemDetailModule,
    RouterModule,
    TooltipModule,
    GearsetLoadoutItemComponent,
  ],
  providers: [
    GearsetSignalStore,
    GearsetFormSlotHandler,
    {
      provide: LoadoutSlotEventHandler,
      useExisting: GearsetFormSlotHandler,
    },
  ],
  host: {
    class: 'block',
  },
})
export class GearsetFormComponent {
  public slots = EQUIP_SLOTS.filter((it) => it.itemType !== 'Consumable')

  public get gearset() {
    return this.store.gearset()
  }
  public get isLinkMode() {
    return this.store.isLinkMode()
  }
  public get isCopyMode() {
    return this.store.isCopyMode()
  }

  protected iconOpen = svgFolderOpen
  protected iconCreate = svgPlus
  protected iconDelete = svgTrashCan
  protected iconClose = svgXmark
  protected iconMenu = svgEllipsisVertical
  protected iconBack = svgChevronLeft
  protected iconLink = svgLink
  protected iconCopy = svgPaste
  protected iconNav = svgSquareArrowUpRight

  private currentId = this.pref.session.storageProperty<string>('recent-gearset-id')
  private store = inject(GearsetSignalStore)

  public constructor(
    private gearDb: GearsetsDB,
    private dialog: Dialog,
    private injector: Injector,
    private pref: PreferencesService,
    slotEventHandler: GearsetFormSlotHandler,
  ) {
    this.store.connectGearsetDB(this.currentId.observe())
    slotEventHandler.itemDropped.subscribe((it) => this.onItemDropped(it.slot, it.item))
  }

  protected createSet() {
    PromptDialogComponent.open(this.dialog, {
      data: {
        title: 'Create new set',
        body: 'Give this set a name',
        input: 'New Gearset',
        positive: 'Create',
        negative: 'Cancel',
      },
    })
      .closed.pipe(filter((it) => !!it))
      .pipe(
        switchMap((newName) => {
          return this.gearDb.create({
            id: null,
            name: newName,
            slots: {},
            tags: [],
          })
        }),
      )
      .subscribe((newSet) => {
        this.currentId.set(newSet.id)
      })
  }

  protected unloadSet() {
    this.currentId.set(null)
  }

  protected loadSet() {
    this.pickGearsetId().subscribe((id) => {
      this.currentId.set(id)
    })
  }

  private pickGearsetId() {
    return DataViewPicker.open(this.dialog, {
      title: 'Choose a set',
      dataView: {
        adapter: GearsetTableAdapter,
      },
      config: {
        maxWidth: 1024,
        maxHeight: 1024,
        panelClass: ['w-full', 'h-full', 'p-4'],
        injector: this.injector,
      },
    })
      .closed.pipe(map((it) => it?.[0] as string))
      .pipe(filter((it) => it != null))
      .pipe(take(1))
  }

  protected updateName(name: string) {
    this.store.patchGearset({ name: name })
  }

  protected updateMode(mode: 'link' | 'copy') {
    this.store.patchGearset({ createMode: mode })
  }

  protected onItemRemove(slot: EquipSlot) {
    this.store.updateSlot(slot.id, null)
  }

  protected async onItemUnlink(slot: EquipSlot, record: ItemInstanceRecord) {
    this.store.updateSlot(slot.id, {
      gearScore: record.gearScore,
      itemId: record.itemId,
      perks: record.perks,
    })
  }

  protected async onItemDropped(slot: EquipSlot, record: ItemInstanceRecord) {
    if (this.store.isLinkMode()) {
      this.store.updateSlot(slot.id, record.id)
    } else {
      this.store.updateSlot(slot.id, {
        gearScore: record.gearScore,
        itemId: record.itemId,
        perks: record.perks,
      })
    }
  }
}
