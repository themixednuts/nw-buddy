import { Observable } from 'rxjs'
import { AppDbRecord, AppDbTable } from './app-db'
import { SyncService } from '~/sync/sync.service'

export abstract class DBTable<T extends AppDbRecord, S extends SyncService = null> extends AppDbTable<T, S> {
  public abstract readonly table: AppDbTable<T, S>

  public tx<R>(fn: () => Promise<R>): Promise<R> {
    return this.table.tx(fn)
  }

  public async count() {
    return this.table.count()
  }

  public async keys() {
    return this.table.keys()
  }

  public async list() {
    return this.table.list()
  }

  public async insert(record: Partial<T>) {
    return this.table.insert(record)
  }

  public async select(id: string) {
    return this.table.select(id)
  }

  public async update(id: string, record: Partial<T>) {
    return this.table.update(id, record)
  }

  public async delete(id: string | string[]) {
    return this.table.delete(id)
  }

  public async upsert(record: T) {
    return this.table.upsert(record)
  }

  public observeAll() {
    return this.table.observeAll()
  }

  public observeByid(id: string | Observable<string>) {
    return this.table.observeByid(id)
  }
}
