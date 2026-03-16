import './dungeonMaster.css';
import {
  DEFAULT_QUEST_ADMIN_SETTINGS,
  getQuestAdminSettings,
  normalizeQuestAdminSettings,
  resetQuestAdminSettings,
  saveQuestAdminSettings,
  type QuestChapterArchetypeSetting,
  type QuestAdminSettings,
} from './game/questAdminSettings';

type NumericFieldConfig = {
  key: keyof QuestAdminSettings;
  label: string;
  description: string;
  step?: number;
  min?: number;
  max?: number;
};

type BooleanFieldConfig = {
  key: keyof QuestAdminSettings;
  label: string;
  description: string;
};

type SelectFieldConfig = {
  key: keyof QuestAdminSettings;
  label: string;
  description: string;
  options: Array<{ value: string; label: string }>;
};

type MapSizePreset = {
  key: string;
  label: string;
  description: string;
  columns: number;
  rows: number;
};

const archetypeOptions: Array<{ value: QuestChapterArchetypeSetting; label: string }> = [
  { value: 'branch-heavy', label: 'Branch Heavy' },
  { value: 'loop-heavy', label: 'Loop Heavy' },
  { value: 'choke-heavy', label: 'Choke Heavy' },
  { value: 'ring', label: 'Ring and Spokes' },
];

const mapSizePresets: MapSizePreset[] = [
  {
    key: 'compact',
    label: 'Compact',
    description: 'Shorter mountain with fewer rooms and a tighter scroll footprint.',
    columns: 4,
    rows: 6,
  },
  {
    key: 'standard',
    label: 'Standard',
    description: 'Baseline Cloudy Mountain-style footprint with readable room spacing.',
    columns: 5,
    rows: 8,
  },
  {
    key: 'sprawling',
    label: 'Sprawling',
    description: 'Broader chapter map for longer hunts and more branch space.',
    columns: 6,
    rows: 9,
  },
  {
    key: 'expedition',
    label: 'Expedition',
    description: 'Large mountain footprint that leans into long scrolling exploration.',
    columns: 7,
    rows: 10,
  },
];

const selectSections: Array<{ title: string; description: string; fields: SelectFieldConfig[] }> = [
  {
    title: 'Chapter Archetypes',
    description: 'Choose the structural identity for each mountain instead of reusing one maze pattern everywhere.',
    fields: [
      { key: 'chapter1Archetype', label: 'Key Mountain archetype', description: 'Early-game layout identity.', options: archetypeOptions },
      { key: 'chapter2Archetype', label: 'Boat Mountain archetype', description: 'Mid-game layout identity.', options: archetypeOptions },
      { key: 'chapter3Archetype', label: 'Axe Mountain archetype', description: 'Late-game layout identity.', options: archetypeOptions },
      { key: 'chapter4Archetype', label: 'Cloudy Mountain archetype', description: 'Final chapter layout identity.', options: archetypeOptions },
    ],
  },
];

