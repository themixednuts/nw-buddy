import { Dexie, liveQuery, PromiseExtended, Table } from 'dexie'
import { nanoid } from 'nanoid/non-secure'
import { defer, isObservable, of, Observable as RxObservable, switchMap } from 'rxjs'

import { AppDb, AppDbTable } from './app-db'
import {
  DBT_CHARACTERS,
  DBT_GEARSETS,
  DBT_IMAGES,
  DBT_ITEMS,
  DBT_SKILL_BUILDS,
  DBT_TABLE_PRESETS,
  DBT_TABLE_STATES,
} from './constants'
import { SyncService } from '~/sync/sync.service'

export class AppDbDexie extends AppDb {
  private tables: Record<string, AppDbDexieTable<any, any>> = {}
  public readonly dexie: Dexie
  public constructor(name: string) {
    super()
    this.dexie = new Dexie(name)
    this.init(this.dexie)
  }

  public override table(name: string) {
    this.tables[name] = this.tables[name] || new AppDbDexieTable(this, name)
    return this.tables[name]
  }

  public async reset() {
    await this.dexie.open()
    await this.dexie.delete()
    await this.dexie.open()
  }

  private init(db: Dexie) {
    db.version(1).stores({
      [DBT_ITEMS]: 'id,itemId,gearScore',
      [DBT_GEARSETS]: 'id,*tags',
    })
    db.version(2).stores({
      [DBT_IMAGES]: 'id',
    })
    db.version(3).stores({
      [DBT_CHARACTERS]: 'id',
    })
    db.version(4).stores({
      [DBT_SKILL_BUILDS]: 'id',
    })
    db.version(5).stores({
      [DBT_TABLE_PRESETS]: 'id,key',
      [DBT_TABLE_STATES]: 'id',
    })
  }
}

// https://github.com/ai/nanoid
// https://zelark.github.io/nano-id-cc/
const createId = nanoid
export class AppDbDexieTable<T extends { id: string }, S extends SyncService = null> extends AppDbTable<T, S> {
  public db: AppDbDexie
  private table: Table<T>

  public constructor(db: AppDbDexie, name: string) {
    super()
    this.db = db
    this.table = db.dexie.table(name)
  }

  public async tx<R>(fn: () => Promise<R>): Promise<R> {
    return this.db.dexie.transaction('rw', this.table, fn)
  }

  public async count(): Promise<number> {
    return this.table.count()
  }

  public async keys(): Promise<string[]> {
    return this.table
      .toCollection()
      .keys()
      .then((list) => list as string[])
  }

  public list(): Promise<T[]> {
    return this.table.toArray()
  }

  public async insert(record: Partial<T>): Promise<T> {
    const now = new Date()
    record = {
      ...record,
      id: record.id || createId(),
      created_at: now,
      updated_at: now,
    }
    const id = await this.table.add(record as T, record.id)
    await this.sync?.onInsert(record)
    return this.select(id as any)
  }

  public select(id: string): Promise<T> {
    return this.table.get(id)
  }

  public async update(id: string, record: Partial<T>): Promise<T> {
    console.log('UPDATING')
    const now = new Date()
    record = {
      ...record,
      updated_at: now,
    }
    this.sync?.onUpdate(record)
    await this.table.update(id, record)
    return this.select(id)
  }

  public async delete(id: string | string[]): Promise<void> {
    this.sync?.onDelete(id)
    return this.table.delete(id)
  }

  public async upsert(record: T): Promise<T> {
    console.log('UPSERTING')
    if (record.id) {
      return this.update(record.id, record)
    }
    return this.insert(record)
  }

  public live<R>(fn: (tbale: Table<T>) => PromiseExtended<R>) {
    return defer(
      () =>
        new RxObservable<R>((sub) => {
          return liveQuery<R>(() => fn(this.table)).subscribe(sub)
        }),
    )
  }

  public observeAll(): RxObservable<T[]> {
    return this.live((t) => t.toArray())
  }
  public observeByid(id: string | RxObservable<string>): RxObservable<T> {
    return (isObservable(id) ? id : of(id)).pipe(
      switchMap((id) => {
        return id ? this.live((t) => t.get(id)) : of(null)
      }),
    )
  }
}
