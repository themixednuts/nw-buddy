import { Injectable } from '@angular/core'
import { PreferencesService } from './preferences.service'
import { StorageProperty } from './storage'

@Injectable({ providedIn: 'root' })
export class AppPreferencesService {

  public readonly language: StorageProperty<string>
  public readonly theme: StorageProperty<string>
  public readonly nwmpServer: StorageProperty<string>

  public constructor(preferences: PreferencesService) {
    const storage = preferences.storage.storageObject('app')
    this.language = storage.storageProperty('language', 'en-us')
    this.theme = storage.storageProperty('theme', 'helloween')
    this.nwmpServer = storage.storageProperty('nwmpServer', null)
  }
}
