import { of, Observable as RxObservable } from 'rxjs'

import { AppDb, AppDbTable } from './app-db'
import { SyncService } from '~/sync/sync.service'

export class AppDbNoop extends AppDb {
  private tables: Record<string, AppDbNoopTable<any>> = {}

  public constructor(name: string) {
    super()
  }

  public override table(name: string) {
    this.tables[name] = this.tables[name] || new AppDbNoopTable(this, name)
    return this.tables[name]
  }

  public async reset() {
    //
  }
}

export class AppDbNoopTable<T extends { id: string }, S extends SyncService = null> extends AppDbTable<T, S> {
  public db: AppDb

  public constructor(db: AppDb, name: string) {
    super()
    this.db = db
  }

  public async tx<R>(fn: () => Promise<R>): Promise<R> {
    return null
  }

  public async count(): Promise<number> {
    return 0
  }

  public async keys(): Promise<string[]> {
    return []
  }

  public async list(): Promise<T[]> {
    return []
  }

  public async insert(record: Partial<T>): Promise<T> {
    return null
  }

  public async select(id: string): Promise<T> {
    return null
  }

  public async update(id: string, record: Partial<T>): Promise<T> {
    return null
  }

  public async delete(id: string | string[]): Promise<void> {
    //
  }

  public async upsert(record: T): Promise<T> {
    return null
  }

  public observeAll(): RxObservable<T[]> {
    return of([])
  }
  public observeByid(id: string | RxObservable<string>): RxObservable<T> {
    return of(null)
  }
}
