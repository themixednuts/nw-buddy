import { inject, Injectable } from '@angular/core'
import { injectAppDB } from '../db'
import { DBTable } from '../db-table'
import { DBT_GEARSETS } from './constants'
import { GearsetRecord } from './types'
import { GearsetSyncService } from './gearset.sync.service'
import { AppDbDexie } from '../app-db.dexie'

@Injectable({ providedIn: 'root' })
export class GearsetsDB extends DBTable<GearsetRecord, GearsetSyncService> {
  public readonly db = injectAppDB()
  public readonly table = this.db.table<GearsetRecord, GearsetSyncService>(DBT_GEARSETS)

  constructor() {
    super()
    this.table.sync = inject(GearsetSyncService)
    if (this.db instanceof AppDbDexie) {
      this.table.sync.sync(this.db.dexie.table('gearsets'))
    }
  }
}
