import { inject, Injectable } from '@angular/core'
import { Table } from 'dexie'
import { AppDbRecord, AppDbTable } from '~/data/app-db'
import { TablesInsert } from '~/database.types'
import { SupabaseService } from '~/supabase.service'
import { GearsetRecord } from './types'

@Injectable({
  providedIn: 'root',
})
export class GearsetSyncService {
  private readonly supabase = Object.freeze(inject(SupabaseService))

  constructor() {}

  private getUser() {
    return this.supabase.session().user
  }

  async sync(table: Table<GearsetRecord>) {
    const { data, error } = await this.supabase.handle.from('gearsets').select()
    if (error) {
      console.log(error)
      return
    }

    console.log(data)
    // const collection = await table.toArray()
    // collection.forEach((row) => {

    // })

    // console.log(collection)
  }

  async onUpdate(record: Partial<GearsetRecord>) {
    console.log('GEARSET SUPABASE UPDATE CALL')
    const { error, status, data } = await this.supabase.handle
      .from('gearsets')
      .upsert({ ...(record as any as TablesInsert<'gearsets'>), user_id: this.getUser().id })
      .select()

    if (error) {
      console.log(error, status)
      return
    }
    console.log('GEARSET UPDATED:', data)
  }

  async onDelete(id: string | string[]) {
    console.log('GEARSET SUPABASE DELETE CALL')
    const { error, count } = await this.supabase.handle.from('gearsets').delete({ count: 'estimated' }).eq('id', id)

    if (error) {
      console.log(error)
      return
    }
    console.log('GEARSET DELTE COUNT:', count)
  }

  async onInsert<T extends AppDbRecord>(table: string, record: Partial<T>) {
    if (table === 'gearsets') {
      const { data, error } = await this.supabase.handle
        .from(table)
        .insert({ ...(record as any as TablesInsert<'gearsets'>), user_id: this.getUser().id })
        .select()
      if (error) {
        console.log(error)
        return
      }
      console.log('GEARSET CREATED:', data)
    }
  }
}