const numericSections: Array<{ title: string; description: string; fields: NumericFieldConfig[] }> = [
  {
    title: 'Maze Layout Advanced',
    description: 'Control how many rooms and optional side doors each mountain can generate. Extra rows and columns now expand the scrolling dungeon instead of shrinking the room scale.',
    fields: [
      { key: 'mazeColumns', label: 'Maze columns', description: 'More columns increases total horizontal gates and widens each chapter map.', min: 4, max: 8, step: 1 },
      { key: 'mazeRows', label: 'Maze rows', description: 'More rows increases total vertical gates and deepens each chapter map.', min: 6, max: 12, step: 1 },
      { key: 'extraDoorChanceMultiplier', label: 'Extra door chance multiplier', description: 'Higher values create more optional passages.', min: 0, max: 2.5, step: 0.05 },
    ],
  },
  {
    title: 'Gate Progression',
    description: 'These settings control how many seals must be cleared before the boss can activate.',
    fields: [
      { key: 'trialsPerChapterMin', label: 'Minimum gates to open', description: 'Lower bound for seals or gates to clear per chapter.', min: 1, max: 8, step: 1 },
      { key: 'trialsPerChapterMax', label: 'Maximum gates to open', description: 'Upper bound for seals or gates to clear per chapter.', min: 1, max: 8, step: 1 },
      { key: 'chestCount', label: 'Relic chest count', description: 'How many chapter chests can spawn.', min: 0, max: 6, step: 1 },
    ],
  },
  {
    title: 'Monster Population',
    description: 'Control how many monster rooms exist before pack and hunter specials are added.',
    fields: [
      { key: 'baseMonsterRoomsMin', label: 'Minimum standard monster rooms', description: 'Lower bound for ordinary monster placements.', min: 0, max: 6, step: 1 },
      { key: 'baseMonsterRoomsMax', label: 'Maximum standard monster rooms', description: 'Upper bound for ordinary monster placements.', min: 0, max: 8, step: 1 },
      { key: 'packMonsterCountMin', label: 'Minimum pack size', description: 'Lower bound for dead-end pack encounters.', min: 0, max: 5, step: 1 },
      { key: 'packMonsterCountMax', label: 'Maximum pack size', description: 'Upper bound for dead-end pack encounters.', min: 0, max: 6, step: 1 },
      { key: 'mainRouteMonsterBias', label: 'Main-route monster bias', description: 'Higher values push more standard monsters onto the main route.', min: 0, max: 10, step: 1 },
      { key: 'junctionMonsterBias', label: 'Junction monster bias', description: 'Higher values favor monsters at forks and decision points.', min: 0, max: 10, step: 1 },
      { key: 'treasureBranchPackBias', label: 'Treasure-branch pack bias', description: 'Higher values keep pack encounters guarding treasure branches.', min: 0, max: 10, step: 1 },
      { key: 'bossApproachMonsterBias', label: 'Boss-approach monster bias', description: 'Higher values pressure the final approach to the boss room.', min: 0, max: 10, step: 1 },
    ],
  },
  {
    title: 'Monster Difficulty',
    description: 'Global multipliers for monster health, damage, movement, and hunter pressure.',
    fields: [
      { key: 'globalDifficulty', label: 'Global difficulty multiplier', description: 'Raises overall monster threat across the mountain.', min: 0.5, max: 3, step: 0.1 },
      { key: 'monsterHpMultiplier', label: 'Monster HP multiplier', description: 'Scales standard monster health.', min: 0.5, max: 4, step: 0.1 },
      { key: 'monsterDamageBonus', label: 'Flat monster damage bonus', description: 'Adds extra contact damage on top of chapter scaling.', min: 0, max: 6, step: 1 },
      { key: 'monsterSpeedMultiplier', label: 'Monster speed multiplier', description: 'Scales movement speed for all hidden monsters.', min: 0.5, max: 2.5, step: 0.05 },
      { key: 'hunterHpMultiplier', label: 'Hunter HP multiplier', description: 'Extra health for the chasing dead-end monster.', min: 1, max: 5, step: 0.1 },
      { key: 'hunterDamageBonus', label: 'Hunter damage bonus', description: 'Extra contact damage on the chasing dead-end monster.', min: 0, max: 6, step: 1 },
    ],
  },
];

const booleanFields: BooleanFieldConfig[] = [
  {
    key: 'showBossTrail',
    label: 'Show boss trail',
    description: 'Displays the connected dungeon trail toward the boss chamber. Turn it off for a less guided cave read.',
  },
  {
    key: 'requireGateMarking',
    label: 'Require manual gate marking',
    description: 'When off, clearing the current seal auto-opens the next route in order. When on, the player must tag the target gate first.',
  },
  {
    key: 'enableHunterRoom',
    label: 'Enable hunter dead-end room',
    description: 'Turns the double-HP chasing monster room on or off per chapter.',
  },
];

let draftSettings = getQuestAdminSettings();
let savedSettings = draftSettings;
let statusMessage = 'Saved settings apply to the next quest run or restart.';

const BASE_DUNGEON_CHAPTER_SIZE = {
  width: 1168,
  height: 456,
  columns: 5,
  rows: 8,
};

