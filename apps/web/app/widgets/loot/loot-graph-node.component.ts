import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ComponentStore } from '@ngrx/component-store'
import { LootTable } from '@nw-data/common'
import { NwModule } from '~/nw'
import { LootBucketNode, LootBucketRowNode, LootNode, LootTableItemNode, LootTableNode } from '~/nw/loot/loot-graph'
import { IconsModule } from '~/ui/icons'
import { svgAngleLeft, svgBucket, svgCircleExclamation, svgCode, svgLink, svgLock, svgLockOpen, svgTableList } from '~/ui/icons/svg'
import { PaginationModule } from '~/ui/pagination'
import { TooltipModule } from '~/ui/tooltip'

import { VirtualGridModule, VirtualGridOptions } from '~/ui/data/virtual-grid'
import { PropertyGridModule } from '~/ui/property-grid'
import { eqCaseInsensitive } from '~/utils'
import { ItemDetailHeaderComponent } from '../data/item-detail/item-detail-header.component'
import { ItemDetailComponent } from '../data/item-detail/item-detail.component'
import { LootGraphGridCellComponent } from './loot-graph-grid-cell.component'
import { animate, style, transition, trigger } from '@angular/animations'

export interface LootGraphNodeState<T = LootNode> {
  node: T
  showLocked: boolean
  showChance: boolean
  expand: boolean
  showLink: boolean
}

export interface LootGraphNodeVM {
  chanceAbs: number
  chanceRel: number
  childGrid: boolean
  children: LootNode[]
  childrenAreItems: boolean
  displayName: string
  expandable: boolean
  highlight: boolean
  itemId: string
  itemIds: string[]
  itemQuantity: string
  itemTags: string[]
  lootNode: LootNode
  rollThreshold: string
  table: LootTable
  tagValue: string
  totalItemCount: number
  typeName: string
  unlocked: boolean
  unlockedItemCount: number
  link?: any[]

  showLocked: boolean
  showChance: boolean
  expand: boolean
  showLink: boolean

  gridOptions: VirtualGridOptions<LootNode>
}

@Component({
  standalone: true,
  selector: 'nwb-loot-graph-node',
  templateUrl: './loot-graph-node.component.html',
  styleUrls: ['./loot-graph-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NwModule,
    IconsModule,
    ItemDetailComponent,
    ItemDetailHeaderComponent,
    TooltipModule,
    RouterModule,
    PaginationModule,
    VirtualGridModule,
    PropertyGridModule,
  ],
  host: {
    class: 'contents',
  },
  animations: [
    trigger('childContainer', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('0.15s ease-out', style({ height: '*' })),
        animate('0.15s ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: '*' }),
        animate('0.15s ease-out', style({ opacity: 0 })),
        animate('0.15s ease-out', style({ height: 0 })),
      ]),
    ]),
  ]
})
export class LootGraphNodeComponent extends ComponentStore<LootGraphNodeState> {
  @Input()
  public set node(value: LootNode) {
    this.patchState({ node: value })
  }

  @Input()
  public set showLocked(value: boolean) {
    this.patchState({ showLocked: value })
  }

  @Input()
  public set showChance(value: boolean) {
    this.patchState({ showChance: value })
  }

  @Input()
  public set expand(value: boolean) {
    this.patchState({ expand: value })
  }

  @Input()
  public set showLink(value: boolean) {
    this.patchState({ showLink: value })
  }

  protected vm = this.selectSignal(selectVM)
  protected trackByIndex = (i: number) => i

  protected iconExpand = svgAngleLeft
  protected iconinfo = svgCircleExclamation
  protected iconLock = svgLock
  protected iconLockOpen = svgLockOpen
  protected linkIcon = svgLink
  protected iconCode = svgCode
  protected iconBucket = svgBucket
  protected iconTable = svgTableList

  public constructor() {
    super({
      node: null,
      showLocked: false,
      showChance: false,
      expand: false,
      showLink: false,
    })
  }

  protected toggle() {
    this.patchState({
      expand: this.get(({ expand }) => !expand),
    })
  }

