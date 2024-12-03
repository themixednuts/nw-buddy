import { Type, computed, inject } from '@angular/core'
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'
import { map, pipe, switchMap } from 'rxjs'
import { DBTable } from './db-table'
import { SyncService } from '~/sync/sync.service'

export interface WithDbRecordsState<T extends { id: string }> {
  records: T[]
  recordsAreLoaded: boolean
}

export function withDbRecords<T extends { id: string }, S extends SyncService = null>(table: Type<DBTable<T, S>>) {
  return signalStoreFeature(
    withState<WithDbRecordsState<T>>({
      records: null,
      recordsAreLoaded: false,
    }),
    withMethods((state) => {
      const db = inject(table)
      return {
        connectDB: rxMethod<void>(
          pipe(
            switchMap(() => db.observeAll()),
            map((data) =>
              patchState(state, {
                records: data,
                recordsAreLoaded: true,
              }),
            ),
          ),
        ),
        createRecord: async (record: T) => {
          return db.insert(record)
        },
        updateRecord: async (record: T) => {
          return db.update(record.id, record)
        },
        destroyRecord: async (id: string | string[]) => {
          return db.delete(id)
        },
      }
    }),
    withComputed(({ records }) => {
      return {
        filteredRecords: computed(() => records()),
      }
    }),
  )
}