const QUEST_HERO_TEXTURE_SIZE = 48;
const QUEST_HERO_DUNGEON_SCALE = 0.78;
const QUEST_HERO_RENDER_SIZE = QUEST_HERO_TEXTURE_SIZE * QUEST_HERO_DUNGEON_SCALE;
const QUEST_MIN_ROOM_SIZE = {
  width: Math.round(QUEST_HERO_RENDER_SIZE * 2.1),
  height: Math.round(QUEST_HERO_RENDER_SIZE * 1.45),
};
const QUEST_TARGET_CELL_SIZE = {
  width: QUEST_MIN_ROOM_SIZE.width + 24,
  height: QUEST_MIN_ROOM_SIZE.height + 20,
};

const DUNGEON_WORLD_GAP = {
  horizontal: 72,
  vertical: 68,
};

function getInteriorGateSlots(settings: QuestAdminSettings): number {
  return (settings.mazeColumns - 1) * settings.mazeRows + (settings.mazeRows - 1) * settings.mazeColumns;
}

function getActiveMapSizePreset(settings: QuestAdminSettings): MapSizePreset | undefined {
  return mapSizePresets.find((preset) => preset.columns === settings.mazeColumns && preset.rows === settings.mazeRows);
}

function getChapterFootprint(settings: QuestAdminSettings): { width: number; height: number } {
  return {
    width: Math.max(
      Math.round(BASE_DUNGEON_CHAPTER_SIZE.width * (settings.mazeColumns / BASE_DUNGEON_CHAPTER_SIZE.columns)),
      settings.mazeColumns * QUEST_TARGET_CELL_SIZE.width,
    ),
    height: Math.max(
      Math.round(BASE_DUNGEON_CHAPTER_SIZE.height * (settings.mazeRows / BASE_DUNGEON_CHAPTER_SIZE.rows)),
      settings.mazeRows * QUEST_TARGET_CELL_SIZE.height,
    ),
  };
}

function getMinimumRoomScale(settings: QuestAdminSettings): { width: number; height: number } {
  const chapterFootprint = getChapterFootprint(settings);
  const averageCellWidth = chapterFootprint.width / settings.mazeColumns;
  const averageCellHeight = chapterFootprint.height / settings.mazeRows;
  const insetX = Math.min(22, Math.max(10, Math.round(averageCellWidth * 0.12)));
  const insetY = Math.min(14, Math.max(6, Math.round(averageCellHeight * 0.14)));
  const estimatedMinRoomWidth = Math.max(QUEST_MIN_ROOM_SIZE.width, Math.round(averageCellWidth * 0.62));
  const estimatedMinRoomHeight = Math.max(QUEST_MIN_ROOM_SIZE.height, Math.round(averageCellHeight * 0.56));

  return {
    width: Math.min(Math.round(averageCellWidth - insetX * 2), estimatedMinRoomWidth),
    height: Math.min(Math.round(averageCellHeight - insetY * 2), estimatedMinRoomHeight),
  };
}

function getHeroScaleDescriptor(settings: QuestAdminSettings): string {
  const minimumRoomScale = getMinimumRoomScale(settings);
  const widthRatio = minimumRoomScale.width / QUEST_HERO_RENDER_SIZE;
  const heightRatio = minimumRoomScale.height / QUEST_HERO_RENDER_SIZE;
  const tightness = Math.min(widthRatio, heightRatio);

  if (tightness >= 2.2) {
    return 'wide against hero';
  }

  if (tightness >= 1.7) {
    return 'readable against hero';
  }

  return 'tight against hero';
}