  protected isTrue(value: boolean | number | string) {
    if (typeof value === 'string' && (eqCaseInsensitive(value, 'TRUE') || value === '1')) {
      return true
    }
    return !!value
  }

  protected getProps(value: LootTable) {
    const result = {
      ...value,
    }
    delete result.Items
    return result
  }
}

function selectVM(state: LootGraphNodeState) {
  if (!state?.node) {
    return null
  }
  const node = state.node
  const vm: LootGraphNodeVM = initVM(state)
  if (!node) {
    return vm
  }
  vmFromTableRow(vm, state as LootGraphNodeState<LootTableNode>)
  if (node.type === 'table') {
    vmFromTableNode(vm, state as LootGraphNodeState<LootTableNode>)
  }
  if (node.type === 'table-item') {
    vmFromTableItemNode(vm, state as LootGraphNodeState<LootTableItemNode>)
  }
  if (node.type === 'bucket') {
    vmFromBucketNode(vm, state as LootGraphNodeState<LootBucketNode>)
  }
  if (node.type === 'bucket-row') {
    vmFromBucketRowNode(vm, state as LootGraphNodeState<LootBucketRowNode>)
  }
  return vm
}

function initVM(state: LootGraphNodeState): LootGraphNodeVM {
  const { node, showLocked, expand } = state
  const children = showLocked ? node?.children : node?.children?.filter((it) => !!it.unlocked && !!it.unlockedItemcount)
  const childrenAreItems = children?.every((it) => it.type === 'table-item' || it.type === 'bucket-row')

  return {
    ...state,
    unlocked: node?.unlocked,
    unlockedItemCount: node?.unlockedItemcount,
    totalItemCount: node?.totalItemCount,
    chanceAbs: node?.chanceAbsolute,
    chanceRel: node?.chanceRelative,
    highlight: node?.highlight,
    expand: expand ?? node?.highlight,
    lootNode: node,
    typeName: null,
    displayName: null,
    table: null,
    itemId: null,
    itemQuantity: null,
    itemTags: null,
    expandable: false,
    childGrid: false,
    children: children,
    childrenAreItems: childrenAreItems,
    itemIds: null,
    tagValue: null,
    rollThreshold: null,
    gridOptions: null,
  }
}

function vmFromTableNode(vm: LootGraphNodeVM, { showLink, node }: LootGraphNodeState<LootTableNode>) {
  vm.link = showLink ? ['/loot/table', node.data.LootTableID] : null
  vm.table = node.data
  vm.expandable = true
  vm.typeName = 'table'
  vm.displayName = node.ref
}

function vmFromTableRow(vm: LootGraphNodeVM, { node }: LootGraphNodeState<LootTableNode>) {
  const row = node.row
  if (!row) {
    return
  }
  const table = (node.parent as LootTableNode).data
  vm.itemQuantity = row.Qty
  vm.rollThreshold = table.MaxRoll > 0 ? row.Prob : null
  vm.tagValue = !table.MaxRoll && row.Prob != '0' ? row.Prob : null
}

function vmFromTableItemNode(vm: LootGraphNodeVM, { node }: LootGraphNodeState<LootTableItemNode>) {
  if (node.row.ItemID) {
    vm.itemId = node.row.ItemID
  }
}

function vmFromBucketNode(vm: LootGraphNodeVM, { node }: LootGraphNodeState<LootBucketNode>) {
  vm.expandable = true
  vm.typeName = `bucket`
  vm.displayName = node.ref
  if (vm.children?.length > 8) {
    vm.childGrid = true
    vm.gridOptions = LootGraphGridCellComponent.buildGridOptions()
  } else {
    vm.childGrid = false
    vm.gridOptions = null
  }
}

function vmFromBucketRowNode(vm: LootGraphNodeVM, { node }: LootGraphNodeState<LootBucketRowNode>) {
  vm.itemId = node.data.Item
  vm.itemQuantity = node.data.Quantity.join('-')
  vm.itemTags = Array.from(node.data.Tags.values()).map((it) => {
    if (it.Value != null) {
      return [it.Name, it.Value.join('-')].join(' ')
    }
    return it.Name
  })
}
