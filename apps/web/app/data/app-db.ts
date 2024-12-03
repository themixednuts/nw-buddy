import { Observable } from 'rxjs'
import { SyncService } from '~/sync/sync.service'

export type AppDbRecord = { id: string }

export abstract class AppDb {
  public abstract reset(): Promise<void>
  public abstract table<T extends AppDbRecord, S extends SyncService = null>(name: string): AppDbTable<T, S>
}

export abstract class AppDbTable<T extends AppDbRecord, S extends SyncService | null = null> {
  public abstract readonly db: AppDb
  public sync?: S = null

  public abstract tx<R>(fn: () => Promise<R>): Promise<R>
  public abstract count(): Promise<number>
  public abstract keys(): Promise<string[]>

  public abstract list(): Promise<T[]>
  public abstract insert(record: Partial<T>): Promise<T>
  public abstract select(id: string): Promise<T>
  public abstract update(id: string, record: Partial<T>): Promise<T>
  public abstract delete(id: string | string[]): Promise<void>

  public abstract upsert(record: T): Promise<T>

  public abstract observeAll(): Observable<T[]>
  public abstract observeByid(id: string | Observable<string>): Observable<T>
}
