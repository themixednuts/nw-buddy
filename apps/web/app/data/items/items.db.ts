import { Injectable } from '@angular/core'
import { injectAppDB } from '../db'
import { DBTable } from '../db-table'
import { DBT_ITEMS } from './constants'
import { ItemInstanceRecord } from './types'
import { SyncService } from '~/sync/sync.service'

@Injectable({ providedIn: 'root' })
export class ItemInstancesDB extends DBTable<ItemInstanceRecord> {
  public readonly db = injectAppDB()
  public readonly table = this.db.table<ItemInstanceRecord>(DBT_ITEMS)
}
