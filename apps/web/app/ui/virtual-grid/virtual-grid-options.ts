import { InjectionToken, StaticProvider, TemplateRef, Type } from '@angular/core'
import { VirtualGridCellComponent } from './virtual-grid-cell.component'

export const VIRTUAL_GRID_OPTIONS = new InjectionToken<VirtualGridOptions<any>>('VIRTUAL_GRID_OPTIONS')

export function provideVirtualGridOptions<T>(options: VirtualGridOptions<T>): StaticProvider[] {
  return [
    {
      provide: VIRTUAL_GRID_OPTIONS,
      useValue: options,
    },
  ]
}

export interface VirtualGridOptions<T> {
  /**
   * Fixed height of each row
   */
  height: number
  /**
   * Desired width of each column (min, max)
   */
  width: number | [number, number]
  /**
   * Desired number of columns
   */
  cols?: number | [number, number]
  /**
   * Additional css classes to apply to the host grid
   */
  gridClass?: string[]
  /**
   * The render compoonent to use for data cells
   */
  cellDataView: Type<VirtualGridCellComponent<T>>
  /**
   * The render compoonent to use for empty cells
   */
  cellEmptyView?: Type<any>
}
