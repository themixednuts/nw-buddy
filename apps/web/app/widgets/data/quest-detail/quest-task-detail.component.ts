import { Component, Input, inject } from '@angular/core'
import { patchState } from '@ngrx/signals'
import { QuestTaskDetailStore } from './quest-task-detail.store'
import { QuestTaskTreeComponent } from './quest-task-tree.component'

@Component({
  standalone: true,
  selector: 'nwb-quest-task-detail',
  template: ` <nwb-quest-task-tree [task]="task" [children]="children" /> `,
  providers: [QuestTaskDetailStore],
  imports: [QuestTaskTreeComponent],
  host: {
    class: 'block'
  }
})
export class QuestTaskDetailComponent {
  protected store = inject(QuestTaskDetailStore)
  @Input()
  public set taskId(value: string) {
    patchState(this.store, { taskId: value })
  }

  public get task() {
    return this.store.task()
  }
  public get children() {
    return this.store.children()
  }
}
