import { Feature, FeatureCollection, MultiPoint, MultiPolygon, Polygon } from 'geojson'

export interface FilterDataSet extends FilterGroup {
  id: string
  count: number
  data: Record<
    string,
    {
      count: number
      geometry: FilterFeatureCollection
    }
  >
  variants: FilterVariant[]
}

export type FilterFeatureCollection = FeatureCollection<MultiPoint, FilterFeatureProperties>
export type FilterFeature = Feature<MultiPoint, FilterFeatureProperties>
export interface FilterGroup {
  section: string
  sectionLabel?: string
  sectionIcon?: string

  category: string
  categoryLabel?: string
  categoryIcon?: string

  subcategory: string
  subcategoryLabel?: string
  subcategoryIcon?: string

  variantID?: string
  variantLabel?: string
  variantIcon?: string

  labels?: boolean
  icons?: boolean

  properties: FilterFeatureProperties
}

export interface FilterVariant {
  id: string
  label: string
  icon: string
  properties: FilterFeatureProperties
}

export interface FilterFeatureProperties {
  color: string
  icon: string
  label: string
  size: number
  iconSize?: number

  tooltip?: string
  lootTable?: string
  loreID?: string
  vitalID?: string
  vitalLevel?: number
  encounter?: string
  variant?: string
}

export interface FilterDataPropertiesWithVariant extends Omit<FilterFeatureProperties, 'variant'> {
  variant: FilterVariant
}

//
// Vitals
//

export interface VitalDataSet {
  count: number
  data: Record<
    string,
    {
      count: number
      data: VitalsFeatureCollection
    }
  >
}

export type VitalsFeatureCollection = FeatureCollection<MultiPoint, VitalsFeatureProperties>
export type VitalsFeature = Feature<MultiPoint, VitalsFeatureProperties>
export interface VitalsFeatureProperties {
  id: string
  level: number
  type: string
  categories: string[]
  encounter: string[]
  lootTags: string[]
  poiTags: string[]
  color: string
}


export type HouseFeatureCollection = FeatureCollection<MultiPoint, HouseFeatureProperties>
export type HouseFeature = Feature<MultiPoint, HouseFeatureProperties>
export interface HouseFeatureProperties {
  id: string
  color: string
  label: string
  size: number
}
