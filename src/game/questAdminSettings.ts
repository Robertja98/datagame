export type QuestChapterArchetypeSetting = 'branch-heavy' | 'loop-heavy' | 'choke-heavy' | 'ring';

export type QuestAdminSettings = {
  globalDifficulty: number;
  mazeColumns: number;
  mazeRows: number;
  showBossTrail: boolean;
  extraDoorChanceMultiplier: number;
  chapter1Archetype: QuestChapterArchetypeSetting;
  chapter2Archetype: QuestChapterArchetypeSetting;
  chapter3Archetype: QuestChapterArchetypeSetting;
  chapter4Archetype: QuestChapterArchetypeSetting;
  requireGateMarking: boolean;
  trialsPerChapterMin: number;
  trialsPerChapterMax: number;
  chestCount: number;
  baseMonsterRoomsMin: number;
  baseMonsterRoomsMax: number;
  packMonsterCountMin: number;
  packMonsterCountMax: number;
  mainRouteMonsterBias: number;
  junctionMonsterBias: number;
  treasureBranchPackBias: number;
  bossApproachMonsterBias: number;
  enableHunterRoom: boolean;
  monsterHpMultiplier: number;
  monsterDamageBonus: number;
  monsterSpeedMultiplier: number;
  hunterHpMultiplier: number;
  hunterDamageBonus: number;
};

const STORAGE_KEY = 'data-game.quest-admin-settings';

export const DEFAULT_QUEST_ADMIN_SETTINGS: QuestAdminSettings = {
  globalDifficulty: 1,
  mazeColumns: 5,
  mazeRows: 8,
  showBossTrail: true,
  extraDoorChanceMultiplier: 1,
  chapter1Archetype: 'branch-heavy',
  chapter2Archetype: 'loop-heavy',
  chapter3Archetype: 'choke-heavy',
  chapter4Archetype: 'ring',
  requireGateMarking: false,
  trialsPerChapterMin: 4,
  trialsPerChapterMax: 4,
  chestCount: 3,
  baseMonsterRoomsMin: 1,
  baseMonsterRoomsMax: 2,
  packMonsterCountMin: 2,
  packMonsterCountMax: 3,
  mainRouteMonsterBias: 4,
  junctionMonsterBias: 5,
  treasureBranchPackBias: 5,
  bossApproachMonsterBias: 6,
  enableHunterRoom: true,
  monsterHpMultiplier: 1,
  monsterDamageBonus: 0,
  monsterSpeedMultiplier: 1,
  hunterHpMultiplier: 2,
  hunterDamageBonus: 1,
};

function normalizeArchetype(value: unknown, fallback: QuestChapterArchetypeSetting): QuestChapterArchetypeSetting {
  switch (value) {
    case 'branch-heavy':
    case 'loop-heavy':
    case 'choke-heavy':
    case 'ring':
      return value;
    default:
      return fallback;
  }
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  return Math.round(clampNumber(value, min, max, fallback));
}

