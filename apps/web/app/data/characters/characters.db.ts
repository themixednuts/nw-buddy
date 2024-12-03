import { Injectable } from '@angular/core'
import { from, switchMap } from 'rxjs'
import { injectAppDB } from '../db'
import { DBTable } from '../db-table'
import { DBT_CHARACTERS } from './constants'
import { CharacterRecord } from './types'
import { SyncService } from '~/sync/sync.service'

@Injectable({ providedIn: 'root' })
export class CharactersDB extends DBTable<CharacterRecord> {
  public readonly db = injectAppDB()
  public readonly table = this.db.table<CharacterRecord>(DBT_CHARACTERS)

  public async getCurrent() {
    return this.tx(async () => {
      if ((await this.count()) == 0) {
        return this.insert({})
      }
      const keys = await this.keys()
      const result = await this.select(keys[0] as string)
      return result
    })
  }

  public observeCurrent() {
    return from(this.getCurrent()).pipe(switchMap((it) => this.observeByid(it.id)))
  }
}
