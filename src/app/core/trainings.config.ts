/**
 * The 25 training programmes listed on the client's current site (codes ATP1–ATP25).
 * Titles and objectives come from that page, tidied; full text lives in the i18n
 * files under "trainings.programmes.<key>". Themes are a grouping added for browsing.
 */
export type TrainingTheme = 'fire' | 'health' | 'emergency' | 'culture' | 'highRisk' | 'logistics' | 'environment';

export interface Training {
  code: string;
  /** URL slug and i18n key. */
  key: string;
  theme: TrainingTheme;
  icon: string;
}

export const TRAINING_THEMES: { id: TrainingTheme; icon: string }[] = [
  { id: 'fire', icon: 'flame' },
  { id: 'health', icon: 'heartPulse' },
  { id: 'emergency', icon: 'siren' },
  { id: 'culture', icon: 'users' },
  { id: 'highRisk', icon: 'alert' },
  { id: 'logistics', icon: 'forklift' },
  { id: 'environment', icon: 'recycle' },
];

export const TRAININGS: Training[] = [
  { code: 'ATP1', key: 'atp1', theme: 'fire', icon: 'flame' },
  { code: 'ATP2', key: 'atp2', theme: 'health', icon: 'firstAid' },
  { code: 'ATP3', key: 'atp3', theme: 'health', icon: 'heartPulse' },
  { code: 'ATP4', key: 'atp4', theme: 'emergency', icon: 'exit' },
  { code: 'ATP5', key: 'atp5', theme: 'emergency', icon: 'siren' },
  { code: 'ATP6', key: 'atp6', theme: 'fire', icon: 'hydrant' },
  { code: 'ATP7', key: 'atp7', theme: 'culture', icon: 'brain' },
  { code: 'ATP8', key: 'atp8', theme: 'logistics', icon: 'car' },
  { code: 'ATP9', key: 'atp9', theme: 'highRisk', icon: 'flask' },
  { code: 'ATP10', key: 'atp10', theme: 'highRisk', icon: 'bolt' },
  { code: 'ATP11', key: 'atp11', theme: 'culture', icon: 'shield' },
  { code: 'ATP12', key: 'atp12', theme: 'environment', icon: 'home' },
  { code: 'ATP13', key: 'atp13', theme: 'highRisk', icon: 'weld' },
  { code: 'ATP14', key: 'atp14', theme: 'highRisk', icon: 'manhole' },
  { code: 'ATP15', key: 'atp15', theme: 'highRisk', icon: 'harness' },
  { code: 'ATP16', key: 'atp16', theme: 'health', icon: 'mask' },
  { code: 'ATP17', key: 'atp17', theme: 'health', icon: 'brain' },
  { code: 'ATP18', key: 'atp18', theme: 'environment', icon: 'recycle' },
  { code: 'ATP19', key: 'atp19', theme: 'culture', icon: 'grid5' },
  { code: 'ATP20', key: 'atp20', theme: 'culture', icon: 'users' },
  { code: 'ATP21', key: 'atp21', theme: 'culture', icon: 'alert' },
  { code: 'ATP22', key: 'atp22', theme: 'fire', icon: 'airline' },
  { code: 'ATP23', key: 'atp23', theme: 'logistics', icon: 'box' },
  { code: 'ATP24', key: 'atp24', theme: 'logistics', icon: 'forklift' },
  { code: 'ATP25', key: 'atp25', theme: 'highRisk', icon: 'lockout' },
];

export const trainingByKey = (key: string): Training | undefined => TRAININGS.find((t) => t.key === key);