function renderMapSizeSection(settings: QuestAdminSettings): string {
  const activePreset = getActiveMapSizePreset(settings);

  return `
    <section class="section">
      <div class="section-header">
        <h2>Map Size</h2>
        <p class="help">Choose dungeon size by how it should feel around the hero. These presets set rows and columns for you, while the advanced layout section below still lets you tune the grid directly.</p>
      </div>
      <div class="preset-grid">
        ${mapSizePresets.map((preset) => {
          const presetSettings = normalizeQuestAdminSettings({
            ...settings,
            mazeColumns: preset.columns,
            mazeRows: preset.rows,
          });
          const footprint = getChapterFootprint(presetSettings);
          const roomScale = getMinimumRoomScale(presetSettings);
          const scaleRead = getHeroScaleDescriptor(presetSettings);
          const isActive = activePreset?.key === preset.key;

          return `
            <button class="preset-card ${isActive ? 'preset-card-active' : ''}" data-action="apply-map-preset" data-map-preset="${preset.key}" type="button">
              <span class="preset-title-row">
                <strong>${preset.label}</strong>
                <span>${preset.columns} x ${preset.rows}</span>
              </span>
              <span class="preset-description">${preset.description}</span>
              <span class="preset-meta">Chapter ${footprint.width} x ${footprint.height}</span>
              <span class="preset-meta">Room ${roomScale.width} x ${roomScale.height}</span>
              <span class="preset-meta">${scaleRead}</span>
            </button>
          `;
        }).join('')}
      </div>
      <p class="preset-summary">Current map size: ${activePreset ? activePreset.label : `Custom ${settings.mazeColumns} x ${settings.mazeRows}`}</p>
    </section>
  `;
}