export function normalizeQuestAdminSettings(value: Partial<QuestAdminSettings> | null | undefined): QuestAdminSettings {
  const draft = value ?? {};
  const trialsPerChapterMin = clampInteger(draft.trialsPerChapterMin, 1, 8, DEFAULT_QUEST_ADMIN_SETTINGS.trialsPerChapterMin);
  const trialsPerChapterMax = clampInteger(draft.trialsPerChapterMax, trialsPerChapterMin, 8, DEFAULT_QUEST_ADMIN_SETTINGS.trialsPerChapterMax);
  const baseMonsterRoomsMin = clampInteger(draft.baseMonsterRoomsMin, 0, 6, DEFAULT_QUEST_ADMIN_SETTINGS.baseMonsterRoomsMin);
  const baseMonsterRoomsMax = clampInteger(draft.baseMonsterRoomsMax, baseMonsterRoomsMin, 8, DEFAULT_QUEST_ADMIN_SETTINGS.baseMonsterRoomsMax);
  const packMonsterCountMin = clampInteger(draft.packMonsterCountMin, 0, 5, DEFAULT_QUEST_ADMIN_SETTINGS.packMonsterCountMin);
  const packMonsterCountMax = clampInteger(draft.packMonsterCountMax, packMonsterCountMin, 6, DEFAULT_QUEST_ADMIN_SETTINGS.packMonsterCountMax);

  return {
    globalDifficulty: clampNumber(draft.globalDifficulty, 0.5, 3, DEFAULT_QUEST_ADMIN_SETTINGS.globalDifficulty),
    mazeColumns: clampInteger(draft.mazeColumns, 4, 8, DEFAULT_QUEST_ADMIN_SETTINGS.mazeColumns),
    mazeRows: clampInteger(draft.mazeRows, 6, 12, DEFAULT_QUEST_ADMIN_SETTINGS.mazeRows),
    showBossTrail: typeof draft.showBossTrail === 'boolean' ? draft.showBossTrail : DEFAULT_QUEST_ADMIN_SETTINGS.showBossTrail,
    extraDoorChanceMultiplier: clampNumber(draft.extraDoorChanceMultiplier, 0, 2.5, DEFAULT_QUEST_ADMIN_SETTINGS.extraDoorChanceMultiplier),
    chapter1Archetype: normalizeArchetype(draft.chapter1Archetype, DEFAULT_QUEST_ADMIN_SETTINGS.chapter1Archetype),
    chapter2Archetype: normalizeArchetype(draft.chapter2Archetype, DEFAULT_QUEST_ADMIN_SETTINGS.chapter2Archetype),
    chapter3Archetype: normalizeArchetype(draft.chapter3Archetype, DEFAULT_QUEST_ADMIN_SETTINGS.chapter3Archetype),
    chapter4Archetype: normalizeArchetype(draft.chapter4Archetype, DEFAULT_QUEST_ADMIN_SETTINGS.chapter4Archetype),
    requireGateMarking: typeof draft.requireGateMarking === 'boolean' ? draft.requireGateMarking : DEFAULT_QUEST_ADMIN_SETTINGS.requireGateMarking,
    trialsPerChapterMin,
    trialsPerChapterMax,
    chestCount: clampInteger(draft.chestCount, 0, 6, DEFAULT_QUEST_ADMIN_SETTINGS.chestCount),
    baseMonsterRoomsMin,
    baseMonsterRoomsMax,
    packMonsterCountMin,
    packMonsterCountMax,
    mainRouteMonsterBias: clampInteger(draft.mainRouteMonsterBias, 0, 10, DEFAULT_QUEST_ADMIN_SETTINGS.mainRouteMonsterBias),
    junctionMonsterBias: clampInteger(draft.junctionMonsterBias, 0, 10, DEFAULT_QUEST_ADMIN_SETTINGS.junctionMonsterBias),
    treasureBranchPackBias: clampInteger(draft.treasureBranchPackBias, 0, 10, DEFAULT_QUEST_ADMIN_SETTINGS.treasureBranchPackBias),
    bossApproachMonsterBias: clampInteger(draft.bossApproachMonsterBias, 0, 10, DEFAULT_QUEST_ADMIN_SETTINGS.bossApproachMonsterBias),
    enableHunterRoom: typeof draft.enableHunterRoom === 'boolean' ? draft.enableHunterRoom : DEFAULT_QUEST_ADMIN_SETTINGS.enableHunterRoom,
    monsterHpMultiplier: clampNumber(draft.monsterHpMultiplier, 0.5, 4, DEFAULT_QUEST_ADMIN_SETTINGS.monsterHpMultiplier),
    monsterDamageBonus: clampInteger(draft.monsterDamageBonus, 0, 6, DEFAULT_QUEST_ADMIN_SETTINGS.monsterDamageBonus),
    monsterSpeedMultiplier: clampNumber(draft.monsterSpeedMultiplier, 0.5, 2.5, DEFAULT_QUEST_ADMIN_SETTINGS.monsterSpeedMultiplier),
    hunterHpMultiplier: clampNumber(draft.hunterHpMultiplier, 1, 5, DEFAULT_QUEST_ADMIN_SETTINGS.hunterHpMultiplier),
    hunterDamageBonus: clampInteger(draft.hunterDamageBonus, 0, 6, DEFAULT_QUEST_ADMIN_SETTINGS.hunterDamageBonus),
  };
}

export function getQuestAdminSettings(): QuestAdminSettings {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return DEFAULT_QUEST_ADMIN_SETTINGS;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return DEFAULT_QUEST_ADMIN_SETTINGS;
    }

    return normalizeQuestAdminSettings(JSON.parse(storedValue) as Partial<QuestAdminSettings>);
  } catch {
    return DEFAULT_QUEST_ADMIN_SETTINGS;
  }
}

export function saveQuestAdminSettings(settings: QuestAdminSettings): QuestAdminSettings {
  const normalizedSettings = normalizeQuestAdminSettings(settings);
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSettings));
  }
  return normalizedSettings;
}

export function resetQuestAdminSettings(): QuestAdminSettings {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_QUEST_ADMIN_SETTINGS;
}
