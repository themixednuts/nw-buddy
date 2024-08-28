import { noPayload, payload, withRedux } from '@angular-architects/ngrx-toolkit'
import { computed, inject } from '@angular/core'
import { patchState, signalStore, withComputed, withState } from '@ngrx/signals'
import { describeNodeSize } from '@nw-data/common'
import { Feature, FeatureCollection, MultiPoint } from 'geojson'
import { FilterSpecification } from 'maplibre-gl'
import { EMPTY, catchError, combineLatest, map, switchMap } from 'rxjs'
import { NwDataService } from '~/data'
import { GameMapService } from '~/widgets/game-map'

export interface VitalDetailMapState {
  data: Record<string, VitalFeatureCollection>
  mapId: string
  mapIds: string[]
  showHeatmap: boolean
  showRandomEncounter: boolean
  hasRandomEncounter: boolean
  disabledSizes: string[]
  isLoaded: boolean
  isLoading: boolean
  hasError: boolean
}

export type VitalFeatureCollection = FeatureCollection<MultiPoint, VitalProperties>
export type VitalFeature = Feature<MultiPoint, VitalProperties>
export interface VitalProperties {
  vitalId: string
  level: number
  color: string
  size: number
  encounter: string[]
}

export const VitalDetailMapStore = signalStore(
  withState<VitalDetailMapState>({
    data: {},
    mapId: null,
    mapIds: [],
    showHeatmap: true,
    showRandomEncounter: false,
    hasRandomEncounter: false,
    disabledSizes: [],
    isLoaded: false,
    isLoading: false,
    hasError: false,
  }),
  withRedux({
    actions: {
      public: {
        load: payload<{ id: string }>(),
        selectMap: payload<{ mapId: string }>(),
        toggleHeatmap: noPayload,
        toggleSize: payload<{ size: string }>(),
        toggleRandomEncounter: noPayload,
      },
      private: {
        loaded: payload<Pick<VitalDetailMapState, 'data' | 'hasRandomEncounter'>>(),
        loadError: payload<{ error: any }>(),
      },
    },
    reducer(actions, on) {
      on(actions.load, (state) => {
        patchState(state, {
          isLoading: true,
        })
      })
      on(actions.toggleHeatmap, (state) => {
        patchState(state, ({ showHeatmap }) => {
          return { showHeatmap: !showHeatmap }
        })
      })
      on(actions.toggleRandomEncounter, (state) => {
        patchState(state, ({ showRandomEncounter }) => {
          return { showRandomEncounter: !showRandomEncounter }
        })
      })
      on(actions.toggleSize, (state, { size }) => {
        patchState(state, ({ disabledSizes }) => {
          const index = disabledSizes.indexOf(size)
          if (index >= 0) {
            disabledSizes = disabledSizes.filter((it) => it !== size)
          } else {
            disabledSizes = [...disabledSizes, size]
          }
          return { disabledSizes }
        })
      })
      on(actions.selectMap, (state, { mapId }) => {
        patchState(state, { mapId })
      })
      on(actions.loaded, (state, { data, hasRandomEncounter }) => {
        data ||= {}
        const mapIds = Object.keys(data)
        patchState(state, {
          data,
          hasRandomEncounter,
          mapIds: mapIds,
          mapId: mapIds[0],
          isLoaded: true,
          isLoading: false,
          hasError: false,
        })
      })
      on(actions.loadError, (state, { error }) => {
        patchState(state, {
          data: null,
          isLoaded: true,
          isLoading: false,
          hasError: true,
        })
      })
    },
    effects(actions, create) {
      const gameMap = inject(GameMapService)
      const db = inject(NwDataService)
      return {
        load$: create(actions.load).pipe(
          switchMap(({ id }) => loadVitalData({ gameMap, db, id })),
          map(({ data, hasRandomEncounter }) => {
            actions.loaded({ data, hasRandomEncounter })
            return null
          }),
          catchError((error) => {
            console.error(error)
            actions.loadError({ error })
            return EMPTY
          }),
        ),
      }
    },
  }),
  withComputed(({ data, mapId, disabledSizes, showRandomEncounter }) => {
    const mapData = computed(() => data()?.[mapId()])
    const bounds = computed(() => selectBounds(mapData()))
    const filter = computed((): FilterSpecification => {
      const rows: FilterSpecification[] = []
      if (!showRandomEncounter()) {
        rows.push(['!', ['in', 'random', ['get', 'encounter']]])
      }
      if (rows.length === 0) {
        return null
      }

      return ['all', ...rows] as any
    })
    return {
      mapData,
      bounds,
      filter,
    }
  }),
)

function loadVitalData({ db, gameMap, id }: { db: NwDataService; gameMap: GameMapService; id: string }) {
  return combineLatest({
    vital: db.vital(id),
    meta: db.vitalsMeta(id),
  }).pipe(
    map(({ vital, meta }) => {
      const index: Record<string, Record<number, VitalFeature>> = {}
      const color = describeNodeSize('Medium').color
      let hasRandomEncounter = false
      for (const [mapId, spawns] of Object.entries(meta?.spawns || {})) {
        index[mapId] ||= {}
        const mapData = index[mapId]
        for (const spawn of spawns) {
          const levels = [...spawn.l]
          if (levels.length === 0) {
            levels.push(0)
          }
          for (const level of levels) {
            hasRandomEncounter ||= spawn.e.includes('random')
            mapData[level] ||= {
              type: 'Feature',
              geometry: {
                type: 'MultiPoint',
                coordinates: [],
              },
              properties: {
                vitalId: id,
                level: level,
                color: color,
                size: 1,
                encounter: spawn.e,
              },
            }
            mapData[level].geometry.coordinates.push(gameMap.xyToLngLat([spawn.p[0], spawn.p[1]]))
          }
        }
      }

      const result: Record<string, VitalFeatureCollection> = {}
      for (const [mapId, data] of Object.entries(index)) {
        result[mapId] = {
          type: 'FeatureCollection',
          features: Object.values(data),
        }
      }
      return {
        data: result,
        hasRandomEncounter,
      }
    }),
  )
}

function selectBounds(data: VitalFeatureCollection): [number, number, number, number] {
  if (!data) {
    return null
  }
  let min: [number, number] = null
  let max: [number, number] = null
  for (const feature of data.features) {
    for (const [x, y] of feature.geometry.coordinates) {
      if (!min) {
        min = [x, y]
        max = [x, y]
      } else {
        min[0] = Math.min(min[0], x)
        min[1] = Math.min(min[1], y)
        max[0] = Math.max(max[0], x)
        max[1] = Math.max(max[1], y)
      }
    }
  }
  if (min[0] === max[0] || min[1] === max[1]) {
    min[0] -= 0.0001
    min[1] -= 0.0001
    max[0] += 0.0001
    max[1] += 0.0001
  }
  return [min[0], min[1], max[0], max[1]]
}
