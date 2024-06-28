import { inject, InjectionToken } from '@angular/core'
import { injectWindow } from './window'

export const LOCATION = new InjectionToken<Location>('An abstraction over window.location object', {
  factory: () => injectWindow().location,
})

export function injectNavigator(): Location {
  return inject(LOCATION)
}
