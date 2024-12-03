import { inject, Injectable } from '@angular/core'
import { injectAppDB } from '../db'
import { DBTable } from '../db-table'
import { DBT_SKILL_BUILDS } from './constants'
import { SkillSetRecord } from './types'
import { SkillsetSyncService } from './skillset.sync.service'
import { AppDbDexie } from '../app-db.dexie'

@Injectable({ providedIn: 'root' })
export class SkillBuildsDB extends DBTable<SkillSetRecord, SkillsetSyncService> {
  public readonly db = injectAppDB()
  public readonly table = this.db.table<SkillSetRecord, SkillsetSyncService>(DBT_SKILL_BUILDS)
  public override sync: SkillsetSyncService = inject(SkillsetSyncService)

  constructor() {
    super()
    this.table.sync = inject(SkillsetSyncService)
    if (this.db instanceof AppDbDexie) {
      this.sync.sync(this.db.dexie.table('skillbuilds'))
    }
  }
}
