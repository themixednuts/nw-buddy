import { CommonModule } from '@angular/common'
import { Component, importProvidersFrom, inject } from '@angular/core'
import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { NwDbService } from '~/nw'
import { AppTestingModule } from '~/test'
import { VirtualGridComponent } from '~/ui/virtual-grid'
import { ItemGridCellComponent } from './item-grid-cell.component'
import { VirtualGridCellDirective } from '~/ui/virtual-grid/virtual-grid-cell.directive'

@Component({
  standalone: true,
  template: ` <nwb-virtual-grid [options]="gridOptions" [data]="items$ | async"></nwb-virtual-grid> `,
  imports: [CommonModule, VirtualGridComponent, VirtualGridCellDirective, ItemGridCellComponent],
  host: {
    class: 'flex flex-col h-[800px] w-full',
  },
})
export class StoryComponent {
  protected items$ = inject(NwDbService).items
  protected gridOptions = ItemGridCellComponent.buildGridOptions()
}

export default {
  title: 'Widgets / nwb-virtual-grid / Item',
  component: StoryComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(AppTestingModule)],
    }),
    moduleMetadata({
      imports: [StoryComponent],
    }),
  ],
  args: {},
} satisfies Meta<StoryComponent>

export const Example: StoryObj<StoryComponent> = {}
