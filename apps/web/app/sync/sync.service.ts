import { effect, Inject, inject, Injectable, InjectionToken } from '@angular/core'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Table } from 'dexie'
import { nanoid } from 'nanoid'
import { AppDbRecord } from '~/data/app-db'
import { Database, TablesInsert, TablesUpdate } from '~/database.types'
import { SupabaseService } from '~/supabase.service'

export type TableNames = keyof Database['public']['Tables']
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

  @Inject(SYNC_TABLE_NAME) protected readonly name: TableNames

  protected getUser() {
    return this.supabase.session()?.user
  }

  /**
   * call once on init, handles when session gets set/refreshed
   *
   * @param table
   * @returns
   */
  async sync<T extends { id: string }>(table: Table<T>) {
    console.log(`${this.name.toUpperCase()} SYNC SYNC()`)

    effect(() => {
      this.handleSync(table, this.supabase.session())

      if (!!this.supabase.session()) {
        this.supabase.handle.realtime.setAuth(this.supabase.session().access_token)
      } else {
        this.supabase.handle.realtime.setAuth(null)
      }
    })

    this.channel = this.supabase.handle.realtime
      .channel(`${this.name}-db-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: this.name }, ({ eventType, ...payload }) => {
        console.log('SUPABASE REALTIME EVENT FIRED', payload)

        if (eventType === 'INSERT') {
          console.log('SUPABASE REALTIME ON INSERT EVENT')
          table.add(payload.new as T)
          return
        }

        if (eventType === 'UPDATE') {
          console.log('SUPABASE REALTIME ON UPDATE EVENT')
          table.get((payload.new as T).id).then((local) => {
            if (
              'updated_at' in local &&
              'updated_at' in payload.new &&
              new Date(local['updated_at'] as string) < new Date(payload.new['updated_at'])
            ) {
              console.log('SUPABASE REALTIME ON UPDATE EVENT -> REMOTE AHEAD OF LOCAL')
              table.update(payload.new['id'], payload.new)
            }
            return
          })
        }

        if (eventType === 'DELETE') {
          console.log('SUPABASE REALTIME ON DELETE EVENT')
          table.delete(payload.new['id'])
        }
      })
      .subscribe((status, error) => {
        console.log(status, table.name)
        if (error) console.log(error)
      })
  }

  async handleSync<T extends { id: string }>(table: Table<T>, session: ReturnType<typeof this.supabase.session>) {
    if (!session) return

    const { data, error } = await this.supabase.handle.from(this.name).select().eq('user_id', session.user.id)

    if (error) {
      console.error(error)
      return
    }

    const local = await table.toArray()

    const chunked: Array<[(typeof local)[number] | null, (typeof data)[number] | null]> = []

    for (const localRow of local) {
      const matchingRemoteRow = data.find(
        //@ts-expect-error
        (remoteRow) => remoteRow.id === localRow.id && remoteRow.user_id === this.getUser().id,
      )

      chunked.push([localRow, matchingRemoteRow ?? null])
    }

    for (const remoteRow of data) {
      const matchingLocalRow = local.find(
        //@ts-expect-error
        (localRow) => localRow.id === remoteRow.id && remoteRow.user_id === this.getUser().id,
      )

      if (!matchingLocalRow) {
        chunked.push([null, remoteRow])
      }
    }

    const promises = chunked.map(async ([local, remote]) => {
      if (local === null && remote !== null) {
        // Handle case where only remote row exists
        //@ts-expect-error
        const { user_id, id, ...rest } = remote
        return table.add({ ...(rest as any as T), id }, id)
      } else if (local !== null && remote === null) {
        // Handle case where only local row exists
        if (local.id.length != 21) {
          const id = nanoid()
          await table.update(local.id, { ...local, id })
          local.id = id
        }
        return this.supabase.handle
          .from(this.name)
          .insert({ ...(local as any as TablesInsert<TableNames>), user_id: this.getUser().id })
      } else {
        // Handle case where both local and remote rows exist
        if (!('updated_at' in local)) return new Promise(() => {})

        const localDate = new Date(local.updated_at as string)
        const remoteDate = new Date(remote.updated_at)

        // Compare timestamps or perform sync logic
        if (remoteDate < localDate) {
          console.log('LOCAL IS AHEAD OF REMOTE')
          return this.supabase.handle
            .from(this.name)
            .update(local as TablesUpdate<TableNames>)
            .eq('id', local.id)
        } else if (localDate < remoteDate) {
          console.log('REMOTE IS AHEAD OF LOCAL')
          console.log('local:', local)
          console.log('remote:', remote)
          return table.update(local.id, remote)
        } else {
          return new Promise(() => {})
        }
      }
    })

    await Promise.all(promises)
  }

  async onUpdate<T extends AppDbRecord>(record: Partial<T>) {
    console.log(`${this.name.toUpperCase()} SUPABASE UPDATE CALL`)
    const user_id = this.getUser()?.id
    if (!user_id) return

    const { error, status, data } = await this.supabase.handle
      .from(this.name)
      .upsert({ ...(record as any as TablesInsert<TableNames>), user_id })
      .select()

    if (error) {
      console.log(error, status)
      return
    }
    console.log(`${this.name.toUpperCase()} UPDATED:`, data)
  }

  async onDelete(id: string | string[]) {
    const user_id = this.getUser()?.id
    if (!user_id) return

    console.log(`${this.name.toUpperCase()} SUPABASE DELETE CALL`)
    const { error, count } = await this.supabase.handle.from(this.name).delete({ count: 'estimated' }).eq('id', id)

    if (error) {
      console.log(error)
      return
    }
    console.log(`${this.name.toUpperCase()} DELETE COUNT:`, count)
  }

  async onInsert<T extends AppDbRecord>(record: Partial<T>) {
    const user_id = this.getUser()?.id
    if (!user_id) return

    const { data, error } = await this.supabase.handle
      .from(this.name)
      .insert({ ...(record as any as TablesInsert<TableNames>), user_id: this.getUser().id })
      .select()

    if (error) {
      console.log(error)
      return
    }
    console.log(`${this.name.toUpperCase()} CREATED:`, data)
  }
}
