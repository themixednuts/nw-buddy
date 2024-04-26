export type NodeSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge'
export const SIZE_COLORS: Record<NodeSize, string> = {
  Tiny: '#f28c18',
  Small: '#51A800',
  Medium: '#2563EB',
  Large: '#DC2626',
  Huge: '#6D3A9C',
}
export const SIZE_OUTLINE: Record<NodeSize, string> = {
  Tiny: '#653806',
  Small: '#204300',
  Medium: '#092564',
  Large: '#590e0e',
  Huge: '#2c173e',
}
export const SIZE_LABELS: Record<NodeSize, string> = {
  Tiny: 'XS',
  Small: 'S',
  Medium: 'M',
  Large: 'L',
  Huge: 'XL',
}
export const SIZE_RADIUS: Record<NodeSize, number> = {
  Tiny: 6,
  Small: 7,
  Medium: 8,
  Large: 9,
  Huge: 10,
}
export const SIZE_ORDER = ['Tiny', 'Small', 'Medium', 'Large', 'Huge']

export const NW_MAPS = [
  {
    id: 'newworld_vitaeeterna',
    bounds: {
      left: 4416,
      top: 10496,
      width: 9920,
      height: 10496,
    },
    minZoom: 1,
    maxZoom: 7,
  },
  {
    id: 'outpostrush',
    bounds: {
      left: 921,
      top: 11588,
      width: 721,
      height: 970,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
    hideObjectivesLayer: true,
  },
  {
    id: 'devworld',
    bounds: {
      left: 0,
      top: 2048,
      width: 2048,
      height: 2048,
    },
    minZoom: 1,
    maxZoom: 6,
  },
  {
    id: 'nw_dungeon_windsward_00',
    bounds: {
      left: 616,
      top: 1064,
      width: 360,
      height: 540,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_edengrove_00',
    bounds: {
      left: 336,
      top: 1616,
      width: 572,
      height: 600,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_everfall_00',
    bounds: {
      left: 324,
      top: 1080,
      width: 480,
      height: 540,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_restlessshores_00',
    bounds: {
      left: 176,
      top: 600,
      width: 600,
      height: 480,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_restlessshores_01',
    bounds: {
      left: 680,
      top: 1380,
      width: 564,
      height: 580,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_reekwater_00',
    bounds: {
      left: 640,
      top: 980,
      width: 360,
      height: 440,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_shattermtn_00',
    bounds: {
      left: 350,
      top: 1920,
      width: 1660,
      height: 1480,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_brimstonesands_00',
    bounds: {
      left: 700,
      top: 1480,
      width: 720,
      height: 720,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_cutlasskeys_00',
    bounds: {
      left: 250,
      top: 1230,
      width: 460,
      height: 480,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_greatcleave_01',
    bounds: {
      left: 480,
      top: 700,
      width: 500,
      height: 500,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_firstlight_01',
    bounds: {
      left: 380,
      top: 1280,
      width: 660,
      height: 700,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_trial_season_02',
    bounds: {
      left: 700,
      top: 1230,
      width: 460,
      height: 480,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_trial_season_02_q13',
    bounds: {
      left: 800,
      top: 1200,
      width: 300,
      height: 480,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_ori_eg_questmotherwell',
    bounds: {
      left: 1200,
      top: 1100,
      width: 100,
      height: 200,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_ori_fl_questadiana',
    bounds: {
      left: 800,
      top: 1200,
      width: 300,
      height: 480,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_ori_gc_questnihilo',
    bounds: {
      left: 800,
      top: 800,
      width: 150,
      height: 150,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_trial_season_04_daichidojo',
    bounds: {
      left: 290,
      top: 420,
      width: 30,
      height: 30,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_trial_season_04_deviceroom',
    bounds: {
      left: 140,
      top: 310,
      width: 200,
      height: 100,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_dungeon_greatcleave_00',
    bounds: {
      left: 800,
      top: 1000,
      width: 400,
      height: 600,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_trial_season_04',
    bounds: {
      left: 200,
      top: 1000,
      width: 400,
      height: 1000,
    },
    minZoom: 1,
    maxZoom: 4,
    hidePOILayer: true,
  },
  {
    id: 'nw_arena01',
    bounds: {
      left: 700,
      top: 1480,
      width: 720,
      height: 720,
    },
    minZoom: 1,
    maxZoom: 1,
    hidePOILayer: true,
  },
  {
    id: 'nw_arena02',
    bounds: {
      left: 700,
      top: 1480,
      width: 720,
      height: 720,
    },
    minZoom: 1,
    maxZoom: 1,
    hidePOILayer: true,
  },
]
