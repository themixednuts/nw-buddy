import { inject } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { eq } from 'lodash'
import { Observable, defer, distinctUntilChanged, filter, isObservable, map, of, startWith, switchMap } from 'rxjs'

export function injectRouteParam(param: string | Observable<string>): Observable<string> {
  return observeRouteParam(inject(ActivatedRoute), param)
}

export function injectChildRouteParam(param: string | Observable<string>): Observable<string> {
  return observeChildRouteParam(inject(Router), inject(ActivatedRoute), param)
}

export function injectQueryParam(param: string | Observable<string>): Observable<string> {
  return observeQueryParam(inject(ActivatedRoute), param)
}

export function injectUrlParams(pattern: string): Observable<Record<string, string>> {
  return observeUrlParams(inject(Router), pattern)
}

export function observeRouteParam<T>(route: ActivatedRoute, param: string | Observable<string>): Observable<string> {
  if (!isObservable(param)) {
    param = of(param)
  }
  return param.pipe(switchMap((key) => route.paramMap.pipe(map((map) => map.get(key)))))
}

export function observeQueryParam(route: ActivatedRoute, param: string | Observable<string>) {
  if (!isObservable(param)) {
    param = of(param)
  }
  return param.pipe(switchMap((key) => route.queryParamMap.pipe(map((map) => map.get(key)))))
}

export function observeChildRouteParam(router: Router, route: ActivatedRoute, param: string | Observable<string>) {
  return defer(() => (isObservable(param) ? param : of(param))).pipe(
    switchMap((param) => {
      return router.events.pipe(filter((it) => it instanceof NavigationEnd)).pipe(
        map(() => getChildRouteParam(route, param)),
        distinctUntilChanged(),
        startWith(getChildRouteParam(route, param)),
      )
    }),
  )
}

export function observeUrlParams(router: Router, pattern: string): Observable<Record<string, string>> {
  function resolve() {
    const tokens1 = router.url.split('?')[0].split('/')
    const tokens2 = pattern.split('/')
    const result: Record<string, string> = {}
    for (let i = 0; i < tokens2.length; i++) {
      const token = tokens2[i]
      if (token.startsWith(':')) {
        result[token.slice(1)] = tokens1[i]
      }
    }
    return result
  }
  return router.events.pipe(
    filter((it) => it instanceof NavigationEnd),
    map(() => resolve()),
    startWith(resolve()),
    distinctUntilChanged(eq),
  )
}

function childRouteConfigWithParam(route: ActivatedRoute, param: string) {
  const regex = new RegExp(`:${param}`)
  return route.routeConfig.children?.find((it) => it.path.match(regex))
}
function childRouteWithParam(route: ActivatedRoute, param: string) {
  const config = childRouteConfigWithParam(route, param)
  return route.children?.find((it) => it.routeConfig === config)
}
function getChildRouteParam(route: ActivatedRoute, param: string) {
  const childRoute = childRouteWithParam(route, param)
  return childRoute?.snapshot?.paramMap?.get(param)
}
