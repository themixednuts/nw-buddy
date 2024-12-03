import { effect, Inject, inject, Injectable, InjectionToken } from '@angular/core'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Table } from 'dexie'
import { AppDbRecord, AppDbTable } from '~/data/app-db'
import { DBTable } from '~/data/db-table'
import { TablesInsert, TablesUpdate } from '~/database.types'
import { SupabaseService } from '~/supabase.service'

export const SYNC_TABLE_NAME = new InjectionToken<string>('SYNC_TABLE_NAME')
/**
 * Global SyncService
 *
 * We can make this abstract then make a Service per table but idk this seems fine for me for now
 */
@Injectable({
  providedIn: 'root',
})
export abstract class SyncService {
  protected readonly supabase = Object.freeze(inject(SupabaseService))
  protected channel: RealtimeChannel | null

  @Inject(SYNC_TABLE_NAME) protected name: string

  protected getUser() {
    return this.supabase.session()?.user
  }

  /**
   * call once on init, handles when session gets set/refreshed
   *
   * @param table
   * @returns
   */
  abstract sync<T extends { id: string }>(table: Table<T>): Promise<void>

  abstract handleSync<T extends { id: string }>(
    table: Table<T>,
    session: ReturnType<typeof this.supabase.session>,
  ): Promise<void>

  abstract onUpdate<T extends AppDbRecord>(record: Partial<T>): Promise<void>

  abstract onDelete(id: string | string[]): Promise<void>

  abstract onInsert<T extends AppDbRecord>(record: Partial<T>): Promise<void>
}
