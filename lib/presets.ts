import { DEFAULT_MINING_PARAMETERS } from '@/packages/calc-engine';

export type EnergyType = 'wind' | 'solar' | 'mixed' | 'custom';

export interface MiningPreset {
  key: string;
  name: string;
  location: string;
  energyType: EnergyType;
  energyEurPerKwh: number;
  uptime: number;
  minerCount: number;
  hashrateTH: number;
  efficiencyJPerTH: number;
  blurb: string;
}

const d = DEFAULT_MINING_PARAMETERS.defaults;

export const MINING_PRESETS: MiningPreset[] = [
  {
    key: 'wietzen',
    name: 'Wietzen Wind',
    location: 'Wietzen · DE',
    energyType: 'wind',
    energyEurPerKwh: 0.035,
    uptime: 0.8,
    minerCount: 33,
    hashrateTH: d.hashrateTH,
    efficiencyJPerTH: d.efficiencyJPerTH,
    blurb: 'Curtailed-wind surplus on a post-subsidy site.',
  },
  {
    key: 'hamburg',
    name: 'Hamburg Solar',
    location: 'Hamburg · DE',
    energyType: 'solar',
    energyEurPerKwh: 0.05,
    uptime: 0.68,
    minerCount: 20,
    hashrateTH: d.hashrateTH,
    efficiencyJPerTH: d.efficiencyJPerTH,
    blurb: 'Daytime solar peaks, daylight-weighted dispatch.',
  },
  {
    key: 'bremen',
    name: 'Bremen Mix',
    location: 'Bremen · DE',
    energyType: 'mixed',
    energyEurPerKwh: 0.042,
    uptime: 0.82,
    minerCount: 25,
    hashrateTH: d.hashrateTH,
    efficiencyJPerTH: d.efficiencyJPerTH,
    blurb: 'Blended renewable surplus, steady throughput.',
  },
  {
    key: 'custom',
    name: 'Custom Rig',
    location: 'Anywhere',
    energyType: 'custom',
    energyEurPerKwh: 0.06,
    uptime: 0.85,
    minerCount: 10,
    hashrateTH: d.hashrateTH,
    efficiencyJPerTH: d.efficiencyJPerTH,
    blurb: 'Define your own energy, uptime, and fleet.',
  },
];

export function presetByKey(key: string): MiningPreset {
  return MINING_PRESETS.find((p) => p.key === key) ?? MINING_PRESETS[0];
}
