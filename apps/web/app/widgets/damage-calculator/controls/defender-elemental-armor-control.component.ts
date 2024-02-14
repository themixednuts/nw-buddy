import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NwModule } from '~/nw'
import { DamageCalculatorStore, defenderAccessor } from '../damage-calculator.store'
import { StackedValueControlComponent } from './stacked-value-control.component'

@Component({
  standalone: true,
  selector: 'nwb-defender-elemental-armor-control',
  templateUrl: './defender-elemental-armor-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, FormsModule, StackedValueControlComponent],
  host: {
    class: 'block',
  },
})
export class DefenderElementalArmorControlComponent {
  protected store = inject(DamageCalculatorStore)

  protected rating = this.store.defenderElementalArmor
  protected armor = defenderAccessor(this.store, 'elementalArmor')
  protected armorFortify = defenderAccessor(this.store, 'elementalArmorFortify')
  protected armorAdd = defenderAccessor(this.store, 'elementalArmorAdd')
}