function getScrollWorldFootprint(settings: QuestAdminSettings): { width: number; height: number } {
  const chapterFootprint = getChapterFootprint(settings);

  return {
    width: (chapterFootprint.width * 2) + DUNGEON_WORLD_GAP.horizontal,
    height: (chapterFootprint.height * 2) + DUNGEON_WORLD_GAP.vertical,
  };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function renderField(field: NumericFieldConfig, settings: QuestAdminSettings): string {
  const value = settings[field.key] as number;
  return `
    <div class="field">
      <label for="${String(field.key)}">${field.label}</label>
      <span>${field.description}</span>
      <input id="${String(field.key)}" data-field-key="${String(field.key)}" type="number" value="${formatNumber(value)}" min="${field.min ?? ''}" max="${field.max ?? ''}" step="${field.step ?? 1}" />
    </div>
  `;
}

function renderToggle(field: BooleanFieldConfig, settings: QuestAdminSettings): string {
  const enabled = settings[field.key] as boolean;
  return `
    <label class="checkbox-field">
      <input data-toggle-key="${String(field.key)}" type="checkbox" ${enabled ? 'checked' : ''} />
      <div>
        <div>${field.label}</div>
        <span>${field.description}</span>
      </div>
    </label>
  `;
}

function renderSelectField(field: SelectFieldConfig, settings: QuestAdminSettings): string {
  const value = settings[field.key] as string;
  return `
    <div class="field">
      <label for="${String(field.key)}">${field.label}</label>
      <span>${field.description}</span>
      <select id="${String(field.key)}" data-select-key="${String(field.key)}">
        ${field.options.map((option) => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`).join('')}
      </select>
    </div>
  `;
}

function render(): string {
  const unsavedChanges = JSON.stringify(draftSettings) !== JSON.stringify(savedSettings);
  const chapterFootprint = getChapterFootprint(draftSettings);
  const scrollWorldFootprint = getScrollWorldFootprint(draftSettings);
  const minimumRoomScale = getMinimumRoomScale(draftSettings);
  const heroScaleDescriptor = getHeroScaleDescriptor(draftSettings);
  const activePreset = getActiveMapSizePreset(draftSettings);
  return `
    <main class="shell">
      <section class="hero">
        <div>
          <p class="eyebrow">Dungeon Master Console</p>
          <h1>Control the mountain instead of hard-coding it.</h1>
          <p class="intro">Tune dungeon size, how many gates must open, how many monsters appear, and how dangerous those monsters are. Save once, then restart a quest run to apply the new rules.</p>
          <div class="links">
            <a class="link" href="/">Open game</a>
            <a class="link" href="/admin.html">Question review page</a>
          </div>
        </div>
        <div>
          <p class="status">${statusMessage}</p>
          <p class="hero-meta">${unsavedChanges ? 'Unsaved changes are waiting.' : 'Settings are saved.'}</p>
          <div class="hero-actions">
            <button class="button" data-action="save">Save settings</button>
            <button class="secondary-button" data-action="reset">Reset defaults</button>
            <button class="secondary-button" data-action="reload">Reload saved values</button>
          </div>
        </div>
      </section>

      <section class="layout">
        <div class="sections">
          ${renderMapSizeSection(draftSettings)}

          ${selectSections.map((section) => `
            <section class="section">
              <div class="section-header">
                <h2>${section.title}</h2>
                <p class="help">${section.description}</p>
              </div>
              <div class="field-grid">
                ${section.fields.map((field) => renderSelectField(field, draftSettings)).join('')}
              </div>
            </section>
          `).join('')}

          ${numericSections.map((section) => `
            <section class="section">
              <div class="section-header">
                <h2>${section.title}</h2>
                <p class="help">${section.description}</p>
              </div>
              <div class="field-grid">
                ${section.fields.map((field) => renderField(field, draftSettings)).join('')}
              </div>
            </section>
          `).join('')}

          <section class="section">
            <div class="section-header">
              <h2>Route Rules</h2>
              <p class="help">Switch between a guided seal path and manual gate-tagging, then decide whether hunter rooms can appear.</p>
            </div>
            <div class="sections">
              ${booleanFields.map((field) => renderToggle(field, draftSettings)).join('')}
            </div>
          </section>
        </div>

        <aside class="preview-card">
          <h2>Preview</h2>
          <p class="preview-copy">This summary shows what the current settings mean before you return to the game.</p>
          <div class="preview-list">
            <div class="preview-item"><span>Chapter footprint</span><strong>${chapterFootprint.width} x ${chapterFootprint.height}</strong></div>
            <div class="preview-item"><span>Scroll world footprint</span><strong>${scrollWorldFootprint.width} x ${scrollWorldFootprint.height}</strong></div>
            <div class="preview-item"><span>Minimum room vs hero</span><strong>${minimumRoomScale.width} x ${minimumRoomScale.height}</strong></div>
            <div class="preview-item"><span>Scale read</span><strong>${heroScaleDescriptor}</strong></div>
            <div class="preview-item"><span>Map size mode</span><strong>${activePreset ? activePreset.label : 'Custom'}</strong></div>
            <div class="preview-item"><span>Total interior gate slots per maze</span><strong>${getInteriorGateSlots(draftSettings)}</strong></div>
            <div class="preview-item"><span>Gates or seals to open per chapter</span><strong>${draftSettings.trialsPerChapterMin}${draftSettings.trialsPerChapterMin === draftSettings.trialsPerChapterMax ? '' : `-${draftSettings.trialsPerChapterMax}`}</strong></div>
            <div class="preview-item"><span>Standard monster rooms</span><strong>${draftSettings.baseMonsterRoomsMin}${draftSettings.baseMonsterRoomsMin === draftSettings.baseMonsterRoomsMax ? '' : `-${draftSettings.baseMonsterRoomsMax}`}</strong></div>
            <div class="preview-item"><span>Pack size</span><strong>${draftSettings.packMonsterCountMin}${draftSettings.packMonsterCountMin === draftSettings.packMonsterCountMax ? '' : `-${draftSettings.packMonsterCountMax}`}</strong></div>
            <div class="preview-item"><span>Hunter rooms</span><strong>${draftSettings.enableHunterRoom ? 'enabled' : 'disabled'}</strong></div>
            <div class="preview-item"><span>Route mode</span><strong>${draftSettings.requireGateMarking ? 'manual gate marking' : 'auto route opening'}</strong></div>
            <div class="preview-item"><span>Boss trail</span><strong>${draftSettings.showBossTrail ? 'visible' : 'hidden'}</strong></div>
            <div class="preview-item"><span>Cloudy Mountain</span><strong>${archetypeOptions.find((option) => option.value === draftSettings.chapter4Archetype)?.label ?? draftSettings.chapter4Archetype}</strong></div>
          </div>
        </aside>
      </section>
    </main>
  `;
}

function syncInputSettings(target: HTMLInputElement | HTMLSelectElement): void {
  const fieldKey = target.dataset.fieldKey as keyof QuestAdminSettings | undefined;
  if (fieldKey) {
    draftSettings = normalizeQuestAdminSettings({
      ...draftSettings,
      [fieldKey]: target.value,
    });
    return;
  }

  const toggleKey = target.dataset.toggleKey as keyof QuestAdminSettings | undefined;
  if (toggleKey && target instanceof HTMLInputElement) {
    draftSettings = normalizeQuestAdminSettings({
      ...draftSettings,
      [toggleKey]: target.checked,
    });
    return;
  }

  const selectKey = target.dataset.selectKey as keyof QuestAdminSettings | undefined;
  if (selectKey) {
    draftSettings = normalizeQuestAdminSettings({
      ...draftSettings,
      [selectKey]: target.value,
    });
  }
}

type MountOptions = {
  preserveScroll?: boolean;
  focusFieldKey?: string;
  focusToggleKey?: string;
  focusSelectKey?: string;
};

function mount(app: HTMLDivElement, options: MountOptions = {}): void {
  const scrollY = options.preserveScroll ? window.scrollY : 0;
  app.innerHTML = render();

  if (options.focusFieldKey) {
    const input = app.querySelector<HTMLInputElement>(`input[data-field-key="${options.focusFieldKey}"]`);
    input?.focus();
  }

  if (options.focusToggleKey) {
    const input = app.querySelector<HTMLInputElement>(`input[data-toggle-key="${options.focusToggleKey}"]`);
    input?.focus();
  }

  if (options.focusSelectKey) {
    const input = app.querySelector<HTMLSelectElement>(`select[data-select-key="${options.focusSelectKey}"]`);
    input?.focus();
  }

  if (options.preserveScroll) {
    window.scrollTo({ top: scrollY, left: window.scrollX, behavior: 'auto' });
  }
}

function bootstrap(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    return;
  }

  mount(app);

  app.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) {
      return;
    }

    syncInputSettings(target);
    mount(app, {
      preserveScroll: true,
      focusFieldKey: target instanceof HTMLInputElement ? target.dataset.fieldKey : undefined,
      focusToggleKey: target instanceof HTMLInputElement ? target.dataset.toggleKey : undefined,
      focusSelectKey: target instanceof HTMLSelectElement ? target.dataset.selectKey : undefined,
    });
  });

  app.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') {
      return;
    }

    syncInputSettings(target);
    mount(app, {
      preserveScroll: true,
      focusToggleKey: target.dataset.toggleKey,
    });
  });

  app.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const action = target.dataset.action;
    if (action === 'apply-map-preset') {
      const presetKey = target.dataset.mapPreset;
      const preset = mapSizePresets.find((candidate) => candidate.key === presetKey);
      if (!preset) {
        return;
      }

      draftSettings = normalizeQuestAdminSettings({
        ...draftSettings,
        mazeColumns: preset.columns,
        mazeRows: preset.rows,
      });
      statusMessage = `${preset.label} map size loaded. Save settings to apply it to the next quest run.`;
      mount(app, { preserveScroll: true });
      return;
    }

    if (action === 'save') {
      savedSettings = saveQuestAdminSettings(draftSettings);
      draftSettings = savedSettings;
      statusMessage = 'Dungeon settings saved. Restart the quest scene or refresh the game to apply them.';
      mount(app, { preserveScroll: true });
      return;
    }

    if (action === 'reset') {
      draftSettings = resetQuestAdminSettings();
      savedSettings = DEFAULT_QUEST_ADMIN_SETTINGS;
      statusMessage = 'Defaults restored. The stored override was removed.';
      mount(app, { preserveScroll: true });
      return;
    }

    if (action === 'reload') {
      draftSettings = getQuestAdminSettings();
      savedSettings = draftSettings;
      statusMessage = 'Reloaded the currently saved dungeon settings.';
      mount(app, { preserveScroll: true });
    }
  });
}

bootstrap();
