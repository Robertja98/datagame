import Phaser from 'phaser';

import { getQuestAdminSettings, type QuestAdminSettings, type QuestChapterArchetypeSetting } from '../game/questAdminSettings';
import { downloadQuestionStatsCsv, fetchApprovedCustomQuestions, flagQuestion, initializeQuestionTracker, recordQuestionAnswered, recordQuestionUsed } from '../game/questionTracker';
import { getCategoryLabel, getDifficultyLabel, QuestionDeck, questions, type MathQuestion } from '../game/questions';

type AnswerGate = Phaser.GameObjects.Image & {
  body: Phaser.Physics.Arcade.StaticBody;
  answerIndex: number;
  answerLabel: Phaser.GameObjects.Text;
  refreshBody: () => AnswerGate;
};

type EnemySprite = Phaser.Physics.Arcade.Image & {
  laneY: number;
  laneIndex: number;
  direction: 1 | -1;
  speedFactor: number;
  penaltyUntil: number;
  driftSeed: number;
  archetypeName: string;
  accentColor: number;
  baseScale: number;
  roamBounds?: Phaser.Geom.Rectangle;
  roamTurnAt: number;
};

type StageMode = 'frogger' | 'galaga' | 'centipede' | 'exam';

type GameMode = 'arcade' | 'quest';

type QuestViewMode = 'overworld' | 'dungeon';

type QuestEncounter = {
  chapterTitle: string;
  foeName: string;
  storyBeat: string;
  introText: string;
};

type QuestWall = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.StaticBody;
  chapter: 1 | 2 | 3 | 4;
  decorations?: Phaser.GameObjects.Shape[];
};

type QuestGate = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.StaticBody;
  chapter: 1 | 2 | 3 | 4;
  kind: 'intra' | 'frontier';
  roomKeys: string[];
  opened: boolean;
  orientation: 'horizontal' | 'vertical';
  decorations?: Phaser.GameObjects.Shape[];
};

type QuestTravelMarker = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.StaticBody;
  chapter: 1 | 2 | 3 | 4;
  markerKind: 'surface' | 'return';
  destinationX: number;
  destinationY: number;
  label: string;
  decorations?: Phaser.GameObjects.Shape[];
};

type QuestMonsterMoveStyle = 'skitter' | 'swoop' | 'drift' | 'lunge' | 'hunter';

type QuestMonsterBehavior = 'standard' | 'pack' | 'hunter';

type HiddenMonster = Phaser.Physics.Arcade.Image & {
  hiddenName: string;
  chapter: 1 | 2 | 3 | 4;
  roomKey: string;
  roomRole: QuestRoomRole;
  moveStyle: QuestMonsterMoveStyle;
  behavior: QuestMonsterBehavior;
  revealed: boolean;
  defeated: boolean;
  rewardScore: number;
  encounterId: string;
  accentColor: number;
  clueKind: 'tracks' | 'bones' | 'echo';
  clueSpotted: boolean;
  clueMarker?: Phaser.GameObjects.Image;
  roamBounds: Phaser.Geom.Rectangle;
  roamTurnAt: number;
  hp: number;
  maxHp: number;
  contactDamage: number;
  lastContactAt: number;
  driftSeed: number;
};

type QuestShot = Phaser.Physics.Arcade.Image & {
  damage: number;
};

type TreasureChest = Phaser.Physics.Arcade.Image & {
  chestId: string;
  chapter: 1 | 2 | 3 | 4;
  opened: boolean;
};

type QuestRelicKey = 'brass-key' | 'river-boat' | 'sun-axe';

type QuestRelic = {
  key: QuestRelicKey;
  title: string;
  shortLabel: string;
  sourceChapter: 1 | 2 | 3;
  unlocksChapter: 2 | 3 | 4;
  summary: string;
  locationHint: string;
};

type QuestTrial = Phaser.Physics.Arcade.Image & {
  trialId: string;
  chapter: 1 | 2 | 3 | 4;
  roomKey: string;
  solved: boolean;
};

type QuestFogZone = Phaser.GameObjects.Rectangle & {
  chapter: 1 | 2 | 3 | 4;
  revealed: boolean;
  exploreLevel: number;
};

type QuestBoss = Phaser.Physics.Arcade.Image & {
  chapter: 1 | 2 | 3 | 4;
  title: string;
  awakened: boolean;
  defeated: boolean;
  engaged: boolean;
  chamber: Phaser.Geom.Rectangle;
};

type QuestBossSpawn = {
  chapter: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  bossX: number;
  bossY: number;
  altarX: number;
  altarY: number;
  orbitRadius: number;
  chamber: Phaser.Geom.Rectangle;
};

type QuestBossHazard = Phaser.Physics.Arcade.Image & {
  damage: number;
  spawnedAt: number;
  pattern: 'ember' | 'sweep';
};

type QuestBossPillarFormation = 'ring' | 'line' | 'gate' | 'diagonal';

type QuestBossPillar = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  damage: number;
  phaseOffset: number;
};

type QuestWallSpec = {
  chapter: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  width: number;
  height: number;
};

type QuestChapterArchetype = QuestChapterArchetypeSetting;

type QuestRoomRole = 'entry' | 'main-route' | 'junction' | 'dead-end' | 'branch' | 'treasure-branch' | 'boss-approach';

type QuestDungeonRoom = {
  key: string;
  column: number;
  row: number;
  chapter: 1 | 2 | 3 | 4;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  bounds: Phaser.Geom.Rectangle;
  role: QuestRoomRole;
};

type QuestMonsterSpawn = {
  x: number;
  y: number;
  hiddenName: string;
  rewardScore: number;
  accentColor: number;
  clueKind: 'tracks' | 'bones' | 'echo';
  chapter: 1 | 2 | 3 | 4;
  roomKey: string;
  roomRole: QuestRoomRole;
  roamBounds: Phaser.Geom.Rectangle;
  moveStyle: QuestMonsterMoveStyle;
  behavior: QuestMonsterBehavior;
  maxHp: number;
  contactDamage: number;
};

type QuestDungeonLayout = {
  rooms: QuestDungeonRoom[];
  walls: QuestWallSpec[];
  routeSegments: Array<{ chapter: 1 | 2 | 3 | 4; fromX: number; fromY: number; toX: number; toY: number; emphasis: 'main-route' | 'boss-approach' }>;
  gateSpawns: Array<{ x: number; y: number; chapter: 1 | 2 | 3 | 4; width: number; height: number; kind: 'intra' | 'frontier'; roomKeys: string[] }>;
  travelMarkers: Array<{ x: number; y: number; width: number; height: number; label: string; chapter: 1 | 2 | 3 | 4; markerKind: 'surface' | 'return'; destinationX: number; destinationY: number }>;
  fogZones: Array<{ chapter: 1 | 2 | 3 | 4; x: number; y: number; width: number; height: number }>;
  trialSpawns: Array<{ x: number; y: number; chapter: 1 | 2 | 3 | 4; roomKey: string }>;
  chestSpawns: Array<{ x: number; y: number; chapter: 1 | 2 | 3 | 4 }>;
  monsterSpawns: QuestMonsterSpawn[];
  bossSpawns: QuestBossSpawn[];
};

type TreasureUpgrade = {
  title: string;
  category: string;
  rarity: string;
  summary: string;
  benefitLines: string[];
  accentColor: number;
  apply: () => void;
};

type TreasureLootSummary = {
  title: string;
  category: string;
  rarity: string;
  summary: string;
  benefitLines: string[];
  accentColor: number;
};

type VisibleQuestDecoration = Phaser.GameObjects.GameObject & {
  setVisible: (value: boolean) => Phaser.GameObjects.GameObject;
};

type ObstacleArchetype = {
  textureKey: string;
  label: string;
  accentColor: number;
  scale: number;
};

type CalculatorButtonConfig = {
  label: string;
  value: string;
  row: number;
  column: number;
  accentColor: number;
  widthCells?: number;
};

type CalculatorVariable = {
  token: string;
  label: string;
  value: number;
};

const OBSTACLE_ARCHETYPES: ObstacleArchetype[] = [
  { textureKey: 'enemy-chat-bubble', label: 'Group Chat Ping', accentColor: 0x7dd3fc, scale: 0.94 },
  { textureKey: 'enemy-skate-deck', label: 'Skate Deck', accentColor: 0xfbbf24, scale: 0.92 },
  { textureKey: 'enemy-energy-pop', label: 'Energy Pop', accentColor: 0xfb7185, scale: 0.94 },
  { textureKey: 'enemy-beat-pod', label: 'Beat Pod', accentColor: 0x38bdf8, scale: 0.96 },
  { textureKey: 'enemy-pocket-console', label: 'Pocket Console', accentColor: 0xa78bfa, scale: 0.92 },
  { textureKey: 'enemy-sneaker-drop', label: 'Sneaker Drop', accentColor: 0x34d399, scale: 0.94 },
];

const QUEST_ENCOUNTERS: QuestEncounter[] = [
  {
    chapterTitle: 'Foothill Maze',
    foeName: 'Goblin King',
    storyBeat: 'The party leaves the cabin for its first descent, searching the foothill maze for the Brass Key and enough arrows to survive the dark.',
    introText: 'The foothill passages swallow the light. Search for the Brass Key, listen for movement in the dark, and probe deeper room by room.',
  },
  {
    chapterTitle: 'Lower Caverns',
    foeName: 'Stone Giant',
    storyBeat: 'The Brass Key opens the next mountain. Now the expedition hunts the River Boat so the flooded passages no longer stop the journey.',
    introText: 'The lower caverns twist around drowned passages. Find the River Boat and keep the wingbeats from closing in around you.',
  },
  {
    chapterTitle: 'Dragon Lairs',
    foeName: 'Winged Drake',
    storyBeat: 'The River Boat carries the party inward. Somewhere in these lairs lies the Sun Axe, the last tool needed to cut the summit route open.',
    introText: 'These higher lairs breathe danger. Recover the Sun Axe, save your arrows, and clear the last road to Cloudy Mountain.',
  },
  {
    chapterTitle: 'Cloudy Summit',
    foeName: 'Cloudy Dragon',
    storyBeat: 'The Sun Axe opens Cloudy Mountain itself. Break the summit wards, face the dragon, seize the Crown of Kings, and carry it home.',
    introText: 'Cloudy Mountain waits at the end of the road. Break the summit wards, enter the crown chamber, and survive the dragon long enough to escape with the prize.',
  },
];

const QUEST_RELICS: QuestRelic[] = [
  {
    key: 'brass-key',
    title: 'Brass Key',
    shortLabel: 'key',
    sourceChapter: 1,
    unlocksChapter: 2,
    summary: 'Amber mountain passes unlock, one extra arrow is stowed, and the hunt pushes into the caverns.',
    locationHint: 'Hidden somewhere in the Foothill Maze.',
  },
  {
    key: 'river-boat',
    title: 'River Boat',
    shortLabel: 'boat',
    sourceChapter: 2,
    unlocksChapter: 3,
    summary: 'The flooded crossings open, max HP rises, and the expedition can reach the inner lairs.',
    locationHint: 'Hidden somewhere in the Lower Caverns.',
  },
  {
    key: 'sun-axe',
    title: 'Sun Axe',
    shortLabel: 'axe',
    sourceChapter: 3,
    unlocksChapter: 4,
    summary: 'The summit barriers can be split apart, bow strength rises, and the upper lair path opens.',
    locationHint: 'Hidden somewhere in the Dragon Lairs.',
  },
];

const QUEST_DUNGEON_BOUNDS = {
  left: 56,
  top: 248,
  width: 1168,
  height: 456,
};

const QUEST_DUNGEON_WORLD_BOUNDS = {
  left: 56,
  top: 248,
  width: 2408,
  height: 980,
};

const QUEST_DUNGEON_BASE_GRID = {
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

const QUEST_DUNGEON_WORLD_GAP = {
  horizontal: QUEST_DUNGEON_WORLD_BOUNDS.width - (QUEST_DUNGEON_BOUNDS.width * 2),
  vertical: QUEST_DUNGEON_WORLD_BOUNDS.height - (QUEST_DUNGEON_BOUNDS.height * 2),
};

const QUEST_WALL_THICKNESS = 16;
const QUEST_CHAPTER_TOPOLOGY: Record<1 | 2 | 3 | 4, {
  archetype: QuestChapterArchetype;
  extraDoorChance: number;
  frontierOpenings?: { min: number; max: number };
  startRowBias: 'deepest' | 'shallowest' | 'random';
  corridorBias: boolean;
}> = {
  1: {
    archetype: 'branch-heavy',
    extraDoorChance: 0.34,
    startRowBias: 'deepest',
    corridorBias: false,
  },
  2: {
    archetype: 'loop-heavy',
    extraDoorChance: 0.26,
    frontierOpenings: { min: 2, max: 3 },
    startRowBias: 'deepest',
    corridorBias: false,
  },
  3: {
    archetype: 'choke-heavy',
    extraDoorChance: 0.18,
    frontierOpenings: { min: 2, max: 2 },
    startRowBias: 'deepest',
    corridorBias: false,
  },
  4: {
    archetype: 'ring',
    extraDoorChance: 0.06,
    frontierOpenings: { min: 1, max: 1 },
    startRowBias: 'deepest',
    corridorBias: true,
  },
};
const QUEST_TRIAL_CONTACT_RADIUS = 36;
const QUEST_TREASURE_CONTACT_RADIUS = 34;
const QUEST_BOSS_CONTACT_RADIUS = 54;
const QUEST_GATE_FOCUS_RELEASE_RADIUS = 92;

const QUEST_MONSTER_NAMES = ['Spider', 'Bat', 'Wraith', 'Drake', 'Crawler', 'Wing Guard'];

const QUEST_CHAPTER_MONSTER_POOLS: Record<1 | 2 | 3 | 4, string[]> = {
  1: ['Spider', 'Crawler', 'Bat', 'Spider', 'Crawler'],
  2: ['Bat', 'Crawler', 'Wraith', 'Bat', 'Spider'],
  3: ['Drake', 'Wing Guard', 'Wraith', 'Drake', 'Crawler'],
  4: ['Wing Guard', 'Drake', 'Wraith', 'Bat', 'Wing Guard'],
};

export class GameScene extends Phaser.Scene {
  private static readonly CORRECT_REVIEW_DELAY_MS = 2200;
  private static readonly INCORRECT_REVIEW_DELAY_MS = 2200;
  private static readonly TRAFFIC_RESET_DELAY_MS = 600;
  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private calculatorKey!: Phaser.Input.Keyboard.Key;
  private flagKey!: Phaser.Input.Keyboard.Key;
  private exportKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  private gates: AnswerGate[] = [];
  private questChoiceTexts: Phaser.GameObjects.Text[] = [];
  private currentQuestion!: MathQuestion;
  private promptText!: Phaser.GameObjects.Text;
  private supportingDataText!: Phaser.GameObjects.Text;
  private categoryText!: Phaser.GameObjects.Text;
  private explanationText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private armoryText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private questAnswerInputPanel!: Phaser.GameObjects.Rectangle;
  private questAnswerInputText!: Phaser.GameObjects.Text;
  private questAnswerHintText!: Phaser.GameObjects.Text;
  private questJournalText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private treasureLootCard?: Phaser.GameObjects.Container;
  private treasureLootTimer?: Phaser.Time.TimerEvent;
  private calculatorContainer!: Phaser.GameObjects.Container;
  private calculatorVariableChipContainer!: Phaser.GameObjects.Container;
  private calculatorExpressionText!: Phaser.GameObjects.Text;
  private calculatorResultText!: Phaser.GameObjects.Text;
  private calculatorStatusText!: Phaser.GameObjects.Text;
  private calculatorGraphInfoText!: Phaser.GameObjects.Text;
  private calculatorGraphHintText!: Phaser.GameObjects.Text;
  private calculatorGraphGraphics!: Phaser.GameObjects.Graphics;
  private questionDeck = new QuestionDeck(questions, 4);
  private score = 0;
  private armoryShots = 0;
  private lives = 3;
  private level: 1 | 2 | 3 | 4 = 1;
  private correctAnswers = 0;
  private lastShotAt = 0;
  private acceptingAnswer = true;
  private gameOver = false;
  private recovering = false;
  private invulnerable = false;
  private invulnerabilityTween?: Phaser.Tweens.Tween;
  private currentStageMode: StageMode = 'frogger';
  private trackerReady = false;
  private audioContext?: AudioContext;
  private calculatorExpression = '';
  private calculatorResult = '0';
  private calculatorOpen = false;
  private calculatorJustEvaluated = false;
  private calculatorVariables: CalculatorVariable[] = [];
  private gameMode: GameMode = 'arcade';
  private heroHp = 26;
  private heroMaxHp = 26;
  private questWalls?: Phaser.Physics.Arcade.StaticGroup;
  private questGates?: Phaser.Physics.Arcade.StaticGroup;
  private questTravelMarkers?: Phaser.Physics.Arcade.StaticGroup;
  private questRooms: QuestDungeonRoom[] = [];
  private currentQuestRoomKey?: string;
  private questTrials?: Phaser.Physics.Arcade.Group;
  private hiddenMonsters?: Phaser.Physics.Arcade.Group;
  private treasureChests?: Phaser.Physics.Arcade.Group;
  private questBoss?: QuestBoss;
  private questBossAltar?: Phaser.GameObjects.Rectangle;
  private questBossHazards?: Phaser.Physics.Arcade.Group;
  private questBossPillars: QuestBossPillar[] = [];
  private questBossSpawns = new Map<1 | 2 | 3 | 4, QuestBossSpawn>();
  private defeatedQuestBossChapters = new Set<1 | 2 | 3 | 4>();
  private questFogZones: QuestFogZone[] = [];
  private focusedQuestGate?: QuestGate;
  private questionBankSnapshot: MathQuestion[] = [...questions];
  private currentQuestionSource: 'standard' | 'treasure' | 'boss' = 'standard';
  private activeQuestTrial?: QuestTrial;
  private activeTreasureChest?: TreasureChest;
  private questViewMode: QuestViewMode = 'overworld';
  private activeQuestTravelChapter: 1 | 2 | 3 | 4 = 1;
  private questOverworldPanel?: Phaser.GameObjects.Container;
  private questOverworldZoneTexts: Phaser.GameObjects.Text[] = [];
  private questOverworldFocusText?: Phaser.GameObjects.Text;
  private questChapterDecorations: Array<{ chapter: 1 | 2 | 3 | 4; object: VisibleQuestDecoration }> = [];
  private questWeaponTier = 0;
  private questArmorTier = 0;
  private questMagicTier = 0;
  private questRelics = new Set<QuestRelicKey>();
  private questRelicOrder: QuestRelicKey[] = [];
  private questTypedAnswer = '';
  private questAnswerInputFocused = false;
  private lastBossAttackAt = 0;
  private bossAttackStep = 0;
  private lastQuestTravelAt = 0;
  private questTravelBlockedUntil = 0;
  private questAdminSettings: QuestAdminSettings = getQuestAdminSettings();

  constructor() {
    super('game');
  }

  init(data?: { gameMode?: GameMode }): void {
    this.gameMode = data?.gameMode === 'quest' ? 'quest' : 'arcade';
    this.questAdminSettings = getQuestAdminSettings();
  }

  private usesManualQuestGateMarking(): boolean {
    return this.questAdminSettings.requireGateMarking;
  }

  private getQuestChapterArchetype(chapter: 1 | 2 | 3 | 4): QuestChapterArchetype {
    switch (chapter) {
      case 1:
        return this.questAdminSettings.chapter1Archetype;
      case 2:
        return this.questAdminSettings.chapter2Archetype;
      case 3:
        return this.questAdminSettings.chapter3Archetype;
      case 4:
      default:
        return this.questAdminSettings.chapter4Archetype;
    }
  }

  create(): void {
    if (this.gameMode === 'quest') {
      this.heroHp = 26;
      this.heroMaxHp = 26;
      this.questRelics.clear();
      this.questRelicOrder = [];
      this.questChapterDecorations = [];
      this.questViewMode = 'overworld';
      this.activeQuestTravelChapter = 1;
      this.currentStageMode = 'exam';
    }

    this.cameras.main.setBackgroundColor('#08111f');
    this.drawBackdrop();
    this.createHud();
    this.createControls();
    this.createCalculator();
    this.createPlayer();
    this.createQuestMaze();
    this.createEnemies();
    this.createAnswerGates();
    this.createCollisions();
    this.refreshQuestCameraState();

    this.promptText.setText('Connecting question tracker...');
    this.setExplanationMessage(
      this.gameMode === 'quest'
        ? 'Opening the quest ledger for chapter progress and question records.'
        : 'Starting the backend tracker for question records.',
      'Opening quest ledger.',
    );
    void this.initializeTracker();
  }

  update(time: number): void {
    if (!this.trackerReady) {
      return;
    }

    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.calculatorKey)) {
      this.toggleCalculator();
    }

    if (this.calculatorOpen) {
      this.player.setVelocity(0, 0);
      return;
    }

    const speed = 230;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }

    if (this.recovering || this.questAnswerInputFocused) {
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocity(velocityX, velocityY);
    }

    if (this.gameMode === 'quest' && this.questViewMode === 'dungeon') {
      this.updateQuestEnemyMovement(time);
      this.updateQuestGateFocus();
    } else {
      this.wrapEnemiesAcrossScreen();
      this.updateEnemyPatterns(time);
    }
    this.cleanupShots();
    this.updateQuestExploration();
    this.updateQuestBossEncounter(time);
    this.updateQuestReturnObjective();

    if (Phaser.Input.Keyboard.JustDown(this.flagKey)) {
      this.handleFlagCurrentQuestion();
    }

    if (Phaser.Input.Keyboard.JustDown(this.exportKey)) {
      this.handleExportCsv();
    }

    if (!this.questAnswerInputFocused && Phaser.Input.Keyboard.JustDown(this.fireKey) && time - this.lastShotAt > 250) {
      this.tryFireShot(time);
    }
  }

  private updateQuestReturnObjective(): void {
    if (this.gameMode !== 'quest' || this.gameOver || !this.player.active) {
      return;
    }

    if (!this.isQuestBossDefeatedForChapter(4) || this.questViewMode !== 'overworld') {
      return;
    }

    const camp = this.getQuestCampPosition();
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, camp.x - 8, camp.y + 4);
    if (distance > 44) {
      return;
    }

    this.endRun('Quest Complete', `You carried the Crown of Kings back to the cabin.\nRenown: ${this.score}\nPress ENTER to restart`);
  }

  private getLaneYs(): number[] {
    return [310, 430, 550, 670];
  }

  private getAnswerGateY(): number {
    return 228;
  }

  private getAnswerGateXs(): number[] {
    return [220, this.scale.width / 2, this.scale.width - 220];
  }

  private getQuestCampPosition(): { x: number; y: number } {
    return {
      x: QUEST_DUNGEON_BOUNDS.left + Math.round(QUEST_DUNGEON_BOUNDS.width * 0.1),
      y: QUEST_DUNGEON_BOUNDS.top + QUEST_DUNGEON_BOUNDS.height - 54,
    };
  }

  private getQuestSurfaceMarkerPosition(chapter: 1 | 2 | 3 | 4): { x: number; y: number } {
    switch (chapter) {
      case 1:
        return {
          x: QUEST_DUNGEON_BOUNDS.left + Math.round(QUEST_DUNGEON_BOUNDS.width * 0.29),
          y: QUEST_DUNGEON_BOUNDS.top + QUEST_DUNGEON_BOUNDS.height - 90,
        };
      case 2:
        return {
          x: QUEST_DUNGEON_BOUNDS.left + Math.round(QUEST_DUNGEON_BOUNDS.width * 0.49),
          y: QUEST_DUNGEON_BOUNDS.top + QUEST_DUNGEON_BOUNDS.height - 184,
        };
      case 3:
        return {
          x: QUEST_DUNGEON_BOUNDS.left + Math.round(QUEST_DUNGEON_BOUNDS.width * 0.69),
          y: QUEST_DUNGEON_BOUNDS.top + QUEST_DUNGEON_BOUNDS.height - 272,
        };
      case 4:
        return {
          x: QUEST_DUNGEON_BOUNDS.left + Math.round(QUEST_DUNGEON_BOUNDS.width * 0.84),
          y: QUEST_DUNGEON_BOUNDS.top + 92,
        };
    }
  }

  private getQuestSidebarMetrics(): { left: number; width: number; centerX: number; textX: number; textWidth: number } {
    const width = Math.min(272, Math.max(240, Math.round(QUEST_DUNGEON_BOUNDS.width * 0.23)));
    const left = QUEST_DUNGEON_BOUNDS.left + QUEST_DUNGEON_BOUNDS.width - width - 20;
    return {
      left,
      width,
      centerX: left + (width / 2),
      textX: left + 14,
      textWidth: Math.max(212, width - 28),
    };
  }

  private getQuestDungeonBoundsForChapter(chapter: 1 | 2 | 3 | 4): Phaser.Geom.Rectangle {
    const chapterSize = this.getQuestDungeonChapterSize();
    const left = QUEST_DUNGEON_WORLD_BOUNDS.left + (chapter === 1 || chapter === 3 ? 0 : chapterSize.width + QUEST_DUNGEON_WORLD_GAP.horizontal);
    const top = QUEST_DUNGEON_WORLD_BOUNDS.top + (chapter === 3 || chapter === 4 ? 0 : chapterSize.height + QUEST_DUNGEON_WORLD_GAP.vertical);

    return new Phaser.Geom.Rectangle(left, top, chapterSize.width, chapterSize.height);
  }

  private getQuestDungeonChapterSize(): { width: number; height: number } {
    return {
      width: Math.max(
        Math.round(QUEST_DUNGEON_BOUNDS.width * (this.questAdminSettings.mazeColumns / QUEST_DUNGEON_BASE_GRID.columns)),
        this.questAdminSettings.mazeColumns * QUEST_TARGET_CELL_SIZE.width,
      ),
      height: Math.max(
        Math.round(QUEST_DUNGEON_BOUNDS.height * (this.questAdminSettings.mazeRows / QUEST_DUNGEON_BASE_GRID.rows)),
        this.questAdminSettings.mazeRows * QUEST_TARGET_CELL_SIZE.height,
      ),
    };
  }

  private getQuestDungeonWorldBounds(): Phaser.Geom.Rectangle {
    const chapterSize = this.getQuestDungeonChapterSize();

    return new Phaser.Geom.Rectangle(
      QUEST_DUNGEON_WORLD_BOUNDS.left,
      QUEST_DUNGEON_WORLD_BOUNDS.top,
      (chapterSize.width * 2) + QUEST_DUNGEON_WORLD_GAP.horizontal,
      (chapterSize.height * 2) + QUEST_DUNGEON_WORLD_GAP.vertical,
    );
  }

  private getQuestPartyTextureKey(): string {
    return `quest-party-${Phaser.Math.Clamp(this.lives, 1, 3)}`;
  }

  private pinToScreen<T extends Phaser.GameObjects.GameObject & { setScrollFactor(x: number, y?: number): T }>(object: T): T {
    object.setScrollFactor(0);
    return object;
  }

  private refreshQuestPlayerPresentation(): void {
    if (this.gameMode !== 'quest' || !this.player) {
      return;
    }

    if (this.questViewMode === 'overworld') {
      this.player.setTexture(this.getQuestPartyTextureKey());
      this.player.setDepth(5.4);
      this.player.setScale(1);
    } else {
      this.player.setTexture('quest-hero');
      this.player.setDepth(5.2);
      this.player.setScale(0.78);
    }

    this.player.clearTint();
    this.player.setAlpha(1);
  }

  private refreshQuestHudMode(): void {
    if (this.gameMode !== 'quest') {
      return;
    }

    const dungeonMode = this.questViewMode === 'dungeon';
    const sidebar = this.getQuestSidebarMetrics();
    const leftPanelTextWidth = QUEST_DUNGEON_BOUNDS.width - 96;
    const dungeonPromptWidth = Math.min(520, leftPanelTextWidth - 220);
    const dungeonSupportingWidth = Math.min(420, dungeonPromptWidth - 40);
    const dungeonExplanationWidth = Math.min(560, leftPanelTextWidth - 180);

    this.categoryText.setVisible(true);
    this.promptText.setVisible(true);
    this.supportingDataText.setVisible(true);
    this.questAnswerInputPanel.setVisible(true);
    this.questAnswerInputText.setVisible(true);
    this.questAnswerHintText.setVisible(!dungeonMode);
    this.questChoiceTexts.forEach((text) => {
      text.setVisible(true);
    });
    this.progressText.setVisible(false);
    this.explanationText.setVisible(this.explanationText.text.trim().length > 0);
    this.modeText.setVisible(false);
    this.phaseText.setVisible(false);
    this.questJournalText.setVisible(false);

    if (dungeonMode) {
      this.categoryText.setPosition(68, 40).setFontSize(12);
      this.categoryText.setWordWrapWidth(dungeonPromptWidth, true);

      this.promptText.setPosition(68, 60).setFontSize(16);
      this.promptText.setWordWrapWidth(dungeonPromptWidth, true);

      this.supportingDataText.setPosition(68, 114).setFontSize(10).setLineSpacing(1);
      this.supportingDataText.setWordWrapWidth(dungeonSupportingWidth, true);
      this.supportingDataText.setAlpha(0.82);

      this.questAnswerInputPanel.setPosition(sidebar.centerX, this.scale.height - 198);
      this.questAnswerInputPanel.setSize(sidebar.width - 12, 34);
      this.questAnswerInputText.setPosition(sidebar.textX, this.scale.height - 209).setFontSize(16);
      this.questAnswerInputText.setAlpha(0.94);
      this.questAnswerInputText.setWordWrapWidth(sidebar.textWidth - 8, true);
      this.questAnswerHintText.setPosition(sidebar.textX, this.scale.height - 183).setFontSize(10);
      this.questAnswerHintText.setAlpha(0.68);
      this.questAnswerHintText.setWordWrapWidth(sidebar.textWidth, true);

      this.questChoiceTexts.forEach((text, index) => {
        text.setPosition(sidebar.left + 10, this.scale.height - 150 + index * 34).setFontSize(13);
        text.setWordWrapWidth(sidebar.width - 28, true);
        text.setAlpha(0.88);
      });

      this.explanationText.setPosition(68, this.scale.height - 148).setFontSize(12);
      this.explanationText.setWordWrapWidth(dungeonExplanationWidth, true);
      this.explanationText.setAlpha(0.9);
      return;
    }

    this.supportingDataText.setAlpha(1);
    this.questAnswerInputText.setAlpha(1);
    this.questAnswerHintText.setAlpha(1);
    this.questChoiceTexts.forEach((text) => {
      text.setAlpha(1);
    });
    this.explanationText.setAlpha(1);

    this.categoryText.setPosition(68, 50).setFontSize(15);
    this.categoryText.setWordWrapWidth(620, true);

    this.promptText.setPosition(68, 78).setFontSize(20);
    this.promptText.setWordWrapWidth(620, true);

    this.supportingDataText.setPosition(68, 136).setFontSize(13).setLineSpacing(3);
    this.supportingDataText.setWordWrapWidth(620, true);

    this.questAnswerInputPanel.setPosition(sidebar.centerX, this.scale.height - 222);
    this.questAnswerInputPanel.setSize(sidebar.width - 12, 42);
    this.questAnswerInputText.setPosition(sidebar.textX, this.scale.height - 234).setFontSize(18);
    this.questAnswerInputText.setWordWrapWidth(sidebar.textWidth - 8, true);
    this.questAnswerHintText.setPosition(sidebar.textX, this.scale.height - 206).setFontSize(12);
    this.questAnswerHintText.setWordWrapWidth(sidebar.textWidth, true);

    this.questChoiceTexts.forEach((text, index) => {
      text.setPosition(sidebar.left + 10, this.scale.height - 170 + index * 46).setFontSize(15);
      text.setWordWrapWidth(sidebar.width - 28, true);
    });

    this.explanationText.setPosition(68, this.scale.height - 148).setFontSize(13);
    this.explanationText.setWordWrapWidth(leftPanelTextWidth, true);
  }

  private isQuestDungeonMode(): boolean {
    return this.gameMode === 'quest' && this.questViewMode === 'dungeon';
  }

  private setExplanationMessage(message: string, dungeonMessage = message): void {
    this.explanationText.setText(this.isQuestDungeonMode() ? dungeonMessage : message);
  }

  private refreshQuestCameraState(): void {
    if (this.gameMode !== 'quest') {
      return;
    }

    const camera = this.cameras.main;
    if (this.questViewMode === 'dungeon') {
      const chapterBounds = this.getQuestDungeonBoundsForChapter(this.activeQuestTravelChapter);
      camera.setBounds(
        chapterBounds.x,
        chapterBounds.y,
        chapterBounds.width,
        chapterBounds.height,
      );
      this.physics.world.setBounds(
        chapterBounds.x,
        chapterBounds.y,
        chapterBounds.width,
        chapterBounds.height,
      );
      camera.setDeadzone(280, 180);
      camera.startFollow(this.player, true, 0.12, 0.12);
      return;
    }

    camera.stopFollow();
    camera.setBounds(0, 0, this.scale.width, this.scale.height);
    camera.setScroll(0, 0);
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
  }

  private getPlayerStartY(): number {
    return this.gameMode === 'quest'
      ? this.getQuestCampPosition().y
      : this.scale.height - 82;
  }

  private getQuestStartX(): number {
    return this.getQuestCampPosition().x;
  }

  private drawBackdrop(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;

    if (this.gameMode === 'quest') {
      const playfieldCenterX = QUEST_DUNGEON_BOUNDS.left + (QUEST_DUNGEON_BOUNDS.width / 2);
      this.pinToScreen(this.add.rectangle(playfieldCenterX, 118, QUEST_DUNGEON_BOUNDS.width, 168, 0x101a26, 0.8).setStrokeStyle(1, 0x8797a6, 0.18));
      this.pinToScreen(this.add.rectangle(playfieldCenterX, 476, QUEST_DUNGEON_BOUNDS.width, QUEST_DUNGEON_BOUNDS.height, 0x081018, 0.96).setStrokeStyle(2, 0x71845d, 0.24));
      this.pinToScreen(this.add.text(playfieldCenterX, 22, 'CLOUDY MOUNTAIN', {
        fontFamily: 'Trebuchet MS',
        fontSize: '15px',
        color: '#d6dfc2',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0));
      this.pinToScreen(this.add.text(playfieldCenterX, 44, 'Separate mountain regions. Follow the marked cave trail deeper toward each lair.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#c7d2bb',
        align: 'center',
        wordWrap: { width: 620 },
      }).setOrigin(0.5, 0));
      this.pinToScreen(this.add.text(playfieldCenterX, 272, 'Ladders return to camp. The brighter connected trail leads toward the chapter boss.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#d9c996',
        align: 'center',
        wordWrap: { width: 700 },
      }).setOrigin(0.5, 0));
      return;
    }

    this.add.rectangle(centerX, 144, width - 80, 248, 0x0f1b2e, 0.9).setStrokeStyle(2, 0x78cfff, 0.8);
    this.add.rectangle(centerX, this.getAnswerGateY(), width - 140, 74, 0x13243a, 0.9).setStrokeStyle(1, 0x9fd3ff, 0.45);

    for (const laneY of this.getLaneYs()) {
      this.add.rectangle(centerX, laneY, width - 80, 86, 0x11233a, 0.8).setStrokeStyle(1, 0x32577d, 0.9);
    }

    this.add.rectangle(centerX, height - 96, width - 80, 154, 0x0f1b2e, 0.9).setStrokeStyle(2, 0x78cfff, 0.6);
    this.add.rectangle(410, 108, 720, 132, 0x13243a, 0.65).setStrokeStyle(1, 0x5ea9d8, 0.25);
    this.add.rectangle(width - 220, 108, 320, 132, 0x13243a, 0.65).setStrokeStyle(1, 0x5ea9d8, 0.25);
  }

  private createQuestMaze(): void {
    if (this.gameMode !== 'quest') {
      return;
    }

    const layout = this.buildQuestDungeonLayout();
    const worldBounds = this.getQuestDungeonWorldBounds();
    this.questRooms = layout.rooms;
    this.currentQuestRoomKey = undefined;

    this.createQuestOverworldPanel();

    this.questTravelMarkers = this.physics.add.staticGroup();
    layout.travelMarkers.forEach((spawn) => {
      const isSurface = spawn.markerKind === 'surface';
      const marker = this.add.rectangle(
        spawn.x,
        spawn.y,
        spawn.width,
        spawn.height,
        0xffffff,
        0.001,
      ).setStrokeStyle(0, 0x8c6b2b, 0).setDepth(isSurface ? 2.2 : 2.05) as QuestTravelMarker;
      this.physics.add.existing(marker, true);
      marker.chapter = spawn.chapter;
      marker.markerKind = spawn.markerKind;
      marker.destinationX = spawn.destinationX;
      marker.destinationY = spawn.destinationY;
      marker.label = spawn.label;
      marker.decorations = isSurface
        ? [
          this.add.ellipse(spawn.x, spawn.y + 9, 34, 18, 0x261d16, 0.96).setDepth(2.21),
          this.add.arc(spawn.x, spawn.y + 3, 20, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false, 0x3d3023, 0.95).setDepth(2.22),
          this.add.arc(spawn.x, spawn.y + 3, 14, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false, 0x080b0d, 0.92).setDepth(2.23),
          this.add.rectangle(spawn.x, spawn.y + 12, 28, 3, 0x6d5a42, 0.8).setDepth(2.22),
        ]
        : [
          this.add.ellipse(spawn.x, spawn.y + 1, 28, 10, 0x1b1510, 0.84).setDepth(2.06),
          this.add.rectangle(spawn.x - 7, spawn.y, 3, 24, 0xe4d39a, 0.92).setDepth(2.08),
          this.add.rectangle(spawn.x + 7, spawn.y, 3, 24, 0xe4d39a, 0.92).setDepth(2.08),
          this.add.rectangle(spawn.x, spawn.y - 8, 12, 3, 0xc9ad67, 0.9).setDepth(2.09),
          this.add.rectangle(spawn.x, spawn.y - 1, 12, 3, 0xc9ad67, 0.9).setDepth(2.09),
          this.add.rectangle(spawn.x, spawn.y + 6, 12, 3, 0xc9ad67, 0.9).setDepth(2.09),
        ];
      this.questTravelMarkers?.add(marker);
    });

    this.add.rectangle(
      worldBounds.centerX,
      worldBounds.centerY,
      worldBounds.width,
      worldBounds.height,
      0x0b1219,
      0.98,
    ).setDepth(0.82);

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const chapterRooms = layout.rooms.filter((room) => room.chapter === chapter);
      chapterRooms.forEach((room, index) => {
        this.registerQuestChapterDecoration(chapter, this.add.ellipse(
          room.centerX + Phaser.Math.Between(-18, 18),
          room.centerY + Phaser.Math.Between(-14, 14),
          room.width + Phaser.Math.Between(42, 88),
          room.height + Phaser.Math.Between(28, 74),
          this.getQuestChapterTint(chapter),
          index % 3 === 0 ? 0.048 : 0.028,
        ).setDepth(0.86));
      });
    });

    this.createQuestRouteTrail(layout.routeSegments);

    layout.rooms.forEach((room) => {
      const blotchCount = Phaser.Math.Between(2, 4);
      for (let index = 0; index < blotchCount; index += 1) {
        this.registerQuestChapterDecoration(room.chapter, this.add.ellipse(
          room.centerX + Phaser.Math.Between(-Math.round(room.width * 0.28), Math.round(room.width * 0.28)),
          room.centerY + Phaser.Math.Between(-Math.round(room.height * 0.28), Math.round(room.height * 0.28)),
          Phaser.Math.Between(20, 48),
          Phaser.Math.Between(16, 38),
          index % 2 === 0 ? 0x121b24 : 0x0d151d,
          0.18,
        ).setDepth(0.92));
      }

      this.createQuestRouteGuide(room);
    });

    this.questFogZones = layout.fogZones.map((zone) => {
      const fog = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x06101a, 0.96) as QuestFogZone;
      fog.chapter = zone.chapter;
      fog.revealed = false;
      fog.exploreLevel = 0;
      fog.setDepth(3);
      return fog;
    });

    this.questWalls = this.physics.add.staticGroup();
    layout.walls.forEach((wall) => {
      const rectangle = this.createQuestWallSprite(wall);
      this.questWalls?.add(rectangle);
    });

    this.questGates = this.physics.add.staticGroup();
    layout.gateSpawns.forEach((spawn) => {
      const gate = this.createQuestGateSprite(spawn.x, spawn.y, spawn.width, spawn.height, spawn.chapter, spawn.kind);
      gate.roomKeys = [...spawn.roomKeys];
      this.questGates?.add(gate);
    });
    this.questTrials = this.physics.add.group({ allowGravity: false, immovable: true, runChildUpdate: false });
    layout.trialSpawns.forEach((spawn, index) => {
      const trial = this.physics.add.image(spawn.x, spawn.y, 'quest-trial') as QuestTrial;
      trial.trialId = `trial-${index + 1}`;
      trial.chapter = spawn.chapter;
      trial.roomKey = spawn.roomKey;
      trial.solved = false;
      trial.setAlpha(0.2);
      trial.setDepth(4);
      trial.setScale(0.88);
      trial.setImmovable(true);
      this.questTrials?.add(trial);
    });

    this.hiddenMonsters = this.physics.add.group({ allowGravity: false, immovable: false, runChildUpdate: false });
    layout.monsterSpawns.forEach((spawn, index) => {
      const monster = this.physics.add.image(spawn.x, spawn.y, this.getQuestMonsterTextureKey(spawn.hiddenName)) as HiddenMonster;
      monster.hiddenName = spawn.hiddenName;
      monster.chapter = spawn.chapter;
      monster.roomKey = spawn.roomKey;
      monster.roomRole = spawn.roomRole;
      monster.moveStyle = spawn.moveStyle;
      monster.behavior = spawn.behavior;
      monster.revealed = false;
      monster.defeated = false;
      monster.rewardScore = spawn.rewardScore;
      monster.encounterId = `monster-${index + 1}`;
      monster.accentColor = spawn.accentColor;
      monster.clueKind = spawn.clueKind;
      monster.clueSpotted = false;
      monster.roamBounds = spawn.roamBounds;
      monster.roamTurnAt = 0;
      monster.maxHp = spawn.maxHp;
      monster.hp = monster.maxHp;
      monster.contactDamage = spawn.contactDamage;
      monster.lastContactAt = 0;
      monster.driftSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
      monster.setAlpha(0.05);
      monster.setScale(0.86);
      monster.setImmovable(false);
      const monsterBody = monster.body as Phaser.Physics.Arcade.Body | null;
      if (monsterBody) {
        monsterBody.setAllowGravity(false);
      }
      monster.setDepth(4);
      monster.setTint(spawn.accentColor);
      const clueOffsetX = Phaser.Math.Between(-34, 34);
      const clueOffsetY = Phaser.Math.Between(-28, 28);
      const clueMarker = this.add.image(
        spawn.x + clueOffsetX,
        spawn.y + clueOffsetY,
        this.getQuestClueTextureKey(spawn.clueKind),
      ).setAlpha(0.02).setScale(0.78).setDepth(3.7);
      monster.clueMarker = clueMarker;
      this.hiddenMonsters?.add(monster);
    });

    this.treasureChests = this.physics.add.group({ allowGravity: false, immovable: true, runChildUpdate: false });
    layout.chestSpawns.forEach((spawn, index) => {
      const chest = this.physics.add.image(spawn.x, spawn.y, 'quest-chest') as TreasureChest;
      chest.chestId = `chest-${index + 1}`;
      chest.chapter = spawn.chapter;
      chest.opened = false;
      chest.setImmovable(true);
      chest.setDepth(4);
      chest.setScale(0.9);
      chest.setTint(this.getQuestChapterTint(spawn.chapter));
      this.treasureChests?.add(chest);
    });

    this.questBossSpawns.clear();
    layout.bossSpawns.forEach((bossSpawn) => {
      this.questBossSpawns.set(bossSpawn.chapter, bossSpawn);
      this.registerQuestChapterDecoration(bossSpawn.chapter, this.add.rectangle(
        bossSpawn.chamber.centerX,
        bossSpawn.chamber.centerY,
        bossSpawn.chamber.width - 18,
        bossSpawn.chamber.height - 18,
        0x17110e,
        0.28,
      ).setStrokeStyle(1, 0x8d6a4f, 0.14).setDepth(1.7));
      this.registerQuestChapterDecoration(bossSpawn.chapter, this.add.rectangle(bossSpawn.altarX, bossSpawn.altarY, 120, 54, 0x21160f, 0.82)
        .setStrokeStyle(1, 0x8d6a4f, 0.2)
        .setDepth(3.45));
    });

    const initialBossSpawn = this.questBossSpawns.get(1) ?? layout.bossSpawns[0];
    this.questBossAltar = this.add.rectangle(initialBossSpawn.altarX, initialBossSpawn.altarY, 92, 26, 0x433024, 0.96)
      .setStrokeStyle(1, 0xd1b36d, 0.28)
      .setDepth(3.8);
    this.questBossPillars = [0, Math.PI * (2 / 3), Math.PI * (4 / 3)].map((phaseOffset) => {
      const pillar = this.add.rectangle(initialBossSpawn.altarX, initialBossSpawn.altarY, 18, 56, 0x2b1d2b, 0.3)
        .setStrokeStyle(2, 0xfb7185, 0.18)
        .setDepth(4.15) as QuestBossPillar;
      this.physics.add.existing(pillar);
      pillar.orbitAngle = phaseOffset;
      pillar.orbitRadius = initialBossSpawn.orbitRadius;
      pillar.orbitSpeed = 0.0006;
      pillar.damage = 2;
      pillar.phaseOffset = phaseOffset;
      pillar.body.setAllowGravity(false);
      pillar.body.setImmovable(true);
      pillar.body.enable = false;
      pillar.body.setSize(18, 56);
      pillar.body.updateFromGameObject();
      return pillar;
    });
    this.questBoss = this.physics.add.image(initialBossSpawn.bossX, initialBossSpawn.bossY, 'quest-boss') as QuestBoss;
    this.questBoss.chapter = 1;
    this.questBoss.title = this.getQuestEncounter(1).foeName;
    this.questBoss.awakened = false;
    this.questBoss.defeated = false;
    this.questBoss.engaged = false;
    this.questBoss.chamber = initialBossSpawn.chamber;
    this.questBoss.setImmovable(true);
    this.questBoss.setDepth(4.6);
    this.questBoss.setAlpha(0.18);
    this.questBoss.setScale(0.76);
    this.questBoss.setTint(0x8a4861);
    this.questBossHazards = this.physics.add.group({ allowGravity: false, immovable: false, runChildUpdate: false });

    this.refreshQuestTrials();
    this.refreshQuestBoss();
    this.setQuestViewMode('overworld', 1);
  }

  private createQuestOverworldPanel(): void {
    const panel = this.add.container(0, 0).setDepth(1.1);
    const regionFieldWidth = QUEST_DUNGEON_BOUNDS.width - 56;
    const regionFieldCenterX = QUEST_DUNGEON_BOUNDS.left + (QUEST_DUNGEON_BOUNDS.width / 2);
    const backdrop = this.add.rectangle(
      QUEST_DUNGEON_BOUNDS.left + (QUEST_DUNGEON_BOUNDS.width / 2),
      QUEST_DUNGEON_BOUNDS.top + (QUEST_DUNGEON_BOUNDS.height / 2),
      QUEST_DUNGEON_BOUNDS.width,
      QUEST_DUNGEON_BOUNDS.height,
      0x5d8f49,
      0.98,
    ).setStrokeStyle(2, 0x9db58e, 0.22);
    panel.add(backdrop);

    panel.add(this.add.rectangle(
      QUEST_DUNGEON_BOUNDS.left + (QUEST_DUNGEON_BOUNDS.width / 2),
      QUEST_DUNGEON_BOUNDS.top + 54,
      QUEST_DUNGEON_BOUNDS.width,
      108,
      0x93d0e1,
      0.92,
    ));

    panel.add(this.add.rectangle(
      regionFieldCenterX,
      QUEST_DUNGEON_BOUNDS.top + 288,
      regionFieldWidth,
      QUEST_DUNGEON_BOUNDS.height - 144,
      0x6b9f57,
      0.22,
    ));

    const trail = this.add.graphics();
    const trailPoints = [
      this.getQuestCampPosition(),
      this.getQuestSurfaceMarkerPosition(1),
      this.getQuestSurfaceMarkerPosition(2),
      this.getQuestSurfaceMarkerPosition(3),
      this.getQuestSurfaceMarkerPosition(4),
    ];
    trail.lineStyle(16, 0xd7c08a, 0.92);
    trail.beginPath();
    trail.moveTo(trailPoints[0].x, trailPoints[0].y - 8);
    for (let index = 1; index < trailPoints.length; index += 1) {
      trail.lineTo(trailPoints[index].x, trailPoints[index].y + 10);
    }
    trail.strokePath();
    trail.lineStyle(4, 0x6e5638, 0.34);
    trail.beginPath();
    trail.moveTo(trailPoints[0].x, trailPoints[0].y - 8);
    for (let index = 1; index < trailPoints.length; index += 1) {
      trail.lineTo(trailPoints[index].x, trailPoints[index].y + 10);
    }
    trail.strokePath();
    panel.add(trail);

    const camp = this.getQuestCampPosition();
    panel.add(this.add.circle(camp.x - 10, camp.y - 2, 26, 0x294631, 0.86));
    panel.add(this.add.rectangle(camp.x - 10, camp.y - 6, 24, 20, 0x6b4a1f, 0.96));
    panel.add(this.add.triangle(camp.x - 10, camp.y - 18, 0, 10, 12, -2, 24, 10, 0xc9a468, 1));
    panel.add(this.add.text(camp.x - 4, camp.y + 18, 'CABIN', {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#f7f2d8',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    const title = this.add.text(QUEST_DUNGEON_BOUNDS.left + 28, QUEST_DUNGEON_BOUNDS.top + 18, 'EXPEDITION BOARD', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#173622',
      fontStyle: 'bold',
    });
    panel.add(title);

    const hint = this.add.text(QUEST_DUNGEON_BOUNDS.left + 28, QUEST_DUNGEON_BOUNDS.top + 38, 'Separate mountain regions. The trail only marks staging and progress.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#21402d',
      wordWrap: { width: QUEST_DUNGEON_BOUNDS.width - 120 },
    });
    panel.add(hint);

    panel.add(this.add.text(QUEST_DUNGEON_BOUNDS.left + 28, QUEST_DUNGEON_BOUNDS.top + 74, 'CURRENT REGION', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#21402d',
      fontStyle: 'bold',
    }));

    this.questOverworldFocusText = this.add.text(QUEST_DUNGEON_BOUNDS.left + 28, QUEST_DUNGEON_BOUNDS.top + 92, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#1f3b28',
      lineSpacing: 4,
      wordWrap: { width: QUEST_DUNGEON_BOUNDS.width - 120 },
    });
    panel.add(this.questOverworldFocusText);

    this.questOverworldZoneTexts = ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).map((chapter) => {
      const point = this.getQuestSurfaceMarkerPosition(chapter);
      const tint = this.getQuestChapterTint(chapter);
      panel.add(this.add.circle(point.x, point.y + 8, 28, 0x132538, 0.84).setStrokeStyle(2, tint, 0.86));
      panel.add(this.add.circle(point.x, point.y + 8, 14, tint, 0.96));
      panel.add(this.add.text(point.x, point.y + 8, `${chapter}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#fffdf2',
        fontStyle: 'bold',
      }).setOrigin(0.5));

      panel.add(this.add.text(point.x, point.y - 42, this.getQuestEncounter(chapter).chapterTitle.toUpperCase(), {
        fontFamily: 'Trebuchet MS',
        fontSize: '10px',
        color: '#f2f7f9',
        align: 'center',
      }).setOrigin(0.5));

      const text = this.add.text(point.x, point.y + 50, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '10px',
        color: '#173622',
        align: 'center',
        wordWrap: { width: 104 },
      });
      text.setName(`quest-overworld-zone-${chapter}`);
      text.setOrigin(0.5);
      panel.add(text);

      return text;
    });

    this.questOverworldPanel = panel;
    this.refreshQuestOverworldPanel();
  }

  private getQuestOverworldStatusText(chapter: 1 | 2 | 3 | 4): { text: string; color: string } {
    const unlocked = chapter <= this.level;
    const activeChapter = this.questViewMode === 'dungeon' ? this.activeQuestTravelChapter : this.level;
    const active = unlocked && activeChapter === chapter;

    if (!unlocked) {
      const relic = this.getQuestRelicForUnlockChapter(chapter as 2 | 3 | 4);
      return {
        text: relic ? `LOCKED\n${relic.shortLabel.toUpperCase()}` : 'LOCKED',
        color: '#415c49',
      };
    }

    if (this.isQuestBossDefeatedForChapter(chapter)) {
      return {
        text: active ? 'CLEARED\nACTIVE' : 'CLEARED',
        color: active ? '#fff4b3' : '#dceccb',
      };
    }

    return {
      text: active ? (this.questViewMode === 'dungeon' ? 'INSIDE' : 'CURRENT') : 'OPEN',
      color: active ? '#fff4b3' : '#173622',
    };
  }

  private getQuestOverworldFocusSummary(): string {
    if (this.isQuestBossDefeatedForChapter(4) && this.questViewMode === 'overworld') {
      return 'Return to the cabin with the Crown of Kings.\nThe board tracks regions; it is not one shared mountain maze.';
    }

    const focusChapter = this.questViewMode === 'dungeon' ? this.activeQuestTravelChapter : this.level;
    const encounter = this.getQuestEncounter(focusChapter);
    const objective = this.getQuestObjectiveText();
    const regionLine = this.questViewMode === 'dungeon'
      ? `Inside region ${focusChapter}.`
      : `Trailhead ${focusChapter} is your current destination.`;
    const stateLine = this.isQuestBossDefeatedForChapter(focusChapter)
      ? 'Region cleared. Re-enter only if you still want treasure or missed trials.'
      : `Boss: ${encounter.foeName}.`;

    return `${encounter.chapterTitle}\n${regionLine}\n${stateLine}\nObjective: ${objective}`;
  }

  private buildQuestAxisStops(start: number, size: number, segments: number, minWeight: number, maxWeight: number): number[] {
    const weights = Array.from({ length: segments }, () => Phaser.Math.FloatBetween(minWeight, maxWeight));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const stops = [start];
    let cursor = start;

    weights.forEach((weight, index) => {
      const isLast = index === segments - 1;
      cursor += isLast ? (start + size) - cursor : (size * weight) / totalWeight;
      stops.push(cursor);
    });

    return stops;
  }

  private buildQuestDungeonLayout(): QuestDungeonLayout {
    const questSettings = this.questAdminSettings;
    // Dynamically expand grid to fill available space, but never shrink cells below minimum size
    const worldWidth = QUEST_DUNGEON_WORLD_BOUNDS.width;
    const worldHeight = QUEST_DUNGEON_WORLD_BOUNDS.height;
    const minCellWidth = QUEST_TARGET_CELL_SIZE.width;
    const minCellHeight = QUEST_TARGET_CELL_SIZE.height;
    // Maximum columns/rows that still allow minimum cell size
    const maxColumnsByWidth = Math.floor(worldWidth / minCellWidth);
    const maxRowsByHeight = Math.floor(worldHeight / minCellHeight);
    // Use admin settings as minimums, but do not exceed max allowed by min cell size
    let dungeonColumns = Math.max(questSettings.mazeColumns, Math.min(maxColumnsByWidth, 12));
    let dungeonRows = Math.max(questSettings.mazeRows, Math.min(maxRowsByHeight, 16));
    const chestCount = Math.max(questSettings.chestCount, 1); // At least 1 chest per chapter
    const rooms: QuestDungeonRoom[] = [];
    const walls: QuestWallSpec[] = [];
    const routeSegments: Array<{ chapter: 1 | 2 | 3 | 4; fromX: number; fromY: number; toX: number; toY: number; emphasis: 'main-route' | 'boss-approach' }> = [];
    const gateSpawns: Array<{ x: number; y: number; chapter: 1 | 2 | 3 | 4; width: number; height: number; kind: 'intra' | 'frontier'; roomKeys: string[] }> = [];
    const travelMarkers: Array<{ x: number; y: number; width: number; height: number; label: string; chapter: 1 | 2 | 3 | 4; markerKind: 'surface' | 'return'; destinationX: number; destinationY: number }> = [];
    const getRoomKey = (chapter: 1 | 2 | 3 | 4, row: number, column: number): string => `room-${chapter}-${row}-${column}`;
    const getChapterRooms = (chapter: 1 | 2 | 3 | 4): QuestDungeonRoom[] => rooms.filter((room) => room.chapter === chapter);
    const getEdgeKey = (leftRoomKey: string, rightRoomKey: string): string => [leftRoomKey, rightRoomKey].sort().join('|');
    const chapterBoundsByChapter = new Map<1 | 2 | 3 | 4, Phaser.Geom.Rectangle>();
    const chapterColumnStopsByChapter = new Map<1 | 2 | 3 | 4, number[]>();
    const chapterRowStopsByChapter = new Map<1 | 2 | 3 | 4, number[]>();
    const compareRoomDistance = (left: QuestDungeonRoom, right: QuestDungeonRoom, origin?: QuestDungeonRoom): number => {
      if (!origin) {
        return 0;
      }

      const leftDegree = (chapterAdjacencyByRoomKey.get(left.key) ?? []).length;
      const rightDegree = (chapterAdjacencyByRoomKey.get(right.key) ?? []).length;
      if (leftDegree !== rightDegree) {
        return leftDegree - rightDegree;
      }

      const leftDistance = pathDistanceByRoomKey.get(left.key) ?? -1;
      const rightDistance = pathDistanceByRoomKey.get(right.key) ?? -1;
      if (leftDistance !== rightDistance) {
        return rightDistance - leftDistance;
      }

      const leftWorldDistance = Phaser.Math.Distance.Between(left.centerX, left.centerY, origin.centerX, origin.centerY);
      const rightWorldDistance = Phaser.Math.Distance.Between(right.centerX, right.centerY, origin.centerX, origin.centerY);
      if (leftWorldDistance !== rightWorldDistance) {
        return rightWorldDistance - leftWorldDistance;
      }

      return left.row - right.row;
    };
    const compareBossRoomDistance = (left: QuestDungeonRoom, right: QuestDungeonRoom, origin?: QuestDungeonRoom): number => {
      if (!origin) {
        return 0;
      }

      const leftDistance = pathDistanceByRoomKey.get(left.key) ?? -1;
      const rightDistance = pathDistanceByRoomKey.get(right.key) ?? -1;
      if (leftDistance !== rightDistance) {
        return rightDistance - leftDistance;
      }

      if (left.row !== right.row) {
        return left.row - right.row;
      }

      const leftDegree = (chapterAdjacencyByRoomKey.get(left.key) ?? []).length;
      const rightDegree = (chapterAdjacencyByRoomKey.get(right.key) ?? []).length;
      if (leftDegree !== rightDegree) {
        return leftDegree - rightDegree;
      }

      const leftWorldDistance = Phaser.Math.Distance.Between(left.centerX, left.centerY, origin.centerX, origin.centerY);
      const rightWorldDistance = Phaser.Math.Distance.Between(right.centerX, right.centerY, origin.centerX, origin.centerY);
      if (leftWorldDistance !== rightWorldDistance) {
        return rightWorldDistance - leftWorldDistance;
      }

      return left.column - right.column;
    };
    const usedRoomKeys = new Set<string>();
    const chapterEntryRoomByChapter = new Map<1 | 2 | 3 | 4, QuestDungeonRoom>();
    const isPerimeterRoom = (room: QuestDungeonRoom): boolean => room.row === 0
      || room.row === dungeonRows - 1
      || room.column === 0
      || room.column === dungeonColumns - 1;
    const countUnvisitedNeighbors = (
      roomKey: string,
      adjacencyByRoomKey: Map<string, string[]>,
      visitedRoomKeys: Set<string>,
    ): number => (adjacencyByRoomKey.get(roomKey) ?? []).filter((neighborKey) => !visitedRoomKeys.has(neighborKey)).length;
    const getNeighborPriority = (
      archetype: QuestChapterArchetype,
      currentRoom: QuestDungeonRoom,
      candidateRoom: QuestDungeonRoom,
      adjacencyByRoomKey: Map<string, string[]>,
      visitedRoomKeys: Set<string>,
    ): number => {
      const outwardOptions = countUnvisitedNeighbors(candidateRoom.key, adjacencyByRoomKey, visitedRoomKeys);
      const towardNorth = candidateRoom.row < currentRoom.row ? 3 : candidateRoom.column === currentRoom.column ? 2 : 1;
      const perimeterBias = isPerimeterRoom(candidateRoom) ? 2 : 0;
      const centerDistance = Math.abs(candidateRoom.row - Math.floor(dungeonRows / 2)) + Math.abs(candidateRoom.column - Math.floor(dungeonColumns / 2));

      switch (archetype) {
        case 'branch-heavy':
          return outwardOptions * 5 + perimeterBias * 2 - towardNorth;
        case 'loop-heavy':
          return outwardOptions * 3 - centerDistance;
        case 'choke-heavy':
          return towardNorth * 5 - outwardOptions * 2;
        case 'ring':
          return perimeterBias * 6 + (candidateRoom.row === currentRoom.row || candidateRoom.column === currentRoom.column ? 2 : 0) - centerDistance;
      }
    };
    const addChapterArchetypeBonusOpenings = (
      chapter: 1 | 2 | 3 | 4,
      chapterRooms: QuestDungeonRoom[],
      chapterEdgeKeys: Set<string>,
      archetype: QuestChapterArchetype,
    ): void => {
      const closedEdgeCandidates = [...chapterEdgeKeys].filter((edgeKey) => !openDoorEdgeKeys.has(edgeKey));
      if (archetype === 'loop-heavy') {
        Phaser.Utils.Array.Shuffle(closedEdgeCandidates)
          .slice(0, Math.max(2, Math.min(5, Math.round(chapterRooms.length * 0.08))))
          .forEach((edgeKey) => {
            openDoorEdgeKeys.add(edgeKey);
          });
        return;
      }

      if (archetype !== 'ring') {
        return;
      }

      for (let column = 0; column < dungeonColumns - 1; column += 1) {
        openDoorEdgeKeys.add(getEdgeKey(getRoomKey(chapter, 0, column), getRoomKey(chapter, 0, column + 1)));
        openDoorEdgeKeys.add(getEdgeKey(getRoomKey(chapter, dungeonRows - 1, column), getRoomKey(chapter, dungeonRows - 1, column + 1)));
      }

      for (let row = 0; row < dungeonRows - 1; row += 1) {
        openDoorEdgeKeys.add(getEdgeKey(getRoomKey(chapter, row, 0), getRoomKey(chapter, row + 1, 0)));
        openDoorEdgeKeys.add(getEdgeKey(getRoomKey(chapter, row, dungeonColumns - 1), getRoomKey(chapter, row + 1, dungeonColumns - 1)));
      }

      const centerColumn = Math.floor(dungeonColumns / 2);
      const centerRow = Math.floor(dungeonRows / 2);
      for (let row = 0; row < dungeonRows - 1; row += 1) {
        openDoorEdgeKeys.add(getEdgeKey(getRoomKey(chapter, row, centerColumn), getRoomKey(chapter, row + 1, centerColumn)));
      }
      for (let column = 0; column < dungeonColumns - 1; column += 1) {
        openDoorEdgeKeys.add(getEdgeKey(getRoomKey(chapter, centerRow, column), getRoomKey(chapter, centerRow, column + 1)));
      }
    };
    const getPathBetweenRooms = (startRoomKey: string, targetRoomKey: string): string[] => {
      if (startRoomKey === targetRoomKey) {
        return [startRoomKey];
      }

      const parentsByRoomKey = new Map<string, string | undefined>([[startRoomKey, undefined]]);
      const queue = [startRoomKey];

      while (queue.length > 0) {
        const currentRoomKey = queue.shift();
        if (!currentRoomKey) {
          continue;
        }

        if (currentRoomKey === targetRoomKey) {
          break;
        }

        (chapterAdjacencyByRoomKey.get(currentRoomKey) ?? []).forEach((neighborKey) => {
          if (parentsByRoomKey.has(neighborKey)) {
            return;
          }

          parentsByRoomKey.set(neighborKey, currentRoomKey);
          queue.push(neighborKey);
        });
      }

      if (!parentsByRoomKey.has(targetRoomKey)) {
        return [startRoomKey];
      }

      const path: string[] = [];
      let currentRoomKey: string | undefined = targetRoomKey;
      while (currentRoomKey) {
        path.unshift(currentRoomKey);
        currentRoomKey = parentsByRoomKey.get(currentRoomKey);
      }

      return path;
    };
    const assignRoomRoles = (chapter: 1 | 2 | 3 | 4, bossPath: string[]): void => {
      const entryRoom = chapterEntryRoomByChapter.get(chapter);
      if (!entryRoom) {
        return;
      }

      const mainRouteKeys = new Set(bossPath.slice(1, Math.max(1, bossPath.length - 2)));
      const bossApproachKeys = new Set(bossPath.slice(Math.max(1, bossPath.length - 3)));

      getChapterRooms(chapter).forEach((room) => {
        const degree = (chapterAdjacencyByRoomKey.get(room.key) ?? []).length;
        if (room.key === entryRoom.key) {
          room.role = 'entry';
          return;
        }

        if (bossApproachKeys.has(room.key)) {
          room.role = 'boss-approach';
          return;
        }

        if (mainRouteKeys.has(room.key)) {
          room.role = 'main-route';
          return;
        }

        if (degree <= 1) {
          room.role = 'dead-end';
          return;
        }

        if (degree >= 3) {
          room.role = 'junction';
          return;
        }

        room.role = 'branch';
      });
    };

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const bounds = this.getQuestDungeonBoundsForChapter(chapter);
      const columnStops = this.buildQuestAxisStops(bounds.left, bounds.width, dungeonColumns, 0.9, 1.1);
      const rowStops = this.buildQuestAxisStops(bounds.top, bounds.height, dungeonRows, 0.92, 1.08);
      chapterBoundsByChapter.set(chapter, bounds);
      chapterColumnStopsByChapter.set(chapter, columnStops);
      chapterRowStopsByChapter.set(chapter, rowStops);

      for (let row = 0; row < dungeonRows; row += 1) {
        for (let column = 0; column < dungeonColumns; column += 1) {
          const cellLeft = columnStops[column];
          const cellTop = rowStops[row];
          const cellWidth = columnStops[column + 1] - cellLeft;
          const cellHeight = rowStops[row + 1] - cellTop;
          // Prioritize room size: subtract only wall thickness and a small buffer for gates
          const wallBuffer = QUEST_WALL_THICKNESS + 6; // 6px for gate/gap
          const maxRoomWidth = Math.max(72, Math.round(cellWidth - wallBuffer));
          const maxRoomHeight = Math.max(34, Math.round(cellHeight - wallBuffer));
          const minRoomWidth = Math.min(maxRoomWidth, Math.max(QUEST_MIN_ROOM_SIZE.width, Math.round(cellWidth * 0.62)));
          const minRoomHeight = Math.min(maxRoomHeight, Math.max(QUEST_MIN_ROOM_SIZE.height, Math.round(cellHeight * 0.56)));
          // Make room as large as possible in the cell
          const roomWidth = maxRoomWidth;
          const roomHeight = maxRoomHeight;
          // Center the room in the cell
          const roomBounds = new Phaser.Geom.Rectangle(
            cellLeft + Math.round((cellWidth - roomWidth) / 2),
            cellTop + Math.round((cellHeight - roomHeight) / 2),
            roomWidth,
            roomHeight,
          );

          rooms.push({
            key: getRoomKey(chapter, row, column),
            column,
            row,
            chapter,
            centerX: roomBounds.centerX,
            centerY: roomBounds.centerY,
            width: roomBounds.width,
            height: roomBounds.height,
            bounds: roomBounds,
            role: 'branch',
          });
        }
      }
    });

    const roomByKey = new Map(rooms.map((room) => [room.key, room]));
    const bossPathByChapter = new Map<1 | 2 | 3 | 4, string[]>();
    const openDoorEdgeKeys = new Set<string>();
    const intraChapterEdgeKeys = new Map<1 | 2 | 3 | 4, string[]>();
    const chapterAdjacencyByRoomKey = new Map<string, string[]>();
    const pathDistanceByRoomKey = new Map<string, number>();
    const rebuildChapterAdjacency = (): void => {
      chapterAdjacencyByRoomKey.clear();
      rooms.forEach((room) => {
        const openNeighbors = [
          getRoomKey(room.chapter, room.row, room.column - 1),
          getRoomKey(room.chapter, room.row, room.column + 1),
          getRoomKey(room.chapter, room.row - 1, room.column),
          getRoomKey(room.chapter, room.row + 1, room.column),
        ].filter((neighborKey) => {
          const neighbor = roomByKey.get(neighborKey);
          return !!neighbor
            && neighbor.chapter === room.chapter
            && openDoorEdgeKeys.has(getEdgeKey(room.key, neighborKey));
        });
        chapterAdjacencyByRoomKey.set(room.key, openNeighbors);
      });
    };

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const chapterRooms = getChapterRooms(chapter);
      const chapterRoomKeys = new Set(chapterRooms.map((room) => room.key));
      const adjacencyByRoomKey = new Map<string, string[]>();
      const chapterEdgeKeys = new Set<string>();
      const topology = QUEST_CHAPTER_TOPOLOGY[chapter];
      const archetype = this.getQuestChapterArchetype(chapter);
      const extraDoorChance = Phaser.Math.Clamp(topology.extraDoorChance * questSettings.extraDoorChanceMultiplier, 0, 1);

      chapterRooms.forEach((room) => {
        const neighborKeys = [
          getRoomKey(chapter, room.row, room.column - 1),
          getRoomKey(chapter, room.row, room.column + 1),
          getRoomKey(chapter, room.row - 1, room.column),
          getRoomKey(chapter, room.row + 1, room.column),
        ].filter((neighborKey) => chapterRoomKeys.has(neighborKey));

        adjacencyByRoomKey.set(room.key, Phaser.Utils.Array.Shuffle([...neighborKeys]));
        neighborKeys.forEach((neighborKey) => {
          chapterEdgeKeys.add(getEdgeKey(room.key, neighborKey));
        });
      });

      intraChapterEdgeKeys.set(chapter, [...chapterEdgeKeys]);

      const rowTarget = topology.startRowBias === 'deepest'
        ? Math.max(...chapterRooms.map((room) => room.row))
        : topology.startRowBias === 'shallowest'
          ? Math.min(...chapterRooms.map((room) => room.row))
          : undefined;
      const startRoomCandidates = rowTarget === undefined
        ? [...chapterRooms]
        : chapterRooms.filter((room) => room.row === rowTarget);
      const startRoom = Phaser.Utils.Array.GetRandom(startRoomCandidates.length > 0 ? startRoomCandidates : chapterRooms);
      if (!startRoom) {
        return;
      }
      chapterEntryRoomByChapter.set(chapter, startRoom);

      const visitedRoomKeys = new Set<string>([startRoom.key]);
      const stack = [startRoom.key];

      while (stack.length > 0) {
        const currentRoomKey = stack[stack.length - 1];
        const currentRoom = roomByKey.get(currentRoomKey);
        const neighbors = [...(adjacencyByRoomKey.get(currentRoomKey) ?? [])]
          .filter((neighborKey) => !visitedRoomKeys.has(neighborKey));

        const orderedNeighbors = currentRoom
          ? Phaser.Utils.Array.Shuffle(neighbors).sort((leftKey, rightKey) => {
            const leftRoom = roomByKey.get(leftKey);
            const rightRoom = roomByKey.get(rightKey);
            if (!leftRoom || !rightRoom) {
              return 0;
            }

            if (topology.corridorBias) {
              const leftDirectionScore = leftRoom.row < currentRoom.row ? 3 : leftRoom.column === currentRoom.column ? 2 : 1;
              const rightDirectionScore = rightRoom.row < currentRoom.row ? 3 : rightRoom.column === currentRoom.column ? 2 : 1;
              if (leftDirectionScore !== rightDirectionScore) {
                return rightDirectionScore - leftDirectionScore;
              }
            }

            const leftPriority = getNeighborPriority(archetype, currentRoom, leftRoom, adjacencyByRoomKey, visitedRoomKeys);
            const rightPriority = getNeighborPriority(archetype, currentRoom, rightRoom, adjacencyByRoomKey, visitedRoomKeys);
            if (leftPriority !== rightPriority) {
              return rightPriority - leftPriority;
            }

            return 0;
          })
          : Phaser.Utils.Array.Shuffle(neighbors);

        const nextRoomKey = orderedNeighbors[0];
        if (!nextRoomKey) {
          stack.pop();
          continue;
        }

        openDoorEdgeKeys.add(getEdgeKey(currentRoomKey, nextRoomKey));
        visitedRoomKeys.add(nextRoomKey);
        stack.push(nextRoomKey);
      }

      (intraChapterEdgeKeys.get(chapter) ?? []).forEach((edgeKey) => {
        if (openDoorEdgeKeys.has(edgeKey)) {
          return;
        }

        if (Phaser.Math.FloatBetween(0, 1) <= extraDoorChance) {
          openDoorEdgeKeys.add(edgeKey);
        }
      });

      addChapterArchetypeBonusOpenings(chapter, chapterRooms, chapterEdgeKeys, archetype);
    });

    rebuildChapterAdjacency();

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const bounds = chapterBoundsByChapter.get(chapter);
      const columnStops = chapterColumnStopsByChapter.get(chapter);
      const rowStops = chapterRowStopsByChapter.get(chapter);
      if (!bounds || !columnStops || !rowStops) {
        return;
      }

      walls.push(
        {
          chapter,
          x: bounds.centerX,
          y: bounds.top - QUEST_WALL_THICKNESS / 2,
          width: bounds.width + QUEST_WALL_THICKNESS,
          height: QUEST_WALL_THICKNESS,
        },
        {
          chapter,
          x: bounds.left - QUEST_WALL_THICKNESS / 2,
          y: bounds.centerY,
          width: QUEST_WALL_THICKNESS,
          height: bounds.height + QUEST_WALL_THICKNESS,
        },
        {
          chapter,
          x: bounds.right + QUEST_WALL_THICKNESS / 2,
          y: bounds.centerY,
          width: QUEST_WALL_THICKNESS,
          height: bounds.height + QUEST_WALL_THICKNESS,
        },
        {
          chapter,
          x: bounds.centerX,
          y: bounds.bottom + QUEST_WALL_THICKNESS / 2,
          width: bounds.width + QUEST_WALL_THICKNESS,
          height: QUEST_WALL_THICKNESS,
        },
      );

      for (let divider = 1; divider < dungeonColumns; divider += 1) {
        const dividerX = columnStops[divider];
        for (let row = 0; row < dungeonRows; row += 1) {
          const leftRoomKey = getRoomKey(chapter, row, divider - 1);
          const rightRoomKey = getRoomKey(chapter, row, divider);
          const edgeKey = getEdgeKey(leftRoomKey, rightRoomKey);
          const segmentTop = rowStops[row];
          const segmentHeight = rowStops[row + 1] - segmentTop;
          // Gate height proportional to adjacent room height
          const leftRoom = rooms.find(r => r.key === leftRoomKey);
          const rightRoom = rooms.find(r => r.key === rightRoomKey);
          const avgRoomHeight = (leftRoom && rightRoom) ? (leftRoom.height + rightRoom.height) / 2 : segmentHeight - QUEST_WALL_THICKNESS;
          const gateHeight = Math.max(28, Math.round(avgRoomHeight * 0.7));

          if (!openDoorEdgeKeys.has(edgeKey)) {
            walls.push({
              chapter,
              x: dividerX,
              y: segmentTop + segmentHeight / 2,
              width: QUEST_WALL_THICKNESS,
              height: segmentHeight,
            });
            continue;
          }

          const gapCenter = segmentTop + segmentHeight / 2;
          const topHeight = gapCenter - gateHeight / 2 - segmentTop;
          const bottomY = gapCenter + gateHeight / 2;
          const bottomHeight = rowStops[row + 1] - bottomY;

          if (topHeight > QUEST_WALL_THICKNESS) {
            walls.push({
              chapter,
              x: dividerX,
              y: segmentTop + topHeight / 2,
              width: QUEST_WALL_THICKNESS,
              height: topHeight,
            });
          }

          if (bottomHeight > QUEST_WALL_THICKNESS) {
            walls.push({
              chapter,
              x: dividerX,
              y: bottomY + bottomHeight / 2,
              width: QUEST_WALL_THICKNESS,
              height: bottomHeight,
            });
          }

          gateSpawns.push({
            x: dividerX,
            y: gapCenter,
            chapter,
            width: QUEST_WALL_THICKNESS + 6,
            height: gateHeight,
            kind: 'intra',
            roomKeys: [leftRoomKey, rightRoomKey],
          });
        }
      }

      for (let divider = 1; divider < dungeonRows; divider += 1) {
        const dividerY = rowStops[divider];
        for (let column = 0; column < dungeonColumns; column += 1) {
          const upperRoomKey = getRoomKey(chapter, divider - 1, column);
          const lowerRoomKey = getRoomKey(chapter, divider, column);
          const edgeKey = getEdgeKey(upperRoomKey, lowerRoomKey);
          const segmentLeft = columnStops[column];
          const segmentWidth = columnStops[column + 1] - segmentLeft;
          // Gate width proportional to adjacent room width
          const upperRoom = rooms.find(r => r.key === upperRoomKey);
          const lowerRoom = rooms.find(r => r.key === lowerRoomKey);
          const avgRoomWidth = (upperRoom && lowerRoom) ? (upperRoom.width + lowerRoom.width) / 2 : segmentWidth - QUEST_WALL_THICKNESS;
          const gateWidth = Math.max(30, Math.round(avgRoomWidth * 0.7));

          if (!openDoorEdgeKeys.has(edgeKey)) {
            walls.push({
              chapter,
              x: segmentLeft + segmentWidth / 2,
              y: dividerY,
              width: segmentWidth,
              height: QUEST_WALL_THICKNESS,
            });
            continue;
          }

          const gapCenter = segmentLeft + segmentWidth / 2;
          const leftWidth = gapCenter - gateWidth / 2 - segmentLeft;
          const rightX = gapCenter + gateWidth / 2;
          const rightWidth = columnStops[column + 1] - rightX;

          if (leftWidth > QUEST_WALL_THICKNESS) {
            walls.push({
              chapter,
              x: segmentLeft + leftWidth / 2,
              y: dividerY,
              width: leftWidth,
              height: QUEST_WALL_THICKNESS,
            });
          }

          if (rightWidth > QUEST_WALL_THICKNESS) {
            walls.push({
              chapter,
              x: rightX + rightWidth / 2,
              y: dividerY,
              width: rightWidth,
              height: QUEST_WALL_THICKNESS,
            });
          }

          gateSpawns.push({
            x: gapCenter,
            y: dividerY,
            chapter,
            width: gateWidth,
            height: QUEST_WALL_THICKNESS + 6,
            kind: 'intra',
            roomKeys: [upperRoomKey, lowerRoomKey],
          });
        }
      }
    });

    const fogZones = rooms.map((room) => ({
      chapter: room.chapter,
      x: room.centerX,
      y: room.centerY,
      width: room.width + 64,
      height: room.height + 56,
    }));

    const chapterEntryRooms = ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).map((chapter) => {
      const room = chapterEntryRoomByChapter.get(chapter) ?? getChapterRooms(chapter)[0] ?? rooms[0];
      usedRoomKeys.add(room.key);
      return { chapter, room };
    });
    const chapterReachableRoomsByChapter = new Map<1 | 2 | 3 | 4, QuestDungeonRoom[]>();
    const chapterDeadEndRoomsByChapter = new Map<1 | 2 | 3 | 4, QuestDungeonRoom[]>();

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const entryRoom = chapterEntryRoomByChapter.get(chapter);
      if (!entryRoom) {
        chapterReachableRoomsByChapter.set(chapter, []);
        chapterDeadEndRoomsByChapter.set(chapter, []);
        return;
      }

      const reachableRooms: QuestDungeonRoom[] = [];
      const visitedRoomKeys = new Set<string>([entryRoom.key]);
      const queue = [entryRoom.key];
      pathDistanceByRoomKey.set(entryRoom.key, 0);

      while (queue.length > 0) {
        const currentRoomKey = queue.shift();
        if (!currentRoomKey) {
          continue;
        }

        const currentRoom = roomByKey.get(currentRoomKey);
        if (currentRoom) {
          reachableRooms.push(currentRoom);
        }

        const nextDistance = (pathDistanceByRoomKey.get(currentRoomKey) ?? 0) + 1;
        (chapterAdjacencyByRoomKey.get(currentRoomKey) ?? []).forEach((neighborKey) => {
          if (visitedRoomKeys.has(neighborKey)) {
            return;
          }

          visitedRoomKeys.add(neighborKey);
          pathDistanceByRoomKey.set(neighborKey, nextDistance);
          queue.push(neighborKey);
        });
      }

      const deadEndRooms = reachableRooms
        .filter((room) => room.key !== entryRoom.key && (chapterAdjacencyByRoomKey.get(room.key) ?? []).length <= 1)
        .sort((left, right) => compareRoomDistance(left, right, entryRoom));
      chapterReachableRoomsByChapter.set(chapter, reachableRooms);
      chapterDeadEndRoomsByChapter.set(chapter, deadEndRooms);
    });

    const getBossRoomPlacement = (
      bossRoom: QuestDungeonRoom,
      approachRoom?: QuestDungeonRoom,
    ): { bossX: number; bossY: number; altarX: number; altarY: number; orbitRadius: number } => {
      const horizontalInset = Math.min(Math.max(52, Math.round(bossRoom.width * 0.24)), Math.max(40, Math.round(bossRoom.width / 2) - 26));
      const verticalInset = Math.min(Math.max(42, Math.round(bossRoom.height * 0.24)), Math.max(34, Math.round(bossRoom.height / 2) - 24));
      const edgePaddingX = Math.max(34, Math.round(bossRoom.width * 0.18));
      const edgePaddingY = Math.max(30, Math.round(bossRoom.height * 0.18));

      let altarX = bossRoom.centerX;
      let altarY = bossRoom.centerY + Math.min(20, Math.max(10, Math.round(bossRoom.height * 0.08)));

      if (approachRoom) {
        const deltaX = bossRoom.centerX - approachRoom.centerX;
        const deltaY = bossRoom.centerY - approachRoom.centerY;
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          altarX = deltaX >= 0
            ? bossRoom.bounds.right - horizontalInset
            : bossRoom.bounds.left + horizontalInset;
        } else {
          altarY = deltaY >= 0
            ? bossRoom.bounds.bottom - verticalInset
            : bossRoom.bounds.top + verticalInset + 10;
        }
      }

      altarX = Phaser.Math.Clamp(altarX, bossRoom.bounds.left + edgePaddingX, bossRoom.bounds.right - edgePaddingX);
      altarY = Phaser.Math.Clamp(altarY, bossRoom.bounds.top + edgePaddingY, bossRoom.bounds.bottom - edgePaddingY);

      const bossX = altarX;
      const bossY = Phaser.Math.Clamp(
        altarY - Math.min(34, Math.max(24, Math.round(bossRoom.height * 0.22))),
        bossRoom.bounds.top + 26,
        bossRoom.bounds.bottom - 38,
      );
      const orbitRadius = Phaser.Math.Clamp(
        Math.round(Math.min(
          altarX - bossRoom.bounds.left,
          bossRoom.bounds.right - altarX,
          altarY - bossRoom.bounds.top,
          bossRoom.bounds.bottom - altarY,
        ) - 16),
        20,
        34,
      );

      return {
        bossX,
        bossY,
        altarX,
        altarY,
        orbitRadius,
      };
    };

    const bossSpawns = ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).map((chapter) => {
      const chapterRooms = getChapterRooms(chapter);
      const entryRoom = chapterEntryRoomByChapter.get(chapter);
      const reachableRooms = [...(chapterReachableRoomsByChapter.get(chapter) ?? chapterRooms)]
        .filter((room) => !usedRoomKeys.has(room.key));
      const reachableDeadEnds = [...(chapterDeadEndRoomsByChapter.get(chapter) ?? [])]
        .filter((room) => !usedRoomKeys.has(room.key));
      const northernDeadEnds = entryRoom
        ? reachableDeadEnds.filter((room) => room.row < entryRoom.row)
        : reachableDeadEnds;
      const northernReachableRooms = entryRoom
        ? reachableRooms.filter((room) => room.row < entryRoom.row)
        : reachableRooms;
      const spaciousBossCandidates = (
        northernDeadEnds.length > 0
          ? northernDeadEnds
          : northernReachableRooms.length > 0
            ? northernReachableRooms
            : reachableDeadEnds.length > 0
              ? reachableDeadEnds
              : reachableRooms
      ).filter((room) => room.width >= 164 && room.height >= 118);
      const sortedBossCandidates = (
        spaciousBossCandidates.length > 0
          ? spaciousBossCandidates
          : northernDeadEnds.length > 0
            ? northernDeadEnds
            : northernReachableRooms.length > 0
              ? northernReachableRooms
              : reachableDeadEnds.length > 0
                ? reachableDeadEnds
                : reachableRooms
      ).sort((left, right) => compareBossRoomDistance(left, right, entryRoom));
      const bossRoom = sortedBossCandidates[0]
        ?? Phaser.Utils.Array.GetRandom(reachableRooms)
        ?? chapterRooms[0]
        ?? rooms[Math.floor(rooms.length / 2)];
      usedRoomKeys.add(bossRoom.key);
      const bossPath = entryRoom
        ? getPathBetweenRooms(entryRoom.key, bossRoom.key)
        : [bossRoom.key];
      bossPathByChapter.set(chapter, bossPath);
      assignRoomRoles(chapter, bossPath);
      const approachRoomKey = bossPath.length > 1 ? bossPath[bossPath.length - 2] : undefined;
      const approachRoom = approachRoomKey ? roomByKey.get(approachRoomKey) : undefined;
      const placement = getBossRoomPlacement(bossRoom, approachRoom);

      return {
        chapter,
        x: bossRoom.centerX,
        y: bossRoom.centerY,
        bossX: placement.bossX,
        bossY: placement.bossY,
        altarX: placement.altarX,
        altarY: placement.altarY,
        orbitRadius: placement.orbitRadius,
        chamber: bossRoom.bounds,
      } satisfies QuestBossSpawn;
    });

    bossPathByChapter.forEach((bossPath, chapter) => {
      const pathRooms = bossPath
        .map((roomKey) => roomByKey.get(roomKey))
        .filter((room): room is QuestDungeonRoom => !!room);

      for (let index = 0; index < pathRooms.length - 1; index += 1) {
        const room = pathRooms[index];
        const nextRoom = pathRooms[index + 1];
        const emphasis = index >= Math.max(0, pathRooms.length - 3) ? 'boss-approach' : 'main-route';
        routeSegments.push({
          chapter,
          fromX: room.centerX,
          fromY: room.centerY + Math.round(room.height * 0.14),
          toX: nextRoom.centerX,
          toY: nextRoom.centerY + Math.round(nextRoom.height * 0.14),
          emphasis,
        });
      }
    });

    const trialSpawns: Array<{ x: number; y: number; chapter: 1 | 2 | 3 | 4; roomKey: string }> = [];
    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const chapterRooms = Phaser.Utils.Array.Shuffle(getChapterRooms(chapter).filter((room) => !usedRoomKeys.has(room.key)));
      const desiredTrialCount = Phaser.Math.Between(questSettings.trialsPerChapterMin, questSettings.trialsPerChapterMax);
      chapterRooms.slice(0, desiredTrialCount).forEach((room) => {
        usedRoomKeys.add(room.key);
        trialSpawns.push({
          x: room.centerX + Phaser.Math.Between(-18, 18),
          y: room.centerY - Math.min(18, Math.round(room.height * 0.12)) + Phaser.Math.Between(-8, 8),
          chapter,
          roomKey: room.key,
        });
      });
    });

    const chestSpawns = ([1, 2, 3] as Array<1 | 2 | 3>).map((chapter) => {
      // Guarantee at least one chest per chapter (now for all 4 chapters)
      const entryRoom = chapterEntryRoomByChapter.get(chapter);
      const bossPathKeys = new Set(bossPathByChapter.get(chapter) ?? []);
      const candidateRooms = [...(chapterDeadEndRoomsByChapter.get(chapter) ?? [])]
        .filter((room) => !usedRoomKeys.has(room.key));
      const routeBranchCandidates = candidateRooms
        .filter((room) => (chapterAdjacencyByRoomKey.get(room.key) ?? []).some((neighborKey) => bossPathKeys.has(neighborKey)));
      const fallbackRooms = [...(chapterReachableRoomsByChapter.get(chapter) ?? [])]
        .filter((room) => !usedRoomKeys.has(room.key))
        .sort((left, right) => compareRoomDistance(left, right, entryRoom));
      const room = routeBranchCandidates.find((candidate) => candidate.role === 'treasure-branch')
        ?? routeBranchCandidates[0]
        ?? candidateRooms.find((candidate) => candidate.role === 'treasure-branch')
        ?? candidateRooms[0]
        ?? fallbackRooms[0]
        ?? Phaser.Utils.Array.GetRandom(getChapterRooms(chapter).filter((candidate) => !bossSpawns.some((bossSpawn) => bossSpawn.chapter === chapter && bossSpawn.chamber === candidate.bounds)))
        ?? getChapterRooms(chapter)[0]
        ?? rooms[chapter - 1];
      usedRoomKeys.add(room.key);
      room.role = room.role === 'dead-end' || room.role === 'branch' ? 'treasure-branch' : room.role;
      return {
        x: room.centerX + Phaser.Math.Between(-28, 28),
        y: room.centerY + Math.min(28, Math.round(room.height * 0.18)),
        chapter,
      };
    });
    // If chestCount > 1, add more chests per chapter (fallback: random available rooms)
    while (chestSpawns.length < chestCount * 4) {
      const chapter = ((chestSpawns.length) % 4) + 1 as 1 | 2 | 3 | 4;
      const availableRooms = getChapterRooms(chapter).filter((room) => !usedRoomKeys.has(room.key));
      if (availableRooms.length === 0) break;
      const room = Phaser.Utils.Array.GetRandom(availableRooms);
      usedRoomKeys.add(room.key);
      chestSpawns.push({
        x: room.centerX + Phaser.Math.Between(-28, 28),
        y: room.centerY + Math.min(28, Math.round(room.height * 0.18)),
        chapter,
      });
    }

    const monsterSpawns: QuestMonsterSpawn[] = [];
      // --- After monsterSpawns is filled, ensure enough gates for all monsters/arrows ---
    const clueKinds = ['tracks', 'bones', 'echo'] as Array<'tracks' | 'bones' | 'echo'>;
    const roomRolePriority: Record<QuestRoomRole, number> = {
      entry: 0,
      'main-route': questSettings.mainRouteMonsterBias,
      junction: questSettings.junctionMonsterBias,
      'dead-end': 1,
      branch: 3,
      'treasure-branch': Math.max(1, Math.round(questSettings.treasureBranchPackBias / 2)),
      'boss-approach': questSettings.bossApproachMonsterBias,
    };
    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const entryRoom = chapterEntryRoomByChapter.get(chapter);
      const chapterMonsterPool = [...this.getQuestChapterMonsterPool(chapter)];
      const chapterRooms = [...(chapterReachableRoomsByChapter.get(chapter) ?? getChapterRooms(chapter))]
        .filter((room) => !bossSpawns.some((bossSpawn) => bossSpawn.chapter === chapter && bossSpawn.chamber === room.bounds));
      const deadEndCandidates = [...(chapterDeadEndRoomsByChapter.get(chapter) ?? [])]
        .filter((room) => !usedRoomKeys.has(room.key) && !bossSpawns.some((bossSpawn) => bossSpawn.chapter === chapter && bossSpawn.chamber === room.bounds));
      const desiredMonsterCount = Phaser.Math.Between(questSettings.baseMonsterRoomsMin, questSettings.baseMonsterRoomsMax);
      const packCount = Phaser.Math.Between(questSettings.packMonsterCountMin, questSettings.packMonsterCountMax);
      const guardedBranchRooms = chapterRooms
        .filter((room) => !usedRoomKeys.has(room.key) && (room.role === 'junction' || room.role === 'main-route' || room.role === 'boss-approach'))
        .sort((left, right) => {
          const priorityDifference = roomRolePriority[right.role] - roomRolePriority[left.role];
          if (priorityDifference !== 0) {
            return priorityDifference;
          }

          return compareRoomDistance(left, right, entryRoom);
        });
      const packRoom = packCount > 0
        ? questSettings.treasureBranchPackBias >= 5
          ? deadEndCandidates.find((room) => room.role === 'treasure-branch')
            ?? deadEndCandidates[0]
          : deadEndCandidates[0]
            ?? deadEndCandidates.find((room) => room.role === 'treasure-branch')
        : undefined;
      const hunterRoom = questSettings.enableHunterRoom
        ? guardedBranchRooms.find((room) => room.key !== packRoom?.key)
          ?? deadEndCandidates.find((room) => room.key !== packRoom?.key)
        : undefined;
      const reservedDeadEndKeys = new Set([packRoom?.key, hunterRoom?.key].filter((roomKey): roomKey is string => !!roomKey));
      const standardRooms = chapterRooms
        .filter((room) => !reservedDeadEndKeys.has(room.key))
        .sort((left, right) => {
          const priorityDifference = roomRolePriority[right.role] - roomRolePriority[left.role];
          if (priorityDifference !== 0) {
            return priorityDifference;
          }

          return compareRoomDistance(left, right, entryRoom);
        });
      const routeMonsterRooms = standardRooms.filter((room) => room.role === 'main-route' || room.role === 'boss-approach');
      const pushMonsterSpawn = (
        room: QuestDungeonRoom,
        monsterIndex: number,
        behavior: QuestMonsterBehavior,
        maxHp: number,
        contactDamageBonus: number,
      ) => {
        const monsterName = Phaser.Utils.Array.GetRandom(chapterMonsterPool) ?? 'Spider';
        const clueKind = Phaser.Utils.Array.GetRandom(clueKinds) ?? 'tracks';
        const moveStyle = behavior === 'hunter' ? 'hunter' : this.getQuestMonsterMoveStyle(monsterName);
        monsterSpawns.push({
          x: room.centerX + Phaser.Math.Between(-Math.min(38, Math.round(room.width * 0.18)), Math.min(38, Math.round(room.width * 0.18))),
          y: room.centerY + Phaser.Math.Between(-Math.min(28, Math.round(room.height * 0.16)), Math.min(28, Math.round(room.height * 0.16))),
          hiddenName: monsterName,
          rewardScore: 90 + (room.chapter - 1) * 40 + monsterIndex * 25 + (behavior === 'pack' ? 15 : behavior === 'hunter' ? 55 : 0),
          accentColor: this.getQuestChapterTint(room.chapter),
          clueKind,
          chapter: room.chapter,
          roomKey: room.key,
          roomRole: room.role,
          roamBounds: new Phaser.Geom.Rectangle(
            room.bounds.x + Phaser.Math.Between(10, 18),
            room.bounds.y + Phaser.Math.Between(8, 14),
            Math.max(34, room.bounds.width - Phaser.Math.Between(22, 34)),
            Math.max(30, room.bounds.height - Phaser.Math.Between(18, 28)),
          ),
          behavior,
          moveStyle,
          maxHp,
          contactDamage: contactDamageBonus,
        });
      };

      const selectedStandardRooms = desiredMonsterCount <= 0
        ? []
        : [
          ...routeMonsterRooms.slice(0, 1),
          ...standardRooms.filter((room) => !routeMonsterRooms.slice(0, 1).some((candidate) => candidate.key === room.key)),
        ].slice(0, desiredMonsterCount);

      selectedStandardRooms.forEach((room, index) => {
        pushMonsterSpawn(
          room,
          index,
          'standard',
          this.getQuestMonsterMaxHp(room.chapter),
          0,
        );
      });

      if (packRoom) {
        for (let index = 0; index < packCount; index += 1) {
          pushMonsterSpawn(
            packRoom,
            desiredMonsterCount + index,
            'pack',
            this.getQuestMonsterMaxHp(packRoom.chapter),
            0,
          );
        }
      }

      if (hunterRoom) {
        pushMonsterSpawn(
          hunterRoom,
          desiredMonsterCount + packCount,
          'hunter',
          Math.max(1, Math.round(this.getQuestMonsterMaxHp(hunterRoom.chapter) * questSettings.hunterHpMultiplier)),
          questSettings.hunterDamageBonus,
        );
      }
      // --- Ensure enough gates for all monsters/arrows in this chapter ---
      // Count gates for this chapter
      const gatesForChapter = gateSpawns.filter(g => g.chapter === chapter);
      const monstersForChapter = monsterSpawns.filter(m => m.chapter === chapter);
      if (gatesForChapter.length < monstersForChapter.length) {
        // Find available wall segments to add extra gates
        const bounds = chapterBoundsByChapter.get(chapter);
        if (bounds) {
          let added = 0;
          for (let i = 0; i < monstersForChapter.length - gatesForChapter.length; i++) {
            // Place extra gates along the perimeter (fallback)
            const x = bounds.left + ((i + 1) * bounds.width) / (monstersForChapter.length + 1);
            const y = bounds.top + ((i % 2 === 0 ? 0.2 : 0.8) * bounds.height);
            gateSpawns.push({
              x,
              y,
              chapter,
              width: QUEST_WALL_THICKNESS + 6,
              height: 48,
              kind: 'intra',
              roomKeys: [],
            });
            added++;
            if (added >= monstersForChapter.length - gatesForChapter.length) break;
          }
        }
      }
    });
    const surfaceLabels: Record<1 | 2 | 3 | 4, string> = {
      1: 'Key Mountain',
      2: 'Boat Mountain',
      3: 'Axe Mountain',
      4: 'Cloudy Mountain',
    };
    chapterEntryRooms.forEach(({ chapter, room }) => {
      const surfacePoint = this.getQuestSurfaceMarkerPosition(chapter);
      const surfaceX = surfacePoint.x;
      const surfaceY = surfacePoint.y + 12;
      const dungeonX = room.centerX;
      const dungeonY = room.bounds.y + Math.min(28, Math.max(18, Math.round(room.height * 0.26)));
      const returnMarkerY = room.centerY + Math.min(20, Math.max(12, Math.round(room.height * 0.14)));
      travelMarkers.push({
        x: surfaceX,
        y: surfaceY,
        width: 74,
        height: 70,
        label: surfaceLabels[chapter],
        chapter,
        markerKind: 'surface',
        destinationX: dungeonX,
        destinationY: dungeonY,
      });
      travelMarkers.push({
        x: room.centerX,
        y: returnMarkerY,
        width: 64,
        height: 16,
        label: 'CAMP',
        chapter,
        markerKind: 'return',
        destinationX: surfaceX,
        destinationY: surfaceY + 96,
      });
    });

    return {
      rooms,
      walls,
      routeSegments,
      gateSpawns,
      travelMarkers,
      fogZones,
      trialSpawns,
      chestSpawns,
      monsterSpawns,
      bossSpawns,
    };
  }

  private getQuestChapterTint(chapter: 1 | 2 | 3 | 4): number {
    switch (chapter) {
      case 1:
        return 0x4db7a7;
      case 2:
        return 0xffcf7a;
      case 3:
        return 0x9d8cff;
      case 4:
        return 0xfb7185;
    }
  }

  private createQuestRouteTrail(segments: Array<{ chapter: 1 | 2 | 3 | 4; fromX: number; fromY: number; toX: number; toY: number; emphasis: 'main-route' | 'boss-approach' }>): void {
    if (!this.questAdminSettings.showBossTrail || segments.length === 0) {
      return;
    }

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter) => {
      const chapterSegments = segments.filter((segment) => segment.chapter === chapter);
      if (chapterSegments.length === 0) {
        return;
      }

      const graphics = this.registerQuestChapterDecoration(chapter, this.add.graphics().setDepth(0.99));
      chapterSegments.forEach((segment) => {
        const tint = this.getQuestChapterTint(segment.chapter);
        const alpha = segment.emphasis === 'boss-approach' ? 0.24 : 0.14;
        const width = segment.emphasis === 'boss-approach' ? 10 : 6;
        graphics.lineStyle(width, tint, alpha);
        graphics.beginPath();
        graphics.moveTo(segment.fromX, segment.fromY);
        graphics.lineTo(segment.toX, segment.toY);
        graphics.strokePath();

        const midpointX = (segment.fromX + segment.toX) / 2;
        const midpointY = (segment.fromY + segment.toY) / 2;
        this.registerQuestChapterDecoration(chapter, this.add.circle(midpointX, midpointY, segment.emphasis === 'boss-approach' ? 7 : 5, tint, alpha + 0.05).setDepth(1));
      });
    });
  }

  private createQuestRouteGuide(room: QuestDungeonRoom): void {
    if (!this.questAdminSettings.showBossTrail || (room.role !== 'main-route' && room.role !== 'boss-approach')) {
      return;
    }

    const tint = this.getQuestChapterTint(room.chapter);
    if (room.role === 'boss-approach') {
      const beadSpacing = Math.max(24, Math.round(room.height * 0.18));
      [0, 1, 2].forEach((step) => {
        this.registerQuestChapterDecoration(room.chapter, this.add.ellipse(
          room.centerX,
          room.centerY + beadSpacing - (step * beadSpacing),
          Math.max(24, Math.round(room.width * (0.12 + (step * 0.03)))),
          12,
          tint,
          0.18 - (step * 0.03),
        ).setDepth(1.02));
      });

      this.registerQuestChapterDecoration(room.chapter, this.add.ellipse(
        room.centerX,
        room.centerY + Math.round(room.height * 0.2),
        Math.max(58, Math.round(room.width * 0.34)),
        18,
        tint,
        0.12,
      ).setDepth(1.01));
      return;
    }

    this.registerQuestChapterDecoration(room.chapter, this.add.ellipse(
      room.centerX,
      room.centerY + Math.round(room.height * 0.16),
      Math.max(64, Math.round(room.width * 0.42)),
      16,
      tint,
      0.1,
    ).setDepth(1.01));
    [-1, 1].forEach((direction) => {
      this.registerQuestChapterDecoration(room.chapter, this.add.ellipse(
        room.centerX + (direction * Math.max(20, Math.round(room.width * 0.18))),
        room.centerY + Math.round(room.height * 0.16),
        16,
        16,
        tint,
        0.14,
      ).setDepth(1.02));
    });
  }

  private getQuestClueTextureKey(clueKind: 'tracks' | 'bones' | 'echo'): string {
    switch (clueKind) {
      case 'tracks':
        return 'quest-clue-tracks';
      case 'bones':
        return 'quest-clue-bones';
      case 'echo':
      default:
        return 'quest-clue-echo';
    }
  }

  private getQuestClueLabel(clueKind: 'tracks' | 'bones' | 'echo'): string {
    switch (clueKind) {
      case 'tracks':
        return 'Tracks found';
      case 'bones':
        return 'Bones found';
      case 'echo':
      default:
        return 'Echo heard';
    }
  }

  private getQuestClueWarning(monster: HiddenMonster): string {
    switch (monster.clueKind) {
      case 'tracks':
        return `Fresh tracks cut through the dark. A ${monster.hiddenName} is stalking this corridor.`;
      case 'bones':
        return `Bones litter the floor nearby. A ${monster.hiddenName} is close.`;
      case 'echo':
      default:
        return `A strange echo rolls through the cave. ${monster.hiddenName} is somewhere ahead.`;
    }
  }

  private getQuestRoomMonsters(roomKey: string): HiddenMonster[] {
    return ((this.hiddenMonsters?.getChildren() as HiddenMonster[] | undefined) ?? [])
      .filter((monster) => monster.roomKey === roomKey && !monster.defeated);
  }

  private highlightQuestClueMarker(monster: HiddenMonster): void {
    if (monster.revealed || monster.defeated || !monster.clueMarker) {
      return;
    }

    monster.clueMarker.setVisible(true);
    monster.clueMarker.setAlpha(Math.max(monster.clueMarker.alpha, 0.62));
    monster.clueMarker.setScale(0.9);
    this.tweens.add({
      targets: monster.clueMarker,
      alpha: 0.92,
      scaleX: 1,
      scaleY: 1,
      duration: 280,
      ease: 'Sine.Out',
      yoyo: true,
      hold: 90,
    });
  }

  private getQuestRoomGuidance(room: QuestDungeonRoom, roomMonsters: HiddenMonster[]): { label: string; message: string; color: number } | undefined {
    const lurkingMonster = roomMonsters.find((monster) => !monster.revealed);

    switch (room.role) {
      case 'boss-approach':
        return lurkingMonster
          ? {
            label: 'Lair signs',
            message: `${lurkingMonster.hiddenName} signs are thick on the boss approach. Stay on the connected trail and push deeper.`,
            color: 0xffcf7a,
          }
          : {
            label: 'Boss approach',
            message: 'The stonework tightens into the final approach. Keep following the connected trail deeper into the chapter.',
            color: 0xffcf7a,
          };
      case 'main-route':
        return lurkingMonster
          ? {
            label: 'Trail fresh',
            message: `${lurkingMonster.hiddenName} is working the main route ahead. The connected trail leads through this wing.`,
            color: this.getQuestChapterTint(room.chapter),
          }
          : {
            label: 'Main route',
            message: 'This chamber sits on the clearest route forward. Follow the connected trail to reach the next fight.',
            color: this.getQuestChapterTint(room.chapter),
          };
      default:
        return undefined;
    }
  }

  private createQuestRockDecor(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number,
    count: number,
  ): Phaser.GameObjects.Shape[] {
    return Array.from({ length: count }, (_, index) => {
      const horizontal = width >= height;
      const jitterX = horizontal
        ? Phaser.Math.Between(-Math.max(12, Math.round(width * 0.46)), Math.max(12, Math.round(width * 0.46)))
        : Phaser.Math.Between(-10, 10);
      const jitterY = horizontal
        ? Phaser.Math.Between(-10, 10)
        : Phaser.Math.Between(-Math.max(12, Math.round(height * 0.46)), Math.max(12, Math.round(height * 0.46)));
      const rock = this.add.ellipse(
        x + jitterX,
        y + jitterY,
        horizontal ? Phaser.Math.Between(10, 22) : Phaser.Math.Between(14, 24),
        horizontal ? Phaser.Math.Between(14, 24) : Phaser.Math.Between(10, 22),
        index % 2 === 0 ? 0x2b2119 : 0x403227,
        Phaser.Math.FloatBetween(0.78, 0.94),
      ).setDepth(depth);
      rock.setAngle(Phaser.Math.Between(-28, 28));
      return rock;
    });
  }

  private createQuestWallSprite(wall: QuestWallSpec): QuestWall {
    const rectangle = this.add.rectangle(wall.x, wall.y, wall.width, wall.height, 0x19110d, 0.98).setDepth(2) as QuestWall;
    rectangle.chapter = wall.chapter;
    rectangle.decorations = this.createQuestRockDecor(
      wall.x,
      wall.y,
      wall.width,
      wall.height,
      2.04,
      wall.width >= wall.height ? Phaser.Math.Between(3, 5) : Phaser.Math.Between(4, 6),
    );
    this.physics.add.existing(rectangle, true);
    return rectangle;
  }

  private applyQuestGateDecorationStyle(gate: QuestGate, fillColor: number, accentColor: number, accentAlpha: number): void {
    gate.decorations?.forEach((shape, index) => {
      if (shape instanceof Phaser.GameObjects.Rectangle) {
        const isAccent = index >= (gate.decorations?.length ?? 0) - 2;
        shape.setFillStyle(isAccent ? accentColor : fillColor, isAccent ? accentAlpha : 0.96);
      } else {
        shape.setFillStyle(index % 2 === 0 ? 0x2b2119 : 0x403227, 0.94);
      }
    });
  }

  private createQuestGateSprite(
    x: number,
    y: number,
    width: number,
    height: number,
    chapter: 1 | 2 | 3 | 4,
    kind: 'intra' | 'frontier',
  ): QuestGate {
    const orientation = width >= height ? 'horizontal' : 'vertical';
    const gate = this.add.rectangle(x, y, width, height, 0x2c2119, 0.94).setDepth(2.4) as QuestGate;
    const slabOffset = Phaser.Math.Between(
      -Math.round((orientation === 'horizontal' ? width : height) * 0.18),
      Math.round((orientation === 'horizontal' ? width : height) * 0.18),
    );
    gate.orientation = orientation;
    gate.decorations = [
      ...this.createQuestRockDecor(x, y, width, height, 2.34, orientation === 'horizontal' ? Phaser.Math.Between(1, 3) : Phaser.Math.Between(2, 4)),
      orientation === 'horizontal'
        ? this.add.rectangle(x + slabOffset, y, Math.max(8, width * 0.12), height + 8, 0x4a3b2d, 0.88).setDepth(2.46)
        : this.add.rectangle(x, y + slabOffset, width + 8, Math.max(8, height * 0.12), 0x4a3b2d, 0.88).setDepth(2.46),
      orientation === 'horizontal'
        ? this.add.rectangle(x - width * 0.3, y + Phaser.Math.Between(-5, 5), Math.max(6, width * 0.06), height + Phaser.Math.Between(2, 10), 0x33271f, 0.72).setDepth(2.43)
        : this.add.rectangle(x + Phaser.Math.Between(-5, 5), y - height * 0.3, width + Phaser.Math.Between(2, 10), Math.max(6, height * 0.06), 0x33271f, 0.72).setDepth(2.43),
    ];
    this.physics.add.existing(gate, true);
    gate.chapter = chapter;
    gate.kind = kind;
    gate.opened = false;
    this.applyQuestClosedGateStyle(gate);
    return gate;
  }

  private spotQuestMonsterClue(monster: HiddenMonster): void {
    if (monster.clueSpotted || monster.revealed || monster.defeated) {
      return;
    }

    monster.clueSpotted = true;
    if (monster.clueMarker) {
      monster.clueMarker.setVisible(true);
      this.tweens.add({
        targets: monster.clueMarker,
        alpha: 0.9,
        scaleX: 1,
        scaleY: 1,
        duration: 260,
        ease: 'Sine.Out',
      });
    }

    this.showFloatingLabel(monster.x, monster.y - 30, this.getQuestClueLabel(monster.clueKind), 0xffe082);
    this.setExplanationMessage(this.getQuestClueWarning(monster), `${monster.hiddenName} sign.`);
    this.playImpactTone(260, 170, 0.08, 0.025);
  }

  private revealHiddenMonster(monster: HiddenMonster, explanation: string, labelText: string): void {
    if (monster.revealed || monster.defeated) {
      return;
    }

    monster.revealed = true;
    monster.clueSpotted = true;
    monster.clueMarker?.setVisible(false);
    this.assignQuestMonsterVelocity(monster, true);
    this.tweens.add({
      targets: monster,
      alpha: 0.92,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.Out',
    });
    this.showFloatingLabel(monster.x, monster.y - 34, labelText, 0xa7f3d0);
    this.setExplanationMessage(explanation, `${monster.hiddenName} out.`);
    this.playImpactTone(220, 360, 0.12, 0.04);
  }

  private getQuestRoomAtPosition(x: number, y: number): QuestDungeonRoom | undefined {
    return this.questRooms.find((room) => Phaser.Geom.Rectangle.Contains(room.bounds, x, y));
  }

  private registerQuestChapterDecoration<T extends VisibleQuestDecoration>(chapter: 1 | 2 | 3 | 4, object: T): T {
    this.questChapterDecorations.push({ chapter, object });
    return object;
  }

  private handleQuestRoomTransition(): void {
    if (this.gameMode !== 'quest' || this.questViewMode !== 'dungeon' || !this.player.active) {
      return;
    }

    const room = this.getQuestRoomAtPosition(this.player.x, this.player.y);
    if (!room || room.key === this.currentQuestRoomKey) {
      return;
    }

    this.currentQuestRoomKey = room.key;
    const roomMonsters = this.getQuestRoomMonsters(room.key);
    roomMonsters.slice(0, 2).forEach((monster) => {
      this.highlightQuestClueMarker(monster);
    });

    if (this.currentQuestionSource === 'standard' && !this.activeQuestTrial && !this.focusedQuestGate) {
      const guidance = this.getQuestRoomGuidance(room, roomMonsters);
      if (guidance) {
        this.showFloatingLabel(room.centerX, room.bounds.y + 18, guidance.label, guidance.color);
        this.setExplanationMessage(guidance.message, guidance.label);
      }
    }

    this.playQuestCue('room');
  }

  private refreshQuestOverworldPanel(): void {
    if (!this.questOverworldPanel || this.questOverworldZoneTexts.length === 0) {
      return;
    }

    ([1, 2, 3, 4] as Array<1 | 2 | 3 | 4>).forEach((chapter, index) => {
      const status = this.getQuestOverworldStatusText(chapter);
      this.questOverworldZoneTexts[index].setText(status.text);
      this.questOverworldZoneTexts[index].setColor(status.color);
    });

    this.questOverworldFocusText?.setText(this.getQuestOverworldFocusSummary());
  }

  private setQuestViewMode(mode: QuestViewMode, chapter: 1 | 2 | 3 | 4): void {
    this.questViewMode = mode;
    this.activeQuestTravelChapter = chapter;
    if (mode === 'dungeon') {
      this.syncQuestBossToChapter(chapter);
    }
    if (mode === 'overworld') {
      this.currentQuestRoomKey = undefined;
    }

    const dungeonVisible = mode === 'dungeon';
    this.questWalls?.getChildren().forEach((child) => {
      const wall = child as QuestWall;
      const visible = dungeonVisible && wall.chapter === chapter;
      wall.setVisible(visible);
      wall.body.enable = visible;
      wall.decorations?.forEach((shape) => {
        shape.setVisible(visible);
      });
    });

    this.questGates?.getChildren().forEach((child) => {
      const gate = child as QuestGate;
      const visible = dungeonVisible && gate.chapter === chapter && !gate.opened;
      gate.setVisible(visible);
      gate.body.enable = visible;
      gate.decorations?.forEach((shape) => {
        shape.setVisible(visible);
      });
    });

    this.questTrials?.getChildren().forEach((child) => {
      const trial = child as QuestTrial;
      const visible = dungeonVisible && trial.chapter === chapter && trial.active;
      trial.setVisible(visible);
      if (trial.body) {
        trial.body.enable = visible;
      }
    });

    this.hiddenMonsters?.getChildren().forEach((child) => {
      const monster = child as HiddenMonster;
      const visible = dungeonVisible && monster.chapter === chapter && monster.active;
      monster.setVisible(visible);
      if (monster.body) {
        monster.body.enable = visible;
      }
      monster.clueMarker?.setVisible(visible && !monster.defeated && !monster.revealed && monster.clueSpotted);
    });

    this.treasureChests?.getChildren().forEach((child) => {
      const chest = child as TreasureChest;
      const visible = dungeonVisible && chest.chapter === chapter && chest.active;
      chest.setVisible(visible);
      if (chest.body) {
        chest.body.enable = visible;
      }
    });

    this.questFogZones.forEach((fog) => {
      fog.setVisible(dungeonVisible && fog.chapter === chapter);
    });

    this.questChapterDecorations.forEach(({ chapter: decorationChapter, object }) => {
      object.setVisible(dungeonVisible && decorationChapter === chapter);
    });

    this.questBossAltar?.setVisible(dungeonVisible);
    this.questBoss?.setVisible(dungeonVisible && !this.questBoss.defeated);
    if (this.questBoss?.body) {
      this.questBoss.body.enable = dungeonVisible && !this.questBoss.defeated && this.questBoss.awakened;
    }

    this.questBossPillars.forEach((pillar) => {
      pillar.setVisible(false);
      pillar.body.enable = false;
    });
    this.questBossHazards?.getChildren().forEach((child) => {
      const hazard = child as QuestBossHazard;
      hazard.setVisible(dungeonVisible && this.questBoss?.chapter === chapter);
      if (hazard.body) {
        hazard.body.enable = dungeonVisible && this.questBoss?.chapter === chapter;
      }
    });

    this.questTravelMarkers?.getChildren().forEach((child) => {
      const marker = child as QuestTravelMarker;
      const visible = mode === 'overworld'
        ? marker.markerKind === 'surface' && marker.chapter <= this.level
        : marker.markerKind === 'return' && marker.chapter === chapter;
      marker.setVisible(visible);
      marker.body.enable = visible;
      marker.decorations?.forEach((shape) => {
        shape.setVisible(visible);
      });
    });

    this.questOverworldPanel?.setVisible(mode === 'overworld');
    this.refreshQuestPlayerPresentation();
    this.refreshQuestCameraState();
    this.refreshQuestHudMode();
    this.refreshQuestOverworldPanel();
    this.refreshQuestTrials();
    this.refreshQuestBoss();
    this.updateProgressText();
  }

  private createHud(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const hudDepth = 20;
    const bannerDepth = 22;
    const sidebar = this.getQuestSidebarMetrics();
    const leftHudWidth = this.gameMode === 'quest' ? QUEST_DUNGEON_BOUNDS.width - 96 : 700;

    this.promptText = this.pinToScreen(this.add.text(48, 28, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#f4f7fb',
      wordWrap: { width: leftHudWidth },
    }).setDepth(hudDepth));

    this.categoryText = this.pinToScreen(this.add.text(sidebar.textX, 10, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#ffe082',
      wordWrap: { width: sidebar.textWidth },
    }).setDepth(hudDepth));

    this.modeText = this.pinToScreen(this.add.text(sidebar.textX, 34, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#9fd3ff',
      wordWrap: { width: sidebar.textWidth },
    }).setDepth(hudDepth));

    this.phaseText = this.pinToScreen(this.add.text(sidebar.textX, 58, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#78cfff',
      wordWrap: { width: sidebar.textWidth },
    }).setDepth(hudDepth));

    this.questAnswerInputPanel = this.pinToScreen(this.add.rectangle(sidebar.centerX, 160, sidebar.width - 12, 40, 0x0b1826, 0.72)
      .setStrokeStyle(1, 0x5ea9d8, 0.16)
      .setDepth(hudDepth)
      .setVisible(this.gameMode === 'quest')
      .setInteractive({ useHandCursor: true }));
    this.questAnswerInputPanel.on('pointerdown', () => {
      this.focusQuestAnswerInput();
    });

    this.questAnswerInputText = this.pinToScreen(this.add.text(sidebar.textX, 148, '', {
      fontFamily: 'Consolas',
      fontSize: '18px',
      color: '#f4f7fb',
      wordWrap: { width: sidebar.textWidth - 8 },
    }).setDepth(hudDepth).setVisible(this.gameMode === 'quest').setInteractive({ useHandCursor: true }));
    this.questAnswerInputText.on('pointerdown', () => {
      this.focusQuestAnswerInput();
    });

    this.questAnswerHintText = this.pinToScreen(this.add.text(sidebar.textX, 174, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#9fd3ff',
      wordWrap: { width: sidebar.textWidth },
    }).setDepth(hudDepth).setVisible(this.gameMode === 'quest').setInteractive({ useHandCursor: true }));
    this.questAnswerHintText.on('pointerdown', () => {
      this.focusQuestAnswerInput();
    });

    this.questChoiceTexts = [0, 1, 2].map((index) => {
      const text = this.pinToScreen(this.add.text(sidebar.left + 10, 212 + index * 54, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '16px',
        color: '#f4f7fb',
        backgroundColor: '#0b1826',
        wordWrap: { width: sidebar.width - 28 },
        padding: { left: 8, right: 8, top: 6, bottom: 6 },
      }).setDepth(hudDepth).setInteractive({ useHandCursor: true }).setVisible(this.gameMode === 'quest'));
      text.on('pointerdown', () => {
        this.handleAnswer(index);
      });
      return text;
    });

    this.questJournalText = this.pinToScreen(this.add.text(sidebar.textX, 404, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#b9d6ee',
      lineSpacing: 4,
      wordWrap: { width: sidebar.textWidth },
    }).setDepth(hudDepth));

    this.supportingDataText = this.pinToScreen(this.add.text(sidebar.textX, 92, '', {
      fontFamily: 'Consolas',
      fontSize: '15px',
      color: '#d9f4ff',
      lineSpacing: 5,
      wordWrap: { width: sidebar.textWidth },
    }).setDepth(hudDepth));

    this.progressText = this.pinToScreen(this.add.text(48, height - 148, 'Clear 3 correct answers to intensify the traffic pattern and stage pressure.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '19px',
      color: '#c7d8ea',
      wordWrap: { width: leftHudWidth },
    }).setDepth(hudDepth));

    this.explanationText = this.pinToScreen(this.add.text(68, height - 148, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#d9f4ff',
      align: 'left',
      wordWrap: { width: leftHudWidth },
    }).setOrigin(0, 0).setDepth(hudDepth));

    this.pinToScreen(this.add.text(this.gameMode === 'quest' ? QUEST_DUNGEON_BOUNDS.left + (QUEST_DUNGEON_BOUNDS.width / 2) : width - 228, height - 92, this.gameMode === 'quest'
      ? 'C: calculator   Space: fire arrow   F: flag question   E: export CSV'
      : 'C: calculator   F: flag question   E: export CSV', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#9fd3ff',
    }).setOrigin(0.5, 0).setDepth(hudDepth));

    this.scoreText = this.pinToScreen(this.add.text(48, height - 56, 'Score: 0', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#ffe082',
    }).setDepth(hudDepth));

    this.levelText = this.pinToScreen(this.add.text(280, height - 56, 'Level 1', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#9fd3ff',
    }).setDepth(hudDepth));

    this.armoryText = this.pinToScreen(this.add.text(650, height - 56, 'Armory: 0', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#78cfff',
    }).setDepth(hudDepth));

    this.livesText = this.pinToScreen(this.add.text(width - 196, height - 56, 'Lives: 3', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#ff9aa2',
    }).setDepth(hudDepth));

    this.bannerText = this.pinToScreen(this.add.text(width / 2, height / 2, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '38px',
      color: '#ffe082',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#08111f',
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0).setDepth(bannerDepth));

    if (this.gameMode === 'quest') {
      this.scoreText.setText('Renown 0').setFontSize(18);
      this.levelText.setFontSize(18);
      this.armoryText.setFontSize(18);
      this.livesText.setFontSize(18);
      this.refreshQuestHudMode();
    }

    this.refreshStageHud();
    this.refreshScoreHud();
    this.refreshArmoryHud();
    this.refreshVitalHud();
    this.refreshQuestAnswerInput();
    this.refreshQuestJournal();
  }

  private createControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.calculatorKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.flagKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.exportKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.input.keyboard!.on('keydown', this.handleSceneKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleSceneKeyDown, this);
    });
  }

  private createCalculator(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const panelX = width / 2;
    const panelY = height / 2 + 8;
    const panelWidth = 908;
    const panelHeight = 506;
    const buttonWidth = 60;
    const buttonHeight = 48;
    const columnGap = 10;
    const rowGap = 10;
    const keypadStartX = 132;
    const keypadStartY = -6;
    const graphLeft = -404;
    const graphTop = -60;
    const graphWidth = 410;
    const graphHeight = 244;

    const backdrop = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x06111c, 0.98).setStrokeStyle(2, 0x78cfff, 0.55);
    const leftPanel = this.add.rectangle(-222, -14, 454, 432, 0x0d1d30, 0.92).setStrokeStyle(1, 0x7ebde7, 0.28);
    const rightPanel = this.add.rectangle(236, -14, 390, 432, 0x0c1826, 0.92).setStrokeStyle(1, 0xa7d8ff, 0.22);
    const title = this.add.text(0, -228, 'Graphing Calculator', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#f4f7fb',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, -200, 'Use question values, build an expression, then inspect the graph area.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#9fd3ff',
    }).setOrigin(0.5);

    const valuePanel = this.add.rectangle(-222, -172, 454, 94, 0x12253a, 0.92).setStrokeStyle(1, 0xa7d8ff, 0.32);
    const valueTitle = this.add.text(-420, -206, 'Question Values', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const valueHint = this.add.text(-420, -188, 'Tap a chip to insert its token into the work area.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#9fd3ff',
    }).setOrigin(0, 0.5);

    this.calculatorVariableChipContainer = this.add.container(-410, -156);

    const graphTitle = this.add.text(-420, -94, 'Graph Area', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const graphFrame = this.add.rectangle(graphLeft + graphWidth / 2, graphTop + graphHeight / 2, graphWidth, graphHeight, 0x08131f, 0.98)
      .setStrokeStyle(1, 0x7ebde7, 0.34);
    this.calculatorGraphGraphics = this.add.graphics({ x: graphLeft, y: graphTop }).setDepth(31);
    const graphHitZone = this.add.rectangle(graphLeft + graphWidth / 2, graphTop + graphHeight / 2, graphWidth, graphHeight, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    graphHitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleGraphSelection(pointer.worldX, pointer.worldY);
    });

    this.calculatorGraphInfoText = this.add.text(graphLeft, 198, 'Click the graph to inspect a point.', {
      fontFamily: 'Consolas',
      fontSize: '14px',
      color: '#d8ecff',
      wordWrap: { width: graphWidth },
    }).setOrigin(0, 0);

    this.calculatorGraphHintText = this.add.text(graphLeft, 220, 'Graphing works when the expression uses x. Example: x^2, sqrt(x+4), exp(x/3).', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#9fd3ff',
      wordWrap: { width: graphWidth },
    }).setOrigin(0, 0);

    const displayFrame = this.add.rectangle(236, -170, 390, 116, 0x12253a, 0.94).setStrokeStyle(1, 0xa7d8ff, 0.32);
    const displayLabel = this.add.text(60, -206, 'Work Area', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const resultLabel = this.add.text(360, -206, 'Result', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#9fd3ff',
    }).setOrigin(1, 0.5);

    this.calculatorExpressionText = this.add.text(60, -182, '0', {
      fontFamily: 'Consolas',
      fontSize: '18px',
      color: '#d8ecff',
      wordWrap: { width: 300 },
    }).setOrigin(0, 0);

    this.calculatorResultText = this.add.text(360, -128, '0', {
      fontFamily: 'Consolas',
      fontSize: '30px',
      color: '#ffe082',
      align: 'right',
      wordWrap: { width: 300 },
    }).setOrigin(1, 0);

    this.calculatorStatusText = this.add.text(236, 194, 'Calculator pauses the run. Press C or Esc to close.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#b8d8f2',
      align: 'center',
      wordWrap: { width: 340 },
    }).setOrigin(0.5);

    const buttonConfigs: CalculatorButtonConfig[] = [
      { label: '7', value: '7', row: 0, column: 0, accentColor: 0x183048 },
      { label: '8', value: '8', row: 0, column: 1, accentColor: 0x183048 },
      { label: '9', value: '9', row: 0, column: 2, accentColor: 0x183048 },
      { label: '/', value: '/', row: 0, column: 3, accentColor: 0x244d72 },
      { label: 'sqrt', value: 'sqrt(', row: 0, column: 4, accentColor: 0x355d87 },
      { label: '4', value: '4', row: 1, column: 0, accentColor: 0x183048 },
      { label: '5', value: '5', row: 1, column: 1, accentColor: 0x183048 },
      { label: '6', value: '6', row: 1, column: 2, accentColor: 0x183048 },
      { label: '*', value: '*', row: 1, column: 3, accentColor: 0x244d72 },
      { label: '^', value: '^', row: 1, column: 4, accentColor: 0x355d87 },
      { label: '1', value: '1', row: 2, column: 0, accentColor: 0x183048 },
      { label: '2', value: '2', row: 2, column: 1, accentColor: 0x183048 },
      { label: '3', value: '3', row: 2, column: 2, accentColor: 0x183048 },
      { label: '-', value: '-', row: 2, column: 3, accentColor: 0x244d72 },
      { label: '(', value: '(', row: 2, column: 4, accentColor: 0x355d87 },
      { label: '0', value: '0', row: 3, column: 0, accentColor: 0x183048 },
      { label: '.', value: '.', row: 3, column: 1, accentColor: 0x183048 },
      { label: 'x', value: 'x', row: 3, column: 2, accentColor: 0x183048 },
      { label: '+', value: '+', row: 3, column: 3, accentColor: 0x244d72 },
      { label: ')', value: ')', row: 3, column: 4, accentColor: 0x355d87 },
      { label: 'C', value: 'clear', row: 4, column: 0, accentColor: 0x5b1f35 },
      { label: '⌫', value: 'backspace', row: 4, column: 1, accentColor: 0x5b1f35 },
      { label: 'Ans', value: 'ans', row: 4, column: 2, accentColor: 0x2a6447 },
      { label: 'exp', value: 'exp(', row: 4, column: 3, accentColor: 0x355d87 },
      { label: '=', value: '=', row: 4, column: 4, accentColor: 0x2a6447 },
    ];

    const buttons = buttonConfigs.map((config) => {
      const buttonX = keypadStartX + config.column * (buttonWidth + columnGap);
      const buttonY = keypadStartY + config.row * (buttonHeight + rowGap);
      return this.createCalculatorButton(buttonX, buttonY, buttonWidth, buttonHeight, config);
    });

    this.calculatorContainer = this.add.container(panelX, panelY, [
      backdrop,
      leftPanel,
      rightPanel,
      title,
      subtitle,
      valuePanel,
      valueTitle,
      valueHint,
      this.calculatorVariableChipContainer,
      graphTitle,
      graphFrame,
      this.calculatorGraphGraphics,
      graphHitZone,
      this.calculatorGraphInfoText,
      this.calculatorGraphHintText,
      displayFrame,
      displayLabel,
      resultLabel,
      this.calculatorExpressionText,
      this.calculatorResultText,
      ...buttons,
      this.calculatorStatusText,
    ]);
    this.calculatorContainer.setDepth(30);
    this.calculatorContainer.setScrollFactor(0);
    this.calculatorContainer.setVisible(false);

    this.refreshCalculatorDisplay();
  }

  private createCalculatorButton(
    x: number,
    y: number,
    width: number,
    height: number,
    config: CalculatorButtonConfig,
  ): Phaser.GameObjects.Container {
    const buttonFace = this.add.rectangle(0, 0, width, height, config.accentColor, 0.98).setStrokeStyle(1, 0xb8ddff, 0.18);
    const highlight = this.add.rectangle(0, -height / 2 + 7, width - 10, 9, 0xffffff, 0.08);
    const label = this.add.text(0, 0, config.label, {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#f4f7fb',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const button = this.add.container(x, y, [buttonFace, highlight, label]);
    button.setSize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      buttonFace.setFillStyle(Phaser.Display.Color.ValueToColor(config.accentColor).brighten(20).color, 1);
      button.setScale(1.03);
    });
    button.on('pointerout', () => {
      buttonFace.setFillStyle(config.accentColor, 0.98);
      button.setScale(1);
    });
    button.on('pointerdown', () => {
      this.handleCalculatorInput(config.value);
      this.tweens.add({
        targets: button,
        scaleX: 0.94,
        scaleY: 0.94,
        duration: 55,
        yoyo: true,
        ease: 'Quad.Out',
      });
    });

    return button;
  }

  private handleSceneKeyDown(event: KeyboardEvent): void {
    if (!this.calculatorOpen && this.gameMode === 'quest' && this.handleQuestAnswerInputKey(event)) {
      event.preventDefault();
      return;
    }

    if (!this.calculatorOpen && this.gameMode === 'quest' && !this.questAnswerInputFocused) {
      const answerIndex = this.getQuestAnswerIndexFromKey(event.key);
      if (answerIndex !== null) {
        event.preventDefault();
        this.handleAnswer(answerIndex);
        return;
      }
    }

    if (!this.calculatorOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.toggleCalculator();
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.handleCalculatorInput(event.key);
      return;
    }

    if (['+', '-', '*', '/', '(', ')', '.', '^'].includes(event.key)) {
      event.preventDefault();
      this.handleCalculatorInput(event.key);
      return;
    }

    if (['x', 'X'].includes(event.key)) {
      event.preventDefault();
      this.handleCalculatorInput('x');
      return;
    }

    if (event.key === 'Enter' || event.key === '=') {
      event.preventDefault();
      this.handleCalculatorInput('=');
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.handleCalculatorInput('backspace');
    }
  }

  private getQuestAnswerIndexFromKey(key: string): number | null {
    if (!this.currentQuestion || !this.acceptingAnswer) {
      return null;
    }

    if (key === '1' || key === 'Numpad1') {
      return 0;
    }

    if (key === '2' || key === 'Numpad2') {
      return 1;
    }

    if (key === '3' || key === 'Numpad3') {
      return 2;
    }

    return null;
  }

  private handleQuestAnswerInputKey(event: KeyboardEvent): boolean {
    if (this.gameMode !== 'quest' || this.calculatorOpen || !this.currentQuestion) {
      return false;
    }

    if (!this.questAnswerInputFocused) {
      if (event.key === 'Enter') {
        this.focusQuestAnswerInput();
        return true;
      }
      return false;
    }

    if (event.key === 'Escape') {
      this.blurQuestAnswerInput(false);
      return true;
    }

    if (event.key === 'Enter') {
      this.submitQuestTypedAnswer();
      return true;
    }

    if (event.key === 'Backspace') {
      this.questTypedAnswer = this.questTypedAnswer.slice(0, -1);
      this.refreshQuestAnswerInput();
      return true;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }

    if (event.key === ' ') {
      if (this.questTypedAnswer.length < 52) {
        this.questTypedAnswer += ' ';
        this.refreshQuestAnswerInput();
      }
      return true;
    }

    if (/^[0-9a-zA-Z/%().,+\-*=:']$/.test(event.key) && this.questTypedAnswer.length < 52) {
      this.questTypedAnswer += event.key;
      this.refreshQuestAnswerInput();
      return true;
    }

    return false;
  }

  private focusQuestAnswerInput(): void {
    if (this.gameMode !== 'quest' || this.calculatorOpen || this.gameOver) {
      return;
    }

    this.questAnswerInputFocused = true;
    this.refreshQuestAnswerInput();
  }

  private blurQuestAnswerInput(clearText: boolean): void {
    this.questAnswerInputFocused = false;
    if (clearText) {
      this.questTypedAnswer = '';
    }
    this.refreshQuestAnswerInput();
  }

  private refreshQuestAnswerInput(statusText?: string): void {
    if (!this.questAnswerInputPanel || !this.questAnswerInputText || !this.questAnswerHintText) {
      return;
    }

    const visible = false;
    this.questAnswerInputPanel.setVisible(visible);
    this.questAnswerInputText.setVisible(visible);
    this.questAnswerHintText.setVisible(visible);

    if (!visible) {
      return;
    }

    this.questAnswerInputPanel.setStrokeStyle(this.questAnswerInputFocused ? 2 : 1, this.questAnswerInputFocused ? 0xffcf7a : 0x5ea9d8, this.questAnswerInputFocused ? 0.7 : 0.26);
    this.questAnswerInputText.setText(this.questTypedAnswer.length > 0 ? `${this.questTypedAnswer}${this.questAnswerInputFocused ? '|' : ''}` : (this.questAnswerInputFocused ? '|' : 'Click here to type an answer'));
    this.questAnswerInputText.setColor(this.questTypedAnswer.length > 0 ? '#f4f7fb' : '#8fb6d6');
    this.questAnswerHintText.setText(statusText ?? (this.questAnswerInputFocused
      ? 'Type an answer or 1-3, then press Enter. Esc leaves typing mode.'
      : 'Click the field to type, or choose one of the three answer options.'));
  }

  private submitQuestTypedAnswer(): void {
    const typedAnswer = this.questTypedAnswer.trim();
    const answerIndex = this.resolveQuestTypedAnswerIndex(typedAnswer);

    if (typedAnswer.length === 0) {
      this.refreshQuestAnswerInput('Type an answer first, then press Enter.');
      return;
    }

    if (answerIndex !== null) {
      this.submitAnswerResult(answerIndex, answerIndex === this.currentQuestion.answerIndex);
      return;
    }

    const isCorrect = this.questAnswersMatch(typedAnswer, this.currentQuestion.options[this.currentQuestion.answerIndex]);
    this.submitAnswerResult(undefined, isCorrect);
  }

  private resolveQuestTypedAnswerIndex(rawAnswer: string): number | null {
    if (!this.currentQuestion) {
      return null;
    }

    const trimmed = rawAnswer.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const shortcutMatch = trimmed.toLowerCase().match(/^(?:option\s*)?([123])$/);
    if (shortcutMatch) {
      return Number(shortcutMatch[1]) - 1;
    }

    const matchedIndex = this.currentQuestion.options.findIndex((option) => this.questAnswersMatch(trimmed, option));
    return matchedIndex >= 0 ? matchedIndex : null;
  }

  private questAnswersMatch(inputText: string, optionText: string): boolean {
    const normalizedInput = this.normalizeQuestAnswerText(inputText);
    const normalizedOption = this.normalizeQuestAnswerText(optionText);
    if (normalizedInput === normalizedOption) {
      return true;
    }

    const compactInput = this.compactQuestAnswerText(inputText);
    const compactOption = this.compactQuestAnswerText(optionText);
    if (compactInput.length > 0 && compactInput === compactOption) {
      return true;
    }

    const numericInput = this.parseQuestNumericAnswer(inputText);
    const numericOption = this.parseQuestNumericAnswer(optionText);
    return numericInput !== null && numericOption !== null && Math.abs(numericInput - numericOption) < 0.000001;
  }

  private normalizeQuestAnswerText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[–—]/g, '-')
      .replace(/×/g, 'x')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private compactQuestAnswerText(value: string): string {
    return this.normalizeQuestAnswerText(value).replace(/[^a-z0-9/%().+\-*=]/g, '');
  }

  private parseQuestNumericAnswer(value: string): number | null {
    const compact = value.replace(/\s+/g, '').replace(/%$/, ' percent');
    const percentMatch = compact.match(/^(-?\d+(?:\.\d+)?)percent$/i);
    if (percentMatch) {
      return Number(percentMatch[1]) / 100;
    }

    const fractionMatch = compact.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (fractionMatch) {
      const denominator = Number(fractionMatch[2]);
      if (denominator === 0) {
        return null;
      }
      return Number(fractionMatch[1]) / denominator;
    }

    const numericValue = Number(compact.replace(/,$/, ''));
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private toggleCalculator(): void {
    if (this.gameOver || this.recovering || !this.acceptingAnswer || !this.trackerReady) {
      return;
    }

    if (!this.calculatorOpen) {
      this.blurQuestAnswerInput(false);
    }

    this.calculatorOpen = !this.calculatorOpen;
    this.calculatorContainer.setVisible(this.calculatorOpen);
    this.playImpactTone(this.calculatorOpen ? 520 : 340, this.calculatorOpen ? 660 : 240, 0.07, 0.03);

    if (this.calculatorOpen) {
      this.player.setVelocity(0, 0);
      this.physics.world.pause();
      this.calculatorStatusText.setText('Calculator paused the run. Press C or Esc to close.');
      this.refreshCalculatorQuestionData();
      this.refreshCalculatorDisplay();
      return;
    }

    this.physics.world.resume();
  }

  private handleCalculatorInput(value: string): void {
    switch (value) {
      case 'clear':
        this.calculatorExpression = '';
        this.calculatorResult = '0';
        this.calculatorJustEvaluated = false;
        this.calculatorStatusText.setText('Cleared. Build a new expression.');
        this.playImpactTone(240, 180, 0.05, 0.018);
        this.refreshCalculatorDisplay();
        return;
      case 'backspace':
        if (this.calculatorJustEvaluated) {
          this.calculatorExpression = '';
          this.calculatorResult = '0';
          this.calculatorJustEvaluated = false;
        } else {
          this.calculatorExpression = this.calculatorExpression.slice(0, -1);
          this.calculatorStatusText.setText('Backspaced one character.');
        }
        this.playImpactTone(280, 230, 0.04, 0.016);
        this.refreshCalculatorDisplay();
        return;
      case '=':
        this.resolveCalculatorExpression();
        return;
      default:
        this.appendCalculatorToken(value);
        return;
    }
  }

  private appendCalculatorToken(token: string): void {
    if (this.calculatorExpression.length >= 56 && !this.calculatorJustEvaluated) {
      this.calculatorStatusText.setText('Calculator limit reached. Solve or clear first.');
      return;
    }

    if (/^[0-9]$/.test(token)) {
      if (this.calculatorJustEvaluated) {
        this.calculatorExpression = '';
        this.calculatorResult = '0';
        this.calculatorJustEvaluated = false;
      }
      this.calculatorExpression += token;
    } else if (token === '.') {
      if (this.calculatorJustEvaluated) {
        this.calculatorExpression = '';
        this.calculatorResult = '0';
        this.calculatorJustEvaluated = false;
      }

      const currentNumber = this.getCurrentNumberFragment();
      if (currentNumber.includes('.')) {
        return;
      }

      if (this.calculatorExpression === '' || /[+\-*/(]$/.test(this.calculatorExpression)) {
        this.calculatorExpression += '0.';
      } else {
        this.calculatorExpression += '.';
      }
    } else if (['+', '-', '*', '/', '^'].includes(token)) {
      if (this.calculatorExpression === '') {
        if (token === '-') {
          this.calculatorExpression = '-';
        }
        this.refreshCalculatorDisplay();
        return;
      }

      if (/[+\-*/^]$/.test(this.calculatorExpression)) {
        this.calculatorExpression = `${this.calculatorExpression.slice(0, -1)}${token}`;
      } else if (!this.calculatorExpression.endsWith('(')) {
        this.calculatorExpression += token;
      }
      this.calculatorJustEvaluated = false;
    } else if (token === 'sqrt(' || token === 'exp(' || token === 'ans' || token === 'x' || /^v\d+$/.test(token)) {
      if (this.calculatorJustEvaluated && !['ans'].includes(token)) {
        this.calculatorExpression = '';
        this.calculatorResult = '0';
        this.calculatorJustEvaluated = false;
      }

      if (this.calculatorExpression !== '' && /[0-9a-z)]$/i.test(this.calculatorExpression)) {
        this.calculatorExpression += '*';
      }

      this.calculatorExpression += token;
    } else if (token === '(') {
      if (this.calculatorJustEvaluated) {
        this.calculatorExpression = '';
        this.calculatorResult = '0';
        this.calculatorJustEvaluated = false;
      }

      if (this.calculatorExpression === '' || /[+\-*/^(]$/.test(this.calculatorExpression)) {
        this.calculatorExpression += token;
      }
    } else if (token === ')') {
      const openParens = this.getOpenParenthesisCount();
      if (openParens > 0 && this.calculatorExpression !== '' && !/[+\-*/^(]$/.test(this.calculatorExpression)) {
        this.calculatorExpression += token;
      }
    }

    this.calculatorStatusText.setText('Calculator ready. Press = to solve.');
    this.playImpactTone(320, 360, 0.035, 0.015);
    this.refreshCalculatorDisplay();
  }

  private getCurrentNumberFragment(): string {
    let fragment = '';

    for (let index = this.calculatorExpression.length - 1; index >= 0; index -= 1) {
      const character = this.calculatorExpression[index];
      if (!/[0-9.]/.test(character)) {
        break;
      }

      fragment = `${character}${fragment}`;
    }

    return fragment;
  }

  private getOpenParenthesisCount(): number {
    let count = 0;

    for (const character of this.calculatorExpression) {
      if (character === '(') {
        count += 1;
      } else if (character === ')') {
        count -= 1;
      }
    }

    return count;
  }

  private resolveCalculatorExpression(): void {
    if (this.calculatorExpression.trim().length === 0) {
      return;
    }

    try {
      const result = this.evaluateCalculatorExpression(this.calculatorExpression, this.getCalculatorVariableMap());
      this.calculatorResult = this.formatCalculatorNumber(result);
      this.calculatorExpression = this.calculatorResult;
      this.calculatorJustEvaluated = true;
      this.calculatorStatusText.setText('Solved. Keep the result or start typing a new one.');
      this.playImpactTone(520, 760, 0.09, 0.03);
    } catch {
      this.calculatorResult = 'Error';
      this.calculatorJustEvaluated = false;
      this.calculatorStatusText.setText('That expression did not parse. Clear it and try again.');
      this.playImpactTone(180, 120, 0.08, 0.024);
    }

    this.refreshCalculatorDisplay();
  }

  private evaluateCalculatorExpression(expression: string, variables: Record<string, number> = {}): number {
    const tokens = this.tokenizeCalculatorExpression(expression);
    const outputQueue: Array<number | string> = [];
    const operatorStack: string[] = [];
    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
    const rightAssociativeOperators = new Set(['^']);
    const functions = new Set(['sqrt', 'exp', 'abs']);

    for (const token of tokens) {
      if (typeof token === 'number') {
        outputQueue.push(token);
        continue;
      }

      if (/^[a-z][a-z0-9]*$/i.test(token) && !functions.has(token) && !['+', '-', '*', '/', '^', '(', ')', ','].includes(token)) {
        outputQueue.push(token);
        continue;
      }

      if (functions.has(token)) {
        operatorStack.push(token);
        continue;
      }

      if (token === '(') {
        operatorStack.push(token);
        continue;
      }

      if (token === ',') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop()!);
        }
        continue;
      }

      if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop()!);
        }

        if (operatorStack.pop() !== '(') {
          throw new Error('Mismatched parentheses');
        }

        if (operatorStack.length > 0 && functions.has(operatorStack[operatorStack.length - 1])) {
          outputQueue.push(operatorStack.pop()!);
        }
        continue;
      }

      while (
        operatorStack.length > 0 &&
        ['+', '-', '*', '/', '^'].includes(operatorStack[operatorStack.length - 1]) &&
        (
          (!rightAssociativeOperators.has(token) && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) ||
          (rightAssociativeOperators.has(token) && precedence[operatorStack[operatorStack.length - 1]] > precedence[token])
        )
      ) {
        outputQueue.push(operatorStack.pop()!);
      }

      operatorStack.push(token);
    }

    while (operatorStack.length > 0) {
      const operator = operatorStack.pop()!;
      if (operator === '(' || operator === ')') {
        throw new Error('Mismatched parentheses');
      }
      outputQueue.push(operator);
    }

    const valueStack: number[] = [];

    for (const token of outputQueue) {
      if (typeof token === 'number') {
        valueStack.push(token);
        continue;
      }

      if (/^[a-z][a-z0-9]*$/i.test(token) && !['+', '-', '*', '/', '^', 'sqrt', 'exp', 'abs'].includes(token)) {
        const variableValue = variables[token.toLowerCase()];
        if (variableValue === undefined) {
          throw new Error('Unknown variable');
        }
        valueStack.push(variableValue);
        continue;
      }

      if (['sqrt', 'exp', 'abs'].includes(token)) {
        const input = valueStack.pop();
        if (input === undefined) {
          throw new Error('Invalid function input');
        }

        switch (token) {
          case 'sqrt':
            if (input < 0) {
              throw new Error('Invalid sqrt input');
            }
            valueStack.push(Math.sqrt(input));
            break;
          case 'exp':
            valueStack.push(Math.exp(input));
            break;
          case 'abs':
            valueStack.push(Math.abs(input));
            break;
        }
        continue;
      }

      const right = valueStack.pop();
      const left = valueStack.pop();

      if (left === undefined || right === undefined) {
        throw new Error('Invalid expression');
      }

      switch (token) {
        case '+':
          valueStack.push(left + right);
          break;
        case '-':
          valueStack.push(left - right);
          break;
        case '*':
          valueStack.push(left * right);
          break;
        case '/':
          if (right === 0) {
            throw new Error('Division by zero');
          }
          valueStack.push(left / right);
          break;
        case '^':
          valueStack.push(left ** right);
          break;
      }
    }

    if (valueStack.length !== 1 || !Number.isFinite(valueStack[0])) {
      throw new Error('Invalid expression');
    }

    return valueStack[0];
  }

  private tokenizeCalculatorExpression(expression: string): Array<number | string> {
    const tokens: Array<number | string> = [];
    let index = 0;

    while (index < expression.length) {
      const character = expression[index];

      if (character === ' ') {
        index += 1;
        continue;
      }

      const previousToken = tokens[tokens.length - 1];
      const nextCharacter = expression[index + 1] ?? '';
      const isUnaryMinus =
        character === '-' &&
        (tokens.length === 0 || (typeof previousToken === 'string' && previousToken !== ')'));

      if (/[0-9.]/.test(character) || (isUnaryMinus && /[0-9.]/.test(nextCharacter))) {
        let numericText = '';

        if (isUnaryMinus) {
          numericText = '-';
          index += 1;
        }

        while (index < expression.length && /[0-9.]/.test(expression[index])) {
          numericText += expression[index];
          index += 1;
        }

        const numericValue = Number(numericText);
        if (!Number.isFinite(numericValue)) {
          throw new Error('Invalid number');
        }

        tokens.push(numericValue);
        continue;
      }

      if (isUnaryMinus && (nextCharacter === '(' || /[a-z]/i.test(nextCharacter))) {
        tokens.push(0);
        tokens.push('-');
        index += 1;
        continue;
      }

      if (/[a-z]/i.test(character)) {
        let identifier = '';
        while (index < expression.length && /[a-z0-9]/i.test(expression[index])) {
          identifier += expression[index].toLowerCase();
          index += 1;
        }
        tokens.push(identifier);
        continue;
      }

      if (['+', '-', '*', '/', '^', '(', ')', ','].includes(character)) {
        tokens.push(character);
        index += 1;
        continue;
      }

      throw new Error('Unsupported character');
    }

    return tokens;
  }

  private formatCalculatorNumber(value: number): string {
    const rounded = Math.round((value + Number.EPSILON) * 1000000) / 1000000;
    return rounded.toString();
  }

  private getCalculatorVariableMap(xValue?: number): Record<string, number> {
    const variableMap = Object.fromEntries(this.calculatorVariables.map((variable) => [variable.token.toLowerCase(), variable.value]));

    if (typeof xValue === 'number') {
      variableMap.x = xValue;
    }

    const answerValue = Number(this.calculatorResult);
    if (Number.isFinite(answerValue)) {
      variableMap.ans = answerValue;
    }

    return variableMap;
  }

  private refreshCalculatorQuestionData(): void {
    if (!this.currentQuestion) {
      return;
    }

    this.calculatorVariables = this.extractCalculatorVariables(this.currentQuestion);
    this.rebuildCalculatorVariableChips();
  }

  private extractCalculatorVariables(question: MathQuestion): CalculatorVariable[] {
    const sources = [question.prompt, ...(question.supportingData ?? [])];
    const variables: CalculatorVariable[] = [];
    const seenTokens = new Set<string>();
    const addVariable = (token: string, label: string, value: number): void => {
      const normalizedToken = token.toLowerCase();
      if (seenTokens.has(normalizedToken) || !Number.isFinite(value) || variables.length >= 8) {
        return;
      }

      seenTokens.add(normalizedToken);
      variables.push({
        token: normalizedToken,
        label: `${label} = ${this.formatCalculatorNumber(value)}`,
        value,
      });
    };

    const patternDefinitions: Array<{ token: string; label: string; patterns: RegExp[] }> = [
      {
        token: 'mean',
        label: 'mean',
        patterns: [
          /\bmean(?: mark| score| mass| output| volume)?(?:\s+is|\s+of|\s*=|\s*:)?\s*(-?\d+(?:\.\d+)?)/i,
          /distribution with mean\s*(-?\d+(?:\.\d+)?)/i,
        ],
      },
      {
        token: 'sd',
        label: 'sd',
        patterns: [
          /standard deviation(?:\s+is|\s+of|\s*=|\s*:)?\s*(-?\d+(?:\.\d+)?)/i,
          /\bSD(?:\s+is|\s+of|\s*=|\s*:)?\s*(-?\d+(?:\.\d+)?)/i,
        ],
      },
      {
        token: 'z',
        label: 'z',
        patterns: [
          /z-score(?:\s+of|\s*=|\s+is)?\s*(-?\d+(?:\.\d+)?)/i,
          /\bz\s*=\s*(-?\d+(?:\.\d+)?)/i,
        ],
      },
      {
        token: 'q1',
        label: 'Q1',
        patterns: [/\bQ1\s*=\s*(-?\d+(?:\.\d+)?)/i],
      },
      {
        token: 'q3',
        label: 'Q3',
        patterns: [/\bQ3\s*=\s*(-?\d+(?:\.\d+)?)/i],
      },
      {
        token: 'xval',
        label: 'x',
        patterns: [
          /\bx(?:-value)?\s*=\s*(-?\d+(?:\.\d+)?)/i,
          /score of\s*(-?\d+(?:\.\d+)?)/i,
          /x\s*=\s*(-?\d+(?:\.\d+)?)/i,
        ],
      },
      {
        token: 'n',
        label: 'n',
        patterns: [/\bn\s*=\s*(-?\d+(?:\.\d+)?)/i],
      },
      {
        token: 'p',
        label: 'p',
        patterns: [/\bp\s*=\s*(-?\d+(?:\.\d+)?)/i],
      },
    ];

    patternDefinitions.forEach((definition) => {
      for (const source of sources) {
        for (const pattern of definition.patterns) {
          const match = source.match(pattern);
          if (!match) {
            continue;
          }

          addVariable(definition.token, definition.label, Number(match[1]));
          break;
        }
      }
    });

    sources.forEach((source) => {
      const trimmedSource = source.trim();
      const xLineMatch = trimmedSource.match(/^(x|value)\s*:\s*(.+)$/i);
      if (xLineMatch) {
        const matches = xLineMatch[2].match(/-?\d+(?:\.\d+)?/g) ?? [];
        matches.forEach((match, index) => {
          addVariable(`x${index + 1}`, `x${index + 1}`, Number(match));
        });
      }

      const frequencyLineMatch = trimmedSource.match(/^(f|freq|frequency)\s*:\s*(.+)$/i);
      if (frequencyLineMatch) {
        const matches = frequencyLineMatch[2].match(/-?\d+(?:\.\d+)?/g) ?? [];
        matches.forEach((match, index) => {
          addVariable(`f${index + 1}`, `f${index + 1}`, Number(match));
        });
      }
    });

    sources.forEach((source) => {
      const matches = source.match(/-?\d+(?:\.\d+)?/g) ?? [];
      matches.forEach((match) => {
        if (variables.length >= 8) {
          return;
        }

        const numericValue = Number(match);
        if (!Number.isFinite(numericValue)) {
          return;
        }

        addVariable(`v${variables.length + 1}`, `value ${variables.length + 1}`, numericValue);
      });
    });

    return variables;
  }

  private rebuildCalculatorVariableChips(): void {
    this.calculatorVariableChipContainer.removeAll(true);

    if (this.calculatorVariables.length === 0) {
      const empty = this.add.text(0, 0, 'No numeric values detected in this question. Use x to graph or type values manually.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '13px',
        color: '#b8d8f2',
        wordWrap: { width: 388 },
      }).setOrigin(0, 0);
      this.calculatorVariableChipContainer.add(empty);
      return;
    }

    this.calculatorVariables.forEach((variable, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const chipX = column * 194;
      const chipY = row * 32;
      const chipBackground = this.add.rectangle(90, 12, 180, 24, 0x214261, 0.98).setStrokeStyle(1, 0x9fd3ff, 0.2);
      const chipLabel = this.add.text(90, 12, variable.label, {
        fontFamily: 'Consolas',
        fontSize: '12px',
        color: '#f4f7fb',
      }).setOrigin(0.5);
      const chip = this.add.container(chipX, chipY, [chipBackground, chipLabel]);
      chip.setSize(180, 24);
      chip.setInteractive({ useHandCursor: true });
      chip.on('pointerdown', () => {
        this.handleCalculatorInput(variable.token);
      });
      chip.on('pointerover', () => {
        chipBackground.setFillStyle(0x2b5b86, 1);
      });
      chip.on('pointerout', () => {
        chipBackground.setFillStyle(0x214261, 0.98);
      });
      this.calculatorVariableChipContainer.add(chip);
    });
  }

  private handleGraphSelection(worldX: number, worldY: number): void {
    if (!this.calculatorOpen) {
      return;
    }

    if (!/[a-z]x[a-z]?|\bx\b/i.test(this.calculatorExpression)) {
      this.calculatorGraphInfoText.setText('Add x to the expression before selecting a graph point. Example: x^2 + v1.');
      return;
    }

    const localX = worldX - this.calculatorContainer.x + 404;
    const localY = worldY - this.calculatorContainer.y + 60;

    if (localX < 0 || localX > 410 || localY < 0 || localY > 244) {
      return;
    }

    const graphX = this.mapGraphPixelToDomain(localX, -10, 10, 410);

    try {
      const graphY = this.evaluateCalculatorExpression(this.calculatorExpression, this.getCalculatorVariableMap(graphX));
      if (!Number.isFinite(graphY)) {
        throw new Error('Not finite');
      }

      this.calculatorGraphInfoText.setText(`Selected point: x = ${this.formatCalculatorNumber(graphX)}, y = ${this.formatCalculatorNumber(graphY)}`);
      this.redrawCalculatorGraph(graphX);
    } catch {
      this.calculatorGraphInfoText.setText('That point could not be evaluated with the current expression.');
    }
  }

  private refreshCalculatorDisplay(): void {
    this.calculatorExpressionText.setText(this.calculatorExpression.length > 0 ? this.calculatorExpression : '0');
    this.calculatorResultText.setText(this.calculatorResult);
    this.redrawCalculatorGraph();
  }

  private redrawCalculatorGraph(selectedX?: number): void {
    const graphWidth = 410;
    const graphHeight = 244;
    const domainMin = -10;
    const domainMax = 10;
    const rangeMin = -10;
    const rangeMax = 10;

    this.calculatorGraphGraphics.clear();
    this.calculatorGraphGraphics.lineStyle(1, 0x24435f, 0.55);

    for (let step = 0; step <= 10; step += 1) {
      const x = (step / 10) * graphWidth;
      const y = (step / 10) * graphHeight;
      this.calculatorGraphGraphics.lineBetween(x, 0, x, graphHeight);
      this.calculatorGraphGraphics.lineBetween(0, y, graphWidth, y);
    }

    const axisX = this.mapGraphDomainToPixel(0, domainMin, domainMax, graphWidth);
    const axisY = this.mapGraphRangeToPixel(0, rangeMin, rangeMax, graphHeight);
    this.calculatorGraphGraphics.lineStyle(2, 0x9fd3ff, 0.8);
    this.calculatorGraphGraphics.lineBetween(axisX, 0, axisX, graphHeight);
    this.calculatorGraphGraphics.lineBetween(0, axisY, graphWidth, axisY);

    if (!/\bx\b/i.test(this.calculatorExpression) && !this.calculatorExpression.includes('x')) {
      this.calculatorGraphHintText.setText('Graphing works when the expression uses x. Example: x^2, sqrt(x+4), exp(x/3).');
      return;
    }

    this.calculatorGraphHintText.setText('Click inside the graph to inspect a point for the current expression.');

    const samples: Array<{ x: number; y: number }> = [];
    for (let index = 0; index <= 180; index += 1) {
      const sampleX = domainMin + (index / 180) * (domainMax - domainMin);
      try {
        const sampleY = this.evaluateCalculatorExpression(this.calculatorExpression, this.getCalculatorVariableMap(sampleX));
        if (Number.isFinite(sampleY)) {
          samples.push({ x: sampleX, y: sampleY });
        } else {
          samples.push({ x: sampleX, y: Number.NaN });
        }
      } catch {
        samples.push({ x: sampleX, y: Number.NaN });
      }
    }

    this.calculatorGraphGraphics.lineStyle(3, 0xffe082, 0.95);
    let drawingSegment = false;

    for (const sample of samples) {
      if (!Number.isFinite(sample.y) || sample.y < rangeMin * 8 || sample.y > rangeMax * 8) {
        drawingSegment = false;
        continue;
      }

      const pixelX = this.mapGraphDomainToPixel(sample.x, domainMin, domainMax, graphWidth);
      const pixelY = this.mapGraphRangeToPixel(Phaser.Math.Clamp(sample.y, rangeMin, rangeMax), rangeMin, rangeMax, graphHeight);

      if (!drawingSegment) {
        this.calculatorGraphGraphics.beginPath();
        this.calculatorGraphGraphics.moveTo(pixelX, pixelY);
        drawingSegment = true;
      } else {
        this.calculatorGraphGraphics.lineTo(pixelX, pixelY);
      }
    }
    this.calculatorGraphGraphics.strokePath();

    if (typeof selectedX === 'number') {
      try {
        const selectedY = this.evaluateCalculatorExpression(this.calculatorExpression, this.getCalculatorVariableMap(selectedX));
        if (Number.isFinite(selectedY)) {
          const markerX = this.mapGraphDomainToPixel(selectedX, domainMin, domainMax, graphWidth);
          const markerY = this.mapGraphRangeToPixel(Phaser.Math.Clamp(selectedY, rangeMin, rangeMax), rangeMin, rangeMax, graphHeight);
          this.calculatorGraphGraphics.fillStyle(0x7dd3fc, 1);
          this.calculatorGraphGraphics.fillCircle(markerX, markerY, 5);
        }
      } catch {
      }
    }
  }

  private mapGraphDomainToPixel(value: number, domainMin: number, domainMax: number, width: number): number {
    return ((value - domainMin) / (domainMax - domainMin)) * width;
  }

  private mapGraphRangeToPixel(value: number, rangeMin: number, rangeMax: number, height: number): number {
    return height - ((value - rangeMin) / (rangeMax - rangeMin)) * height;
  }

  private mapGraphPixelToDomain(pixel: number, domainMin: number, domainMax: number, width: number): number {
    return domainMin + (pixel / width) * (domainMax - domainMin);
  }

  private createPlayer(): void {
    this.player = this.physics.add.image(
      this.gameMode === 'quest' ? this.getQuestStartX() : this.scale.width / 2,
      this.getPlayerStartY(),
      this.gameMode === 'quest' ? this.getQuestPartyTextureKey() : 'player',
    );
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.002);
    this.player.setMaxVelocity(260, 260);
    this.player.setDepth(5);
    this.refreshQuestPlayerPresentation();
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: false });
    this.shots = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: false });

    if (this.gameMode === 'quest') {
      return;
    }

    const lanes = this.getLaneYs();
    lanes.forEach((laneY, laneIndex) => {
      const direction = laneIndex % 2 === 0 ? 1 : -1;
      for (let count = 0; count < 4; count += 1) {
        const x = 150 + count * ((this.scale.width - 300) / 3);
        const archetype = this.pickObstacleArchetype();
        const enemy = this.physics.add.image(x, laneY, archetype.textureKey) as EnemySprite;
        enemy.laneY = laneY;
        enemy.laneIndex = laneIndex;
        enemy.direction = direction as 1 | -1;
        enemy.speedFactor = 1;
        enemy.penaltyUntil = 0;
        enemy.driftSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
        enemy.archetypeName = archetype.label;
        enemy.accentColor = archetype.accentColor;
        enemy.baseScale = archetype.scale;
        enemy.roamTurnAt = 0;
        enemy.setScale(archetype.scale);
        enemy.setDepth(4);
        enemy.setVelocityX(this.getLaneSpeed(laneIndex) * enemy.speedFactor * direction);
        this.enemies.add(enemy);
      }
    });
  }

  private pickObstacleArchetype(): ObstacleArchetype {
    return Phaser.Utils.Array.GetRandom(OBSTACLE_ARCHETYPES);
  }

  private createAnswerGates(): void {
    if (this.gameMode === 'quest') {
      return;
    }

    const answerY = this.getAnswerGateY();
    const answerX = this.getAnswerGateXs();

    this.gates = answerX.map((x, index) => {
      const gate = this.physics.add.staticImage(x, answerY, 'answer-gate') as unknown as AnswerGate;
      gate.answerIndex = index;
      gate.setInteractive({ useHandCursor: true });
      gate.on('pointerdown', () => {
        this.handleAnswer(index);
      });
      gate.answerLabel = this.add.text(x, answerY, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#f4f7fb',
        align: 'center',
        wordWrap: { width: 220 },
      }).setOrigin(0.5);
      gate.answerLabel.setInteractive({ useHandCursor: true });
      gate.answerLabel.on('pointerdown', () => {
        this.handleAnswer(index);
      });
      return gate;
    });
  }

  private createCollisions(): void {
    if (this.gameMode === 'quest' && this.questWalls) {
      this.physics.add.collider(this.player, this.questWalls);
      this.physics.add.collider(this.shots, this.questWalls, (shot) => {
        (shot as Phaser.Physics.Arcade.Image).destroy();
      });
    }

    if (this.gameMode === 'quest' && this.questGates) {
      this.physics.add.collider(this.player, this.questGates, (_player, gate) => this.handleQuestGateContact(gate as QuestGate), undefined, this);
      this.physics.add.collider(this.shots, this.questGates, (shot) => {
        (shot as Phaser.Physics.Arcade.Image).destroy();
      });
    }

    if (this.gameMode === 'quest' && this.questTravelMarkers) {
      this.physics.add.overlap(this.player, this.questTravelMarkers, (_player, marker) => this.handleQuestTravelMarkerContact(marker as QuestTravelMarker), undefined, this);
    }

    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => this.handlePlayerHit(enemy as EnemySprite), undefined, this);
    this.physics.add.overlap(this.shots, this.enemies, (shot, enemy) => this.handleShotHit(shot as Phaser.Physics.Arcade.Image, enemy as EnemySprite), undefined, this);

    if (this.gameMode === 'quest' && this.questTrials) {
      this.physics.add.overlap(this.player, this.questTrials, (_player, trial) => this.handleQuestTrialContact(trial as QuestTrial), undefined, this);
    }

    if (this.gameMode === 'quest' && this.hiddenMonsters) {
      this.physics.add.overlap(this.player, this.hiddenMonsters, (_player, monster) => this.handleHiddenMonsterContact(monster as HiddenMonster), undefined, this);
      this.physics.add.overlap(this.shots, this.hiddenMonsters, (shot, monster) => this.handleQuestShotMonsterHit(shot as Phaser.Physics.Arcade.Image, monster as HiddenMonster), undefined, this);
    }

    if (this.gameMode === 'quest' && this.treasureChests) {
      this.physics.add.overlap(this.player, this.treasureChests, (_player, chest) => this.handleTreasureChestContact(chest as TreasureChest), undefined, this);
    }

    if (this.gameMode === 'quest' && this.questBoss) {
      this.physics.add.overlap(this.player, this.questBoss, (_player, boss) => this.handleQuestBossContact(boss as QuestBoss), undefined, this);
      this.physics.add.overlap(this.shots, this.questBoss, (shot, boss) => this.handleQuestBossShot(shot as Phaser.Physics.Arcade.Image, boss as QuestBoss), undefined, this);
    }

    if (this.gameMode === 'quest' && this.questBossHazards) {
      this.physics.add.overlap(this.player, this.questBossHazards, (_player, hazard) => this.handleQuestBossHazardHit(hazard as QuestBossHazard), undefined, this);
      this.physics.add.overlap(this.shots, this.questBossHazards, (shot, hazard) => {
        (shot as Phaser.Physics.Arcade.Image).disableBody(true, true);
        this.destroyQuestBossHazard(hazard as QuestBossHazard, true);
      }, undefined, this);
    }

    if (this.gameMode === 'quest' && this.questBossPillars.length > 0) {
      this.questBossPillars.forEach((pillar) => {
        this.physics.add.overlap(this.player, pillar, () => this.handleQuestBossPillarHit(pillar), undefined, this);
        this.physics.add.overlap(this.shots, pillar, (shot) => {
          if (!this.isQuestBossPillarActive()) {
            return;
          }

          (shot as Phaser.Physics.Arcade.Image).disableBody(true, true);
          this.spawnImpactBurst(pillar.x, pillar.y, 0xffcf7a, false);
          this.setExplanationMessage('The altar wards turn arrows aside. Keep moving and solve the final trial instead.', 'Ward blocks arrows.');
        }, undefined, this);
      });
    }

    for (const gate of this.gates) {
      this.physics.add.overlap(this.player, gate, () => this.handleAnswer(gate.answerIndex), undefined, this);
    }
  }

  private nextQuestion(): void {
    if (this.gameMode === 'quest' && this.currentQuestionSource === 'boss' && this.questBoss && !this.questBoss.defeated) {
      this.assignQuestBossQuestion();
      return;
    }

    try {
      this.currentQuestion = this.questionDeck.nextQuestion();
    } catch {
      this.endRun('No Questions Left', 'All available questions are flagged. Press E to export the CSV log.');
      return;
    }

    void this.track(recordQuestionUsed(this.currentQuestion), 'Tracker could not record question usage.');
    this.currentQuestionSource = 'standard';
    this.activeTreasureChest = undefined;
    this.setFocusedQuestGate(undefined);
    this.refreshPromptLayout(this.currentQuestion.prompt);
    this.refreshSupportingDataLayout(this.currentQuestion);
    this.refreshCalculatorQuestionData();
    this.categoryText.setText(this.getQuestionHeaderText(this.currentQuestion));
    this.setExplanationMessage('');
    this.updateProgressText();
    this.blurQuestAnswerInput(true);

    if (this.gameMode === 'quest') {
      this.refreshQuestChoices();
      this.refreshQuestTrials();
    } else {
      for (const gate of this.gates) {
        gate.answerLabel.setText(this.currentQuestion.options[gate.answerIndex]);
        gate.clearTint();
        gate.answerLabel.setColor('#f4f7fb');
      }
    }

    this.acceptingAnswer = true;
  }

  private refreshQuestChoices(selectedAnswerIndex?: number, isCorrect?: boolean): void {
    if (this.questChoiceTexts.length === 0) {
      return;
    }

    const baseBackground = this.isQuestDungeonMode() ? 'rgba(11, 24, 38, 0.18)' : '#13243a';

    this.questChoiceTexts.forEach((choiceText, index) => {
      const optionText = this.currentQuestion?.options[index] ?? '';
      choiceText.setText(`${index + 1}. ${optionText}`);
      choiceText.setColor('#f4f7fb');
      choiceText.setBackgroundColor(baseBackground);

      if (isCorrect === undefined) {
        return;
      }

      if (index === this.currentQuestion.answerIndex) {
        choiceText.setColor('#08111f');
        choiceText.setBackgroundColor('#7ee2a8');
        return;
      }

      if (!isCorrect && selectedAnswerIndex !== undefined && index === selectedAnswerIndex) {
        choiceText.setColor('#08111f');
        choiceText.setBackgroundColor('#ff8c99');
      }
    });
  }

  private refreshPromptLayout(prompt: string): void {
    let fontSize = 24;
    let wrapWidth = 700;
    let lineSpacing = 4;

    if (prompt.length > 240) {
      fontSize = 16;
      wrapWidth = 720;
      lineSpacing = 2;
    } else if (prompt.length > 180) {
      fontSize = 18;
      wrapWidth = 715;
      lineSpacing = 3;
    } else if (prompt.length > 130) {
      fontSize = 20;
      wrapWidth = 710;
      lineSpacing = 3;
    }

    this.promptText.setFontSize(fontSize);
    this.promptText.setWordWrapWidth(wrapWidth, true);
    this.promptText.setLineSpacing(lineSpacing);
    this.promptText.setText(prompt);
  }

  private refreshSupportingDataLayout(question: MathQuestion): void {
    if (!question.supportingData || question.supportingData.length === 0) {
      this.supportingDataText.setText('');
      return;
    }

    this.supportingDataText.setText(question.supportingData.join('\n'));
  }

  private buildAnswerReviewText(isCorrect: boolean): string {
    const correctAnswer = this.currentQuestion.options[this.currentQuestion.answerIndex];
    const activeBossTitle = this.questBoss?.title ?? this.getQuestEncounter().foeName;

    if (this.gameMode === 'quest') {
      if (this.isQuestDungeonMode()) {
        if (this.currentQuestionSource === 'boss') {
          return isCorrect
            ? `Correct. ${activeBossTitle} falters.`
            : `Wrong. ${activeBossTitle} hits ${this.getQuestDamageTaken()}.`;
        }

        if (this.currentQuestionSource === 'treasure') {
          return isCorrect ? 'Correct. Cache opens.' : `Wrong. Hit ${this.getQuestDamageTaken()}.`;
        }

        return isCorrect
          ? 'Correct. Ward broken.'
          : `Wrong. Hit ${this.getQuestDamageTaken()}.`;
      }

      if (this.currentQuestionSource === 'boss') {
        if (isCorrect) {
          return this.questBoss?.chapter === 4
            ? `Correct. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} The Cloudy Dragon falters and the crown chamber opens.`
            : `Correct. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} ${activeBossTitle} falters and the chapter cache opens.`;
        }

        const damage = this.getQuestDamageTaken();
        return this.questBoss?.chapter === 4
          ? `Incorrect. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} The Cloudy Dragon scorches the chamber for ${damage} damage.`
          : `Incorrect. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} ${activeBossTitle} crashes into the party for ${damage} damage.`;
      }

      if (isCorrect && this.currentQuestionSource === 'treasure') {
        const reward = this.getQuestRewardProfile();
        const relic = this.getQuestRelicForChest(this.activeTreasureChest);
        return relic
          ? `Correct. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} The cache ward falls and reveals the ${relic.title}.`
          : `Correct. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} The chest ward falls and restores ${reward.hpGain} HP before the relic upgrade takes effect.`;
      }

      if (isCorrect) {
        const reward = this.getQuestRewardProfile();
        return `Correct. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} The seal weakens, the party gains ${reward.hpGain} HP, and the quiver gains ${reward.runeGain} arrow${reward.runeGain === 1 ? '' : 's'}.`;
      }

      const damage = this.getQuestDamageTaken();
      return `Incorrect. Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation} ${this.getQuestEncounter().foeName} lands ${damage} damage.`;
    }

    const statusText = isCorrect ? 'Correct.' : 'Incorrect.';
    const penaltyText = isCorrect ? ' Armory +1.' : ' You lose one life for a wrong answer.';
    return `${statusText} Correct answer: ${correctAnswer}. ${this.currentQuestion.explanation}${penaltyText}`;
  }

  private highlightAnswerResult(selectedAnswerIndex: number | undefined, isCorrect: boolean): void {
    if (this.gameMode === 'quest') {
      this.refreshQuestChoices(selectedAnswerIndex, isCorrect);
      return;
    }

    const correctAnswerIndex = this.currentQuestion.answerIndex;

    this.gates[correctAnswerIndex].setTint(0x48d597);
    this.gates[correctAnswerIndex].answerLabel.setColor('#08111f');

    if (selectedAnswerIndex !== undefined && !isCorrect && selectedAnswerIndex !== correctAnswerIndex) {
      this.gates[selectedAnswerIndex].setTint(0xff6677);
      this.gates[selectedAnswerIndex].answerLabel.setColor('#08111f');
    }
  }

  private pickQuestionFromPool(pool: MathQuestion[]): MathQuestion | undefined {
    if (pool.length === 0) {
      return undefined;
    }

    const alternatePool = pool.filter((question) => question !== this.currentQuestion);
    return Phaser.Utils.Array.GetRandom(alternatePool.length > 0 ? alternatePool : pool);
  }

  private assignQuestBossQuestion(): void {
    if (!this.questBoss || this.questBoss.defeated) {
      return;
    }

    const bossCandidates = this.questionBankSnapshot.filter((question) => question.difficulty === 4);
    const nextBossQuestion = this.pickQuestionFromPool(bossCandidates.length > 0 ? bossCandidates : this.questionBankSnapshot);
    if (!nextBossQuestion) {
      return;
    }

    this.currentQuestion = nextBossQuestion;
    this.currentQuestionSource = 'boss';
    void this.track(recordQuestionUsed(this.currentQuestion), 'Tracker could not record question usage.');
    this.refreshPromptLayout(`Final trial: ${this.currentQuestion.prompt}`);
    this.refreshSupportingDataLayout(this.currentQuestion);
    this.refreshCalculatorQuestionData();
    this.categoryText.setText(this.getQuestionHeaderText(this.currentQuestion));
    this.setExplanationMessage(
      this.questBoss.chapter === 4
        ? 'The Cloudy Dragon circles the altar. Touch the dragon to engage the final trial before the ward pillars lock into motion.'
        : `${this.questBoss.title} stalks the chamber. Touch the boss to engage the trial.`,
      this.questBoss.chapter === 4 ? 'Dragon waits. Touch it.' : `${this.questBoss.title} waits. Touch it.`,
    );
    this.refreshQuestChoices();
    this.acceptingAnswer = true;
  }

  private rerollQuestQuestionAfterPenalty(): void {
    if (this.currentQuestionSource === 'boss' && this.questBoss && !this.questBoss.defeated) {
      this.assignQuestBossQuestion();
      return;
    }

    if (this.currentQuestionSource === 'treasure' && this.activeTreasureChest) {
      const wordProblems = this.questionBankSnapshot.filter((question) => question.category === 'word-problem');
      const treasureQuestion = this.pickQuestionFromPool(wordProblems);
      if (!treasureQuestion) {
        this.nextQuestion();
        return;
      }

      this.currentQuestion = treasureQuestion;
      this.currentQuestionSource = 'treasure';
      void this.track(recordQuestionUsed(this.currentQuestion), 'Tracker could not record question usage.');
      this.refreshPromptLayout(`Treasure chest challenge: ${treasureQuestion.prompt}`);
      this.refreshSupportingDataLayout(treasureQuestion);
      this.refreshCalculatorQuestionData();
      this.categoryText.setText(this.getQuestionHeaderText(treasureQuestion));
      this.refreshQuestChoices();
      this.acceptingAnswer = true;
      return;
    }

    this.nextQuestion();
  }

  private handleAnswer(answerIndex: number): void {
    this.submitAnswerResult(answerIndex, answerIndex === this.currentQuestion.answerIndex);
  }

  private submitAnswerResult(selectedAnswerIndex: number | undefined, isCorrect: boolean): void {
    const requiresGateProximity = this.gameMode !== 'quest';

    if (!this.acceptingAnswer || this.gameOver || this.recovering || this.invulnerable || (requiresGateProximity && this.player.y > this.getAnswerGateY() + 40)) {
      return;
    }

    if (this.gameMode === 'quest' && this.currentQuestionSource === 'standard' && !this.activeQuestTrial) {
      this.setExplanationMessage('Find and touch the glowing seal before answering the current question.', 'Find seal first.');
      return;
    }

    if (this.gameMode === 'quest' && this.currentQuestionSource === 'standard' && this.usesManualQuestGateMarking() && !this.focusedQuestGate) {
      this.setExplanationMessage('Touch the door you want to open, then solve the lit seal.', 'Mark gate first.');
      return;
    }

    if (this.gameMode === 'quest' && this.currentQuestionSource === 'boss' && this.questBoss && !this.questBoss.defeated && !this.questBoss.engaged) {
      this.setExplanationMessage(
        this.questBoss.chapter === 4
          ? 'The final trial only starts when you confront the Cloudy Dragon at the altar.'
          : `The boss trial only starts when you confront ${this.questBoss.title} in the chamber.`,
        this.questBoss.chapter === 4 ? 'Touch dragon first.' : `Touch ${this.questBoss.title}.`,
      );
      return;
    }

    this.acceptingAnswer = false;
    this.blurQuestAnswerInput(true);
    void this.track(recordQuestionAnswered(this.currentQuestion, isCorrect), 'Tracker could not record answer results.');

    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += 100 + (this.level - 1) * 50;
      if (this.gameMode === 'quest') {
        const reward = this.getQuestRewardProfile();
        this.armoryShots += reward.runeGain;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + reward.hpGain);
        this.refreshVitalHud();
      } else {
        this.armoryShots += 1;
      }
      this.refreshScoreHud();
      this.refreshArmoryHud();
      this.refreshQuestJournal();
      this.highlightAnswerResult(selectedAnswerIndex, true);

      let encounterText = '';
      if (this.gameMode === 'quest') {
        if (this.currentQuestionSource === 'treasure' && this.activeTreasureChest) {
          encounterText = ` ${this.resolveTreasureChestReward(this.activeTreasureChest)}`;
        } else if (this.activeQuestTrial && !this.activeQuestTrial.solved) {
          encounterText = ` ${this.resolveQuestTrial(this.activeQuestTrial)}`;
        }
      }

      const leveledUp = this.maybeAdvanceDifficulty();
      const levelMessage = leveledUp
        ? ` ${this.getLevelAdvanceMessage()}`
        : this.gameMode === 'quest'
          ? ` ${this.getQuestEncounter().foeName} loses ground as another seal breaks open.`
          : '';
      this.setExplanationMessage(`${this.buildAnswerReviewText(true)}${encounterText}${levelMessage}`);

      if (this.gameMode === 'quest' && this.currentQuestionSource === 'boss') {
        this.resolveQuestBoss();
        return;
      }

      if (
        this.gameMode === 'quest'
        && this.questViewMode === 'dungeon'
        && this.questBoss
        && !this.questBoss.defeated
        && !this.hasRemainingQuestTrials(this.activeQuestTravelChapter)
      ) {
        this.armFinalBossTrial();
        this.time.delayedCall(GameScene.CORRECT_REVIEW_DELAY_MS, () => {
          this.resumeQuestAfterDamage();
        });
        return;
      }

      this.time.delayedCall(GameScene.CORRECT_REVIEW_DELAY_MS, () => {
        this.nextQuestion();
        if (this.gameMode === 'quest') {
          this.resumeQuestAfterDamage();
          return;
        }

        this.resetPlayer();
      });
      return;
    }

    this.highlightAnswerResult(selectedAnswerIndex, false);
    this.setExplanationMessage(this.buildAnswerReviewText(false));
    this.loseLife();
  }

  private handleFlagCurrentQuestion(): void {
    if (this.gameOver || this.recovering || !this.acceptingAnswer || !this.currentQuestion) {
      return;
    }

    this.acceptingAnswer = false;
    void this.trackFlagQuestion();
  }

  private handleExportCsv(): void {
    downloadQuestionStatsCsv();
    this.explanationText.setText('CSV exported. The file includes each question, usage count, correct count, incorrect count, and flagged status.');
  }

  private handlePlayerHit(enemy: EnemySprite): void {
    if (this.gameOver || this.recovering || this.invulnerable) {
      return;
    }

    if (this.time.now < enemy.penaltyUntil) {
      return;
    }

    enemy.penaltyUntil = this.time.now + 800;
    enemy.speedFactor = Math.max(0.45, enemy.speedFactor - 0.12);
    enemy.setVelocityX(this.getLaneSpeed(enemy.laneIndex) * enemy.speedFactor * enemy.direction);

    this.flashEnemy(enemy, enemy.accentColor);
    this.spawnImpactBurst(enemy.x, enemy.y, enemy.accentColor, false);
    this.spawnImpactBurst(this.player.x, this.player.y, 0xfff2a8, false);
    this.showFloatingLabel(enemy.x, enemy.y - 30, enemy.archetypeName, enemy.accentColor);
    this.playImpactTone(180, 110, 0.14, 0.045);
    this.cameras.main.shake(130, 0.004);
    if (this.gameMode === 'quest') {
      this.setExplanationMessage(`${enemy.archetypeName} triggered a dungeon hazard. Hold your ground and push deeper into the maze.`, `${enemy.archetypeName} hit.`);
      this.resumeQuestAfterDamage();
      return;
    }

    this.explanationText.setText(`${enemy.archetypeName} clipped you. No life lost, but it blinked, slowed down, and kicked you back to the start.`);
    this.resetAfterTrafficHit();
  }

  private handleShotHit(shot: Phaser.Physics.Arcade.Image, enemy: EnemySprite): void {
    const { x, y, archetypeName, accentColor } = enemy;
    shot.disableBody(true, true);
    enemy.disableBody(true, true);
    this.spawnImpactBurst(x, y, accentColor, true);
    this.showFloatingLabel(x, y - 24, `${archetypeName} cleared`, 0xffe082);
    this.playImpactTone(360, 90, 0.18, 0.05);
    this.cameras.main.shake(90, 0.003);
  }

  private spawnQuestShot(offsetX: number, velocityX: number, scale: number, tint: number, damage: number): void {
    const shot = this.physics.add.image(this.player.x + offsetX, this.player.y - 28, 'shot') as QuestShot;
    shot.damage = damage;
    shot.setVelocity(velocityX, -460 - this.questWeaponTier * 25);
    shot.setCollideWorldBounds(false);
    shot.setDepth(5);
    shot.setScale(scale);
    shot.setTint(tint);
    this.shots.add(shot);
  }

  private spawnShot(): void {
    if (this.gameMode === 'quest') {
      const damage = this.getQuestWeaponDamage();
      if (this.questWeaponTier >= 2) {
        this.spawnQuestShot(0, 0, 1.16, 0xffcf7a, damage);
        this.spawnQuestShot(-10, -90, 0.96, 0x9dd8ff, damage);
        this.spawnQuestShot(10, 90, 0.96, 0x9dd8ff, damage);
      } else if (this.questWeaponTier === 1) {
        this.spawnQuestShot(0, 0, 1.08, 0xffcf7a, damage);
      } else {
        this.spawnQuestShot(0, 0, 0.9, 0xf8e6ab, damage);
      }
      this.playImpactTone(460, 620, 0.05, 0.018);
      return;
    }

    const shot = this.physics.add.image(this.player.x, this.player.y - 28, 'shot');
    shot.setVelocityY(-460);
    shot.setCollideWorldBounds(false);
    shot.setDepth(5);
    this.shots.add(shot);
    this.playImpactTone(460, 620, 0.05, 0.018);
  }

  private tryFireShot(time: number): void {
    if (this.armoryShots <= 0) {
      this.setExplanationMessage(this.gameMode === 'quest'
        ? 'Quiver empty. Break a seal or solve a treasure trial to earn more arrows.'
        : 'Armory empty. Get a question right to earn one shot.');
      return;
    }

    this.armoryShots -= 1;
    this.refreshArmoryHud();
    this.spawnShot();
    this.lastShotAt = time;
  }

  private getQuestMonsterMaxHp(chapter: 1 | 2 | 3 | 4): number {
    const baseHp = chapter >= 4 ? 3 : chapter >= 2 ? 2 : 1;
    return Math.max(1, Math.round(baseHp * this.questAdminSettings.globalDifficulty * this.questAdminSettings.monsterHpMultiplier));
  }

  private getQuestMonsterMoveStyle(hiddenName: string): QuestMonsterMoveStyle {
    switch (hiddenName) {
      case 'Bat':
      case 'Wing Guard':
        return 'swoop';
      case 'Wraith':
        return 'drift';
      case 'Drake':
        return 'lunge';
      case 'Spider':
      case 'Crawler':
      default:
        return 'skitter';
    }
  }

  private getQuestWeaponDamage(): number {
    return 1 + this.questWeaponTier;
  }

  private getQuestMonsterContactDamage(monster: HiddenMonster): number {
    const scaledBaseDamage = Math.max(1, Math.round((monster.chapter + 1) * this.questAdminSettings.globalDifficulty));
    return Math.max(1, scaledBaseDamage + monster.contactDamage + this.questAdminSettings.monsterDamageBonus - this.questArmorTier);
  }

  private getQuestMonsterSpeedMultiplier(monster: HiddenMonster): number {
    const speedMultiplier = this.questAdminSettings.globalDifficulty * this.questAdminSettings.monsterSpeedMultiplier;
    switch (monster.moveStyle) {
      case 'hunter':
        return 1.52 * speedMultiplier;
      case 'swoop':
        return 1.34 * speedMultiplier;
      case 'drift':
        return 0.64 * speedMultiplier;
      case 'lunge':
        return 1.18 * speedMultiplier;
      case 'skitter':
      default:
        return 0.98 * speedMultiplier;
    }
  }

  private getQuestMonsterTurnDelay(monster: HiddenMonster, initialTurn: boolean): number {
    switch (monster.moveStyle) {
      case 'hunter':
        return this.time.now + Phaser.Math.Between(initialTurn ? 170 : 220, initialTurn ? 320 : 420);
      case 'swoop':
        return this.time.now + Phaser.Math.Between(initialTurn ? 340 : 440, initialTurn ? 700 : 980);
      case 'lunge':
        return this.time.now + Phaser.Math.Between(initialTurn ? 420 : 520, initialTurn ? 780 : 1040);
      case 'drift':
        return this.time.now + Phaser.Math.Between(initialTurn ? 900 : 1200, initialTurn ? 1520 : 2100);
      case 'skitter':
      default:
        return this.time.now + Phaser.Math.Between(initialTurn ? 240 : 300, initialTurn ? 560 : 760);
    }
  }

  private getQuestSkitterAngle(monster: HiddenMonster): number {
    const centerX = monster.roamBounds.centerX;
    const centerY = monster.roamBounds.centerY;
    const dx = monster.x - centerX;
    const dy = monster.y - centerY;
    const horizontalBias = Math.abs(dx) < Math.abs(dy);
    if (horizontalBias) {
      return dx >= 0
        ? Phaser.Math.FloatBetween(-0.4, 0.4)
        : Phaser.Math.FloatBetween(Math.PI - 0.4, Math.PI + 0.4);
    }

    return dy >= 0
      ? Phaser.Math.FloatBetween(Math.PI / 2 - 0.4, Math.PI / 2 + 0.4)
      : Phaser.Math.FloatBetween(-Math.PI / 2 - 0.4, -Math.PI / 2 + 0.4);
  }

  private assignQuestMonsterVelocity(monster: HiddenMonster, initialTurn = false): void {
    const baseSpeed = 40 + monster.chapter * 12 + this.level * 4;
    const speedMultiplier = this.getQuestMonsterSpeedMultiplier(monster);
    let angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    switch (monster.moveStyle) {
      case 'hunter':
        angle = this.player.active
          ? Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y)
          : Phaser.Math.FloatBetween(0, Math.PI * 2);
        break;
      case 'swoop':
        angle = this.player.active
          ? Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y) + Phaser.Math.FloatBetween(-0.58, 0.58)
          : Phaser.Math.FloatBetween(0, Math.PI * 2);
        break;
      case 'drift':
        angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        break;
      case 'lunge':
        angle = this.player.active
          ? Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y) + Phaser.Math.FloatBetween(-0.22, 0.22)
          : Phaser.Math.FloatBetween(0, Math.PI * 2);
        break;
      case 'skitter':
      default:
        angle = this.getQuestSkitterAngle(monster);
        break;
    }
    monster.setVelocity(Math.cos(angle) * baseSpeed * speedMultiplier, Math.sin(angle) * baseSpeed * speedMultiplier);
    monster.roamTurnAt = this.getQuestMonsterTurnDelay(monster, initialTurn);
  }

  private updateQuestMonsterMovement(time: number): void {
    if (this.gameMode !== 'quest' || this.questViewMode !== 'dungeon' || !this.hiddenMonsters) {
      return;
    }

    (this.hiddenMonsters.getChildren() as HiddenMonster[]).forEach((monster) => {
      if (!monster.active || monster.defeated || !monster.revealed) {
        monster.setVelocity(0, 0);
        return;
      }

      const marginX = Math.max(14, monster.displayWidth / 2);
      const marginY = Math.max(14, monster.displayHeight / 2);
      const minX = monster.roamBounds.x + marginX;
      const maxX = monster.roamBounds.right - marginX;
      const minY = monster.roamBounds.y + marginY;
      const maxY = monster.roamBounds.bottom - marginY;
      let shouldRedirect = time >= monster.roamTurnAt;

      if (monster.x <= minX || monster.x >= maxX) {
        monster.x = Phaser.Math.Clamp(monster.x, minX, maxX);
        shouldRedirect = true;
      }

      if (monster.y <= minY || monster.y >= maxY) {
        monster.y = Phaser.Math.Clamp(monster.y, minY, maxY);
        shouldRedirect = true;
      }

      if (shouldRedirect) {
        this.assignQuestMonsterVelocity(monster);
      }

      switch (monster.moveStyle) {
        case 'hunter':
          if (monster.body && this.player.active) {
            const body = monster.body as Phaser.Physics.Arcade.Body;
            const targetAngle = Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y);
            const speed = Math.max(body.velocity.length(), 58 + monster.chapter * 12);
            const chaseAngle = Phaser.Math.Angle.RotateTo(
              Phaser.Math.Angle.Between(0, 0, body.velocity.x, body.velocity.y),
              targetAngle,
              0.22,
            );
            monster.setVelocity(Math.cos(chaseAngle) * speed, Math.sin(chaseAngle) * speed);
          }
          monster.setAngle(Math.sin(time / 90 + monster.driftSeed) * 10);
          break;
        case 'swoop':
          if (monster.body && this.player.active) {
            const desiredAngle = Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y);
            const speed = (monster.body as Phaser.Physics.Arcade.Body).velocity.length() || (40 + monster.chapter * 12);
            const swayAngle = desiredAngle + Math.sin(time / 170 + monster.driftSeed) * 0.5;
            monster.setVelocity(
              Math.cos(swayAngle) * speed,
              Math.sin(swayAngle) * speed + Math.sin(time / 90 + monster.driftSeed) * 24,
            );
          }
          monster.setAngle(Math.sin(time / 110 + monster.driftSeed) * 20);
          break;
        case 'drift':
          if (monster.body) {
            const driftVelocity = (monster.body as Phaser.Physics.Arcade.Body).velocity;
            monster.setVelocity(
              driftVelocity.x * 0.992 + Math.sin(time / 210 + monster.driftSeed) * 2.4,
              driftVelocity.y * 0.992 + Math.cos(time / 250 + monster.driftSeed) * 2.1,
            );
          }
          monster.setAngle(Math.sin(time / 240 + monster.driftSeed) * 4);
          monster.setAlpha(0.7 + Math.sin(time / 190 + monster.driftSeed) * 0.16);
          break;
        case 'lunge':
          if (monster.body && this.player.active) {
            const body = monster.body as Phaser.Physics.Arcade.Body;
            const targetAngle = Phaser.Math.Angle.Between(monster.x, monster.y, this.player.x, this.player.y);
            const speed = Math.max(body.velocity.length(), 54 + monster.chapter * 10);
            body.velocity.x = Phaser.Math.Linear(body.velocity.x, Math.cos(targetAngle) * speed, 0.08);
            body.velocity.y = Phaser.Math.Linear(body.velocity.y, Math.sin(targetAngle) * speed, 0.08);
            monster.setAngle(Phaser.Math.RadToDeg(Math.atan2(body.velocity.y, body.velocity.x)) + 90);
          }
          break;
        case 'skitter':
        default:
          if (monster.body) {
            const body = monster.body as Phaser.Physics.Arcade.Body;
            body.velocity.x += Math.sin(time / 75 + monster.driftSeed) * 1.8;
            body.velocity.y += Math.cos(time / 68 + monster.driftSeed) * 1.8;
          }
          monster.setAngle(Math.sin(time / 95 + monster.driftSeed) * 10);
          break;
      }
    });
  }

  private updateQuestExploration(): void {
    if (this.gameMode !== 'quest' || this.questViewMode !== 'dungeon' || !this.hiddenMonsters || !this.player.active || this.gameOver) {
      return;
    }

    this.handleQuestRoomTransition();
    this.updateQuestMonsterMovement(this.time.now);

    this.questFogZones.forEach((fogZone) => {
      const bounds = fogZone.getBounds();
      const nearestX = Phaser.Math.Clamp(this.player.x, bounds.left, bounds.right);
      const nearestY = Phaser.Math.Clamp(this.player.y, bounds.top, bounds.bottom);
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, nearestX, nearestY);
      const localLight = Phaser.Math.Clamp(1 - (distance / 170), 0, 1);
      if (localLight > 0.22) {
        fogZone.revealed = true;
      }

      fogZone.exploreLevel = Math.max(fogZone.exploreLevel, localLight * 0.72);
      const targetAlpha = Phaser.Math.Clamp(0.96 - fogZone.exploreLevel * 0.44 - localLight * 0.68, 0.14, 0.96);
      fogZone.setAlpha(targetAlpha);
    });

    (this.hiddenMonsters.getChildren() as HiddenMonster[]).forEach((monster) => {
      if (!monster.active || monster.defeated) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y);
      if (distance <= 184) {
        this.spotQuestMonsterClue(monster);
      }

      if (distance > 98 || monster.revealed) {
        return;
      }

      this.revealHiddenMonster(
        monster,
        `A hidden ${monster.hiddenName} emerges from the maze. Use your weapon before it closes in.`,
        `${monster.hiddenName} revealed`,
      );
    });

    if (this.questBoss && this.questBoss.awakened && !this.questBoss.defeated && !this.questBoss.engaged) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.questBoss.x, this.questBoss.y);
      if (distance < 110) {
        this.setExplanationMessage(
          this.questBoss.chapter === 4
            ? 'The Cloudy Dragon looms over the altar. Step into contact to begin the final trial.'
            : `${this.questBoss.title} waits in the chamber. Step into contact to begin the boss trial.`,
          this.questBoss.chapter === 4 ? 'Dragon near. Touch it.' : `${this.questBoss.title} near. Touch it.`,
        );
      }
    }
  }

  private updateQuestBossEncounter(time: number): void {
    if (this.gameMode !== 'quest' || this.questViewMode !== 'dungeon' || !this.questBoss) {
      return;
    }

    if (this.questBoss.defeated) {
      return;
    }

    if (this.questBoss.awakened) {
      this.questBoss.y += Math.sin(time / 220) * 0.45;
      this.questBoss.setAngle(Math.sin(time / 260) * 6);
    }

    if (!this.questBoss.awakened || !this.questBoss.engaged || this.currentQuestionSource !== 'boss') {
      return;
    }

    const attackDelay = 980;
    if (time - this.lastBossAttackAt < attackDelay) {
      return;
    }

    this.spawnQuestBossEmberVolley();

    this.lastBossAttackAt = time;
    this.bossAttackStep += 1;
    this.refreshQuestBoss();
  }

  private isQuestBossPillarActive(): boolean {
    return false;
  }

  private getQuestBossPillarFormation(): QuestBossPillarFormation {
    if (!this.isQuestBossPillarActive()) {
      return 'ring';
    }

    switch (this.bossAttackStep % 4) {
      case 1:
        return 'line';
      case 2:
        return 'gate';
      case 3:
        return 'diagonal';
      default:
        return 'ring';
    }
  }

  private getQuestBossPillarFormationLabel(): string {
    switch (this.getQuestBossPillarFormation()) {
      case 'line':
        return 'line ward';
      case 'gate':
        return 'gate ward';
      case 'diagonal':
        return 'diagonal ward';
      case 'ring':
      default:
        return 'ring ward';
    }
  }

  private cleanupShots(): void {
    (this.shots.getChildren() as Phaser.Physics.Arcade.Image[]).forEach((shot) => {
      if (!shot.active) {
        return;
      }

      if (shot.y + shot.displayHeight < 0) {
        shot.destroy();
      }
    });

    if (!this.questBossHazards) {
      return;
    }

    (this.questBossHazards.getChildren() as QuestBossHazard[]).forEach((hazard) => {
      if (!hazard.active) {
        return;
      }

      const outOfBounds = hazard.x < QUEST_DUNGEON_BOUNDS.left - 80
        || hazard.x > QUEST_DUNGEON_BOUNDS.left + QUEST_DUNGEON_BOUNDS.width + 80
        || hazard.y < QUEST_DUNGEON_BOUNDS.top - 80
        || hazard.y > QUEST_DUNGEON_BOUNDS.top + QUEST_DUNGEON_BOUNDS.height + 80;
      const expired = this.time.now - hazard.spawnedAt > 4200;
      if (outOfBounds || expired) {
        hazard.destroy();
      }
    });
  }

  private loseLife(): void {
    if (this.gameOver || this.recovering) {
      return;
    }

    this.recovering = true;
    this.acceptingAnswer = false;
    this.player.setVelocity(0, 0);

    if (this.gameMode === 'quest') {
      this.heroHp = Math.max(0, this.heroHp - this.getQuestDamageTaken());
      this.refreshVitalHud();

      if (this.heroHp <= 0) {
        this.handleQuestReincarnation(`${this.getQuestEncounter().foeName} struck the party down.`);
        return;
      }

      this.time.delayedCall(GameScene.INCORRECT_REVIEW_DELAY_MS, () => {
        this.rerollQuestQuestionAfterPenalty();
        this.resumeQuestAfterDamage();
      });
      return;
    }

    this.player.disableBody(true, true);
    this.lives -= 1;
    this.refreshVitalHud();

    if (this.lives <= 0) {
      this.endRun();
      return;
    }

    this.time.delayedCall(GameScene.INCORRECT_REVIEW_DELAY_MS, () => {
      this.resetPlayer();
    });
  }

  private resetAfterTrafficHit(): void {
    this.recovering = true;
    this.acceptingAnswer = false;
    this.player.setVelocity(0, 0);
    this.player.disableBody(true, true);

    this.time.delayedCall(GameScene.TRAFFIC_RESET_DELAY_MS, () => {
      this.resetPlayer();
    });
  }

  private resumeQuestAfterDamage(): void {
    if (!this.player.body) {
      return;
    }

    this.player.setVelocity(0, 0);
    this.player.setCollideWorldBounds(true);
    this.recovering = false;
    this.acceptingAnswer = true;
    this.beginInvulnerabilityWindow();
  }

  private resetPlayer(): void {
    this.player.enableBody(true, this.gameMode === 'quest' ? this.getQuestStartX() : this.scale.width / 2, this.getPlayerStartY(), true, true);
    this.player.setVelocity(0, 0);
    this.player.setCollideWorldBounds(true);
    this.recovering = false;
    this.acceptingAnswer = true;
    this.beginInvulnerabilityWindow();
  }

  private handleQuestReincarnation(reason: string): void {
    if (this.gameMode !== 'quest' || this.gameOver) {
      return;
    }

    this.player.disableBody(true, true);
    this.recovering = true;
    this.acceptingAnswer = false;
    this.questBossHazards?.clear(true, true);

    if (this.activeTreasureChest && this.currentQuestionSource === 'treasure') {
      this.activeTreasureChest.opened = false;
      this.activeTreasureChest.clearTint();
      this.activeTreasureChest.setTint(this.getQuestChapterTint(this.activeTreasureChest.chapter));
    }

    this.activeTreasureChest = undefined;
    this.currentQuestionSource = 'standard';
    this.questBoss && (this.questBoss.engaged = false);
    this.refreshQuestBoss();

    const lostRelic = this.loseLatestQuestRelic();
    const arrowLoss = Math.ceil(this.armoryShots / 2);
    this.armoryShots = Math.max(0, this.armoryShots - arrowLoss);
    this.score = Math.max(0, this.score - 180);
    this.lives = Math.max(0, this.lives - 1);
    this.level = this.getQuestLevelFromRelics();
    if (this.questBoss && !this.questBoss.defeated && this.level < 4) {
      this.questBoss.awakened = false;
      this.questBoss.engaged = false;
    }
    if (this.lives <= 0) {
      this.refreshScoreHud();
      this.refreshArmoryHud();
      this.refreshVitalHud();
      this.endRun('Party Lost', `Cloudy Mountain keeps the crown.\nRenown: ${this.score}\nPress ENTER to restart`);
      return;
    }

    this.setQuestViewMode('overworld', this.level);
    this.heroHp = this.heroMaxHp;
    this.refreshScoreHud();
    this.refreshArmoryHud();
    this.refreshVitalHud();
    this.refreshQuestTrials();
    this.refreshQuestBoss();
    this.refreshStageHud();
    this.refreshQuestJournal();
    this.setFocusedQuestGate(undefined);
    this.showCustomBanner('Reincarnated\nAt Cabin');
    this.setExplanationMessage(
      lostRelic
        ? `${reason} The party reforms at the cabin but loses the ${lostRelic.title} and ${arrowLoss} arrow${arrowLoss === 1 ? '' : 's'}.`
        : `${reason} The party reforms at the cabin and loses ${arrowLoss} arrow${arrowLoss === 1 ? '' : 's'}.`,
      lostRelic
        ? `Party lost. ${lostRelic.title} gone.`
        : `Party lost. ${arrowLoss} arrow${arrowLoss === 1 ? '' : 's'} gone.`,
    );

    this.time.delayedCall(850, () => {
      this.nextQuestion();
      this.resetPlayer();
    });
  }

  private maybeAdvanceDifficulty(): boolean {
    const nextLevel = this.gameMode === 'quest'
      ? this.getQuestLevelFromRelics()
      : this.getLevelForProgress(this.correctAnswers);

    if (nextLevel === this.level) {
      this.updateProgressText();
      return false;
    }

    this.level = nextLevel;
    this.currentStageMode = this.getStageModeForLevel(this.level);
    if (this.gameMode === 'quest') {
      this.heroMaxHp = 26 + (this.level - 1) * 5;
      this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 6);
      this.refreshVitalHud();
    }
    this.refreshStageHud();
    this.applyDifficultyScaling();
    this.repositionAnswerGates();
    if (this.gameMode === 'quest') {
      this.refreshQuestTrials();
      this.refreshQuestBoss();
    }
    this.updateProgressText();
    this.showLevelBanner();

    return true;
  }

  private getLevelForProgress(correctAnswers: number): 1 | 2 | 3 | 4 {
    if (correctAnswers >= 9) {
      return 4;
    }

    if (correctAnswers >= 6) {
      return 3;
    }

    if (correctAnswers >= 3) {
      return 2;
    }

    return 1;
  }

  private applyDifficultyScaling(): void {
    const enemyChildren = this.enemies.getChildren() as EnemySprite[];

    enemyChildren.forEach((enemy) => {
      if (!enemy.active) {
        return;
      }

      enemy.y = enemy.laneY;
      enemy.setVelocityX(this.getLaneSpeed(enemy.laneIndex) * enemy.speedFactor * enemy.direction);
    });
  }

  private updateProgressText(): void {
    if (this.gameMode === 'quest') {
      const activeChapter = this.questViewMode === 'dungeon' ? this.activeQuestTravelChapter : this.level;
      const activeEncounter = this.getQuestEncounter(activeChapter);
      const nextRelic = this.getQuestNextRelic();
      if (this.questViewMode === 'overworld') {
        if (this.isQuestBossDefeatedForChapter(4)) {
          this.progressText.setText('Crown won. Reach the cabin.');
          return;
        }

        this.progressText.setText(nextRelic
          ? `Roam. Seek ${nextRelic.shortLabel}.`
          : 'Summit open. Return with crown.');
        return;
      }

      if (this.isQuestBossDefeatedForChapter(4)) {
        this.progressText.setText('Find the exit. Return home.');
        return;
      }

      if (this.currentQuestionSource === 'boss' && this.questBoss && !this.questBoss.defeated) {
        const engagementText = this.questBoss.engaged
          ? this.questBoss.chapter === 4 ? 'Answer. Dodge fire.' : 'Answer. Keep firing.'
          : `Touch ${this.questBoss.title.toLowerCase()}.`;
        this.progressText.setText(engagementText);
        return;
      }

      if (this.currentQuestionSource === 'treasure') {
        const relic = this.getQuestRelicForChest(this.activeTreasureChest);
        this.progressText.setText(relic
          ? `Break ward. Claim ${relic.title}.`
          : 'Break ward. Claim cache.');
        return;
      }

      const activeTrialText = this.activeQuestTrial
        ? this.focusedQuestGate
          ? 'Break ward. Open mark.'
          : this.usesManualQuestGateMarking()
            ? 'Mark gate. Break ward.'
            : 'Break ward. Route opens.'
        : this.focusedQuestGate
          ? 'Gate marked. Find seal.'
          : this.usesManualQuestGateMarking()
            ? 'Scout. Mark gate. Find seal.'
            : 'Scout. Find seal.';
      const objectiveText = !this.hasRemainingQuestTrials(activeChapter) && !this.isQuestBossDefeatedForChapter(activeChapter)
        ? ` Face ${activeEncounter.foeName}.`
        : nextRelic
          ? ` Seek ${nextRelic.shortLabel}.`
          : ` Face ${activeEncounter.foeName}.`;
      this.progressText.setText(`${activeTrialText}${objectiveText}`);
      return;
    }

    const nextThreshold = this.level === 1 ? 3 : this.level === 2 ? 6 : this.level === 3 ? 9 : null;

    if (nextThreshold === null) {
      this.progressText.setText('Maximum stage intensity unlocked. Expect faster traffic and more aggressive movement patterns.');
      return;
    }

    const remaining = nextThreshold - this.correctAnswers;
    this.progressText.setText(`${remaining} more correct answer${remaining === 1 ? '' : 's'} until the next traffic phase.`);
  }

  private wrapEnemiesAcrossScreen(): void {
    const width = this.scale.width;

    (this.enemies.getChildren() as EnemySprite[]).forEach((enemy) => {
      if (!enemy.active) {
        return;
      }

      const halfWidth = enemy.displayWidth / 2;

      if (enemy.direction === 1 && enemy.x - halfWidth > width) {
        enemy.x = -halfWidth;
      }

      if (enemy.direction === -1 && enemy.x + halfWidth < 0) {
        enemy.x = width + halfWidth;
      }
    });
  }

  private repositionAnswerGates(): void {
    const positions = Phaser.Utils.Array.Shuffle(this.getAnswerGateXs());

    this.gates.forEach((gate, index) => {
      const nextX = positions[index];

      this.tweens.add({
        targets: [gate, gate.answerLabel],
        x: nextX,
        duration: 300,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          gate.refreshBody();
        },
        onComplete: () => {
          gate.refreshBody();
        },
      });
    });
  }

  private getLaneSpeed(laneIndex: number): number {
    return (110 + laneIndex * 25 + (this.level - 1) * 35) * this.getModeSpeedMultiplier();
  }

  private flashEnemy(enemy: EnemySprite, color: number): void {
    if (!enemy.active) {
      return;
    }

    enemy.setTintFill(color);
    this.tweens.add({
      targets: enemy,
      alpha: 0.35,
      duration: 80,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        if (!enemy.active) {
          return;
        }

        enemy.clearTint();
        enemy.setAlpha(1);
      },
    });
  }

  private spawnImpactBurst(x: number, y: number, color: number, largeBurst: boolean): void {
    const flash = this.add.rectangle(x, y, largeBurst ? 42 : 28, largeBurst ? 42 : 28, color, 0.5).setDepth(6);
    const core = this.add.rectangle(x, y, largeBurst ? 12 : 8, largeBurst ? 12 : 8, 0xfef3c7, 0.9).setDepth(7);
    this.tweens.add({
      targets: [flash, core],
      alpha: 0,
      scaleX: largeBurst ? 2.8 : 2.1,
      scaleY: largeBurst ? 2.8 : 2.1,
      duration: largeBurst ? 160 : 110,
      ease: 'Stepped',
      onComplete: () => {
        flash.destroy();
        core.destroy();
      },
    });
  }

  private showFloatingLabel(x: number, y: number, text: string, color: number): void {
    const label = this.add.text(x, y, text, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#08111f',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(8);

    this.tweens.add({
      targets: label,
      alpha: 0,
      duration: 90,
      yoyo: true,
      repeat: 2,
      ease: 'Stepped',
      onComplete: () => {
        label.destroy();
      },
    });
  }

  private playImpactTone(startFrequency: number, endFrequency: number, durationSeconds: number, peakGain: number): void {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new window.AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + durationSeconds);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + durationSeconds);
  }

  private playQuestCue(cue: 'travel' | 'room' | 'relic' | 'boss-awaken' | 'boss-fall'): void {
    switch (cue) {
      case 'travel':
        this.playImpactTone(180, 220, 0.07, 0.022);
        this.playImpactTone(220, 180, 0.06, 0.018);
        return;
      case 'room':
        this.playImpactTone(200, 280, 0.09, 0.022);
        return;
      case 'relic':
        this.playImpactTone(260, 420, 0.08, 0.026);
        this.playImpactTone(420, 620, 0.08, 0.022);
        return;
      case 'boss-awaken':
        this.playImpactTone(140, 260, 0.16, 0.04);
        this.playImpactTone(260, 180, 0.18, 0.03);
        return;
      case 'boss-fall':
        this.playImpactTone(320, 180, 0.12, 0.03);
        this.playImpactTone(180, 420, 0.15, 0.035);
        return;
    }
  }

  private updateEnemyPatterns(time: number): void {
    const waveTime = time / 220;
    const pulseTime = time / 700;

    (this.enemies.getChildren() as EnemySprite[]).forEach((enemy) => {
      if (!enemy.active) {
        return;
      }

      const lanePhase = enemy.laneIndex * 0.85 + enemy.driftSeed;
      const baseVelocityX = this.getLaneSpeed(enemy.laneIndex) * enemy.speedFactor * enemy.direction;
      let verticalOffset = 0;
      let angle = 0;
      let speedMultiplier = 1;

      switch (this.currentStageMode) {
        case 'frogger':
          verticalOffset = 0;
          angle = 0;
          speedMultiplier = 1;
          break;
        case 'galaga':
          verticalOffset = Math.sin(waveTime + lanePhase) * 18;
          angle = Math.sin(waveTime + lanePhase) * 6;
          speedMultiplier = 1 + Math.sin(pulseTime + enemy.laneIndex * 0.6) * 0.08;
          break;
        case 'centipede':
          verticalOffset = Math.sin(enemy.x / 85 + waveTime + lanePhase) * 22 + Math.cos(waveTime * 0.7 + enemy.laneIndex) * 8;
          angle = Math.sin(enemy.x / 65 + waveTime + enemy.laneIndex * 0.25) * 10;
          speedMultiplier = 1 + Math.sin(pulseTime * 1.15 + enemy.laneIndex * 0.9) * 0.14;
          break;
        case 'exam':
          verticalOffset = Math.sin(waveTime * 1.15 + lanePhase) * 16 + Math.cos(waveTime * 0.55 + enemy.laneIndex * 1.2) * 12;
          angle = Math.sin(waveTime * 1.1 + lanePhase) * 12 + Math.cos(waveTime * 0.65 + enemy.laneIndex) * 4;
          speedMultiplier = 1 + Math.sin(pulseTime * 1.35 + enemy.laneIndex) * 0.16 + Math.cos(pulseTime * 0.8 + lanePhase) * 0.05;
          break;
      }

      enemy.y = enemy.laneY + verticalOffset;
      enemy.setAngle(angle);
      enemy.setVelocityX(baseVelocityX * speedMultiplier);
    });
  }

  private updateQuestEnemyMovement(time: number): void {
    (this.enemies.getChildren() as EnemySprite[]).forEach((enemy) => {
      if (!enemy.active || !enemy.roamBounds) {
        return;
      }

      const marginX = Math.max(18, enemy.displayWidth / 2);
      const marginY = Math.max(18, enemy.displayHeight / 2);
      const minX = enemy.roamBounds.x + marginX;
      const maxX = enemy.roamBounds.right - marginX;
      const minY = enemy.roamBounds.y + marginY;
      const maxY = enemy.roamBounds.bottom - marginY;
      let shouldRedirect = time >= enemy.roamTurnAt;

      if (enemy.x <= minX || enemy.x >= maxX) {
        enemy.x = Phaser.Math.Clamp(enemy.x, minX, maxX);
        shouldRedirect = true;
      }

      if (enemy.y <= minY || enemy.y >= maxY) {
        enemy.y = Phaser.Math.Clamp(enemy.y, minY, maxY);
        shouldRedirect = true;
      }

      if (shouldRedirect) {
        this.assignQuestEnemyVelocity(enemy);
      }

      enemy.setAngle(Math.sin(time / 240 + enemy.driftSeed) * 8);
    });
  }

  private assignQuestEnemyVelocity(enemy: EnemySprite, initialTurn = false): void {
    if (!enemy.roamBounds) {
      return;
    }

    const baseSpeed = 76 + this.level * 10 + enemy.laneIndex * 6;
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    enemy.setVelocity(Math.cos(angle) * baseSpeed, Math.sin(angle) * baseSpeed);
    enemy.roamTurnAt = this.time.now + Phaser.Math.Between(initialTurn ? 700 : 900, initialTurn ? 1700 : 2300);
  }

  private handleQuestTrialContact(trial: QuestTrial): void {
    if (this.gameMode !== 'quest' || this.questViewMode !== 'dungeon' || this.gameOver || this.recovering || !trial.active || trial.solved) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, trial.x, trial.y);
    if (distance > QUEST_TRIAL_CONTACT_RADIUS) {
      return;
    }

    if (trial.chapter > this.level) {
      this.setExplanationMessage(`That seal belongs to a deeper chapter. Break the current chapter's seals first.`, 'Deeper seal.');
      return;
    }

    if (this.activeQuestTrial !== trial) {
      this.activeQuestTrial = trial;
      this.refreshQuestTrials();
    }

    if (this.currentQuestionSource === 'treasure') {
      this.setExplanationMessage('Finish the treasure trial before the seal can be challenged again.', 'Finish cache first.');
      return;
    }

    this.setExplanationMessage(
      this.focusedQuestGate
        ? 'Seal found. Answer correctly to open the marked gate.'
        : this.usesManualQuestGateMarking()
          ? 'Seal found. Touch a gate, then answer correctly to open it.'
          : 'Seal found. Answer correctly and the route will open automatically.',
      this.focusedQuestGate ? 'Seal ready. Break ward.' : this.usesManualQuestGateMarking() ? 'Seal ready. Mark gate.' : 'Seal ready. Route opens.',
    );
  }

  private handleQuestGateContact(gate: QuestGate): void {
    if (this.gameMode !== 'quest' || this.questViewMode !== 'dungeon' || this.gameOver || this.recovering || gate.opened) {
      return;
    }

    const blockingRelic = this.getQuestGateBlockingRelic(gate);
    if (blockingRelic) {
      this.setFocusedQuestGate(undefined);
      this.setExplanationMessage(`That mountain pass needs the ${blockingRelic.title}. ${blockingRelic.locationHint}`, `${blockingRelic.title} needed.`);
      return;
    }

    if (this.focusedQuestGate !== gate) {
      this.setFocusedQuestGate(gate);
      this.setExplanationMessage(
        this.activeQuestTrial
          ? this.usesManualQuestGateMarking()
            ? 'Gate marked. Solve the current seal to open this door.'
            : 'Gate marked. Solve the current seal to force this route instead of the automatic one.'
          : this.usesManualQuestGateMarking()
            ? 'Gate marked. Find the lit seal, then solve it to open this door.'
            : 'Gate marked. Find the lit seal, then solve it to force this route.',
        this.activeQuestTrial ? 'Gate marked. Break ward.' : 'Gate marked. Find seal.',
      );
    }
  }

  private isQuestTravelMarkerCentered(marker: QuestTravelMarker): boolean {
    const requiredDistance = marker.markerKind === 'surface'
      ? Math.max(20, Math.min(marker.width, marker.height) * 0.3)
      : Math.max(12, Math.min(marker.width, marker.height) * 0.42);
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, marker.x, marker.y) <= requiredDistance;
  }

  private handleQuestTravelMarkerContact(marker: QuestTravelMarker): void {
    if (this.gameMode !== 'quest' || this.gameOver || this.recovering || this.time.now - this.lastQuestTravelAt < 700 || this.time.now < this.questTravelBlockedUntil) {
      return;
    }

    if (!this.isQuestTravelMarkerCentered(marker)) {
      return;
    }

    if (this.isQuestBossDefeatedForChapter(4) && marker.markerKind === 'surface') {
      this.setExplanationMessage('Carry the crown to the cabin.', 'Return to cabin.');
      return;
    }

    if (marker.markerKind === 'surface' && marker.chapter > this.level) {
      const blockingRelic = this.getQuestRelicForUnlockChapter(marker.chapter as 2 | 3 | 4);
      this.setExplanationMessage(
        blockingRelic
          ? `${marker.label} is sealed. Find ${blockingRelic.shortLabel}.`
          : `${marker.label} is sealed.`,
        blockingRelic ? `${blockingRelic.shortLabel} needed.` : 'Pass sealed.',
      );
      return;
    }

    this.lastQuestTravelAt = this.time.now;
    this.questTravelBlockedUntil = this.time.now + 1600;
    this.player.setVelocity(0, 0);
    this.setFocusedQuestGate(undefined);

    if (marker.markerKind === 'surface') {
      this.setQuestViewMode('dungeon', marker.chapter);
      this.player.setPosition(marker.destinationX, marker.destinationY);
      this.setExplanationMessage(`${marker.label}.`);
      this.playQuestCue('travel');
      return;
    }

    this.setQuestViewMode('overworld', this.level);
    this.player.setPosition(marker.destinationX, marker.destinationY);
    this.setExplanationMessage('Back to the cabin.');
    this.playQuestCue('travel');
  }

  private updateQuestGateFocus(): void {
    if (this.questViewMode !== 'dungeon') {
      return;
    }

    if (!this.focusedQuestGate) {
      return;
    }

    if (this.focusedQuestGate.opened) {
      this.setFocusedQuestGate(undefined);
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.focusedQuestGate.x, this.focusedQuestGate.y);
    if (distance > QUEST_GATE_FOCUS_RELEASE_RADIUS) {
      this.setFocusedQuestGate(undefined);
    }
  }

  private refreshQuestTrials(): void {
    if (this.gameMode !== 'quest' || !this.questTrials) {
      return;
    }

    const activeChapter = this.questViewMode === 'dungeon' ? this.activeQuestTravelChapter : this.level;
    const trials = this.questTrials.getChildren() as QuestTrial[];
    const nextTrial = trials.find((trial) => !trial.solved && trial.chapter === activeChapter);

    if (!nextTrial) {
      this.activeQuestTrial = undefined;
    } else if (!this.activeQuestTrial || this.activeQuestTrial.solved || this.activeQuestTrial.chapter !== activeChapter) {
      this.activeQuestTrial = nextTrial;
    }

    trials.forEach((trial) => {
      if (this.questBoss?.awakened && trial.chapter === activeChapter) {
        trial.setActive(false);
        trial.setVisible(false);
        if (trial.body) {
          trial.body.enable = false;
        }
        return;
      }

      const visible = this.questViewMode === 'dungeon' && !trial.solved && trial.chapter === activeChapter && trial === this.activeQuestTrial;
      trial.setActive(visible);
      trial.setVisible(visible);
      if (trial.body) {
        trial.body.enable = visible;
      }

      if (!visible) {
        return;
      }

      const isCurrentTrial = trial === this.activeQuestTrial;
      trial.setAlpha(isCurrentTrial ? 1 : 0.26);
      trial.setScale(isCurrentTrial ? 1.02 : 0.9);
      trial.setTint(isCurrentTrial ? 0xffcf7a : 0x6286a1);
    });

    this.updateProgressText();
  }

  private refreshQuestBoss(): void {
    if (!this.questBoss || !this.questBossAltar) {
      return;
    }

    if (this.questViewMode !== 'dungeon' && !this.questBoss.defeated) {
      this.questBoss.setVisible(false);
      if (this.questBoss.body) {
        this.questBoss.body.enable = false;
      }
      this.questBossAltar.setVisible(false);
      this.questBossPillars.forEach((pillar) => {
        pillar.setVisible(false);
        pillar.body.enable = false;
      });
      return;
    }

    if (this.questBoss.defeated) {
      this.questBoss.disableBody(true, true);
      this.questBossAltar.setFillStyle(0x2a3327, 0.98).setStrokeStyle(1, 0x8faf88, 0.28);
      this.questBossPillars.forEach((pillar) => {
        pillar.setVisible(false);
        pillar.body.enable = false;
      });
      return;
    }

    this.questBoss.enableBody(true, this.questBoss.x, this.questBoss.y, true, true);
    this.questBoss.setVisible(true);
    this.questBossPillars.forEach((pillar) => {
      pillar.setVisible(false);
      pillar.body.enable = false;
    });
    if (this.questBoss.awakened) {
      if (this.questBoss.body) {
        this.questBoss.body.enable = true;
      }
      this.questBoss.setAlpha(1);
      this.questBoss.setScale(this.questBoss.engaged ? 1.02 : 0.98);
      this.questBoss.setTint(this.questBoss.engaged ? 0xe4c66e : 0xc06955);
      this.questBossAltar.setFillStyle(0x433024, 1).setStrokeStyle(1, 0xc78866, this.questBoss.engaged ? 0.34 : 0.24);
      return;
    }

    if (this.questBoss.body) {
      this.questBoss.body.enable = true;
    }
    this.questBoss.setAlpha(0.34);
    this.questBoss.setScale(0.9);
    this.questBoss.setTint(this.getQuestChapterTint(this.questBoss.chapter));
    this.questBossAltar.setFillStyle(0x433024, 0.96).setStrokeStyle(1, 0xc78866, 0.22);
    this.questBossPillars.forEach((pillar) => {
      pillar.setVisible(false);
      pillar.body.enable = false;
    });
  }

  private isQuestBossEnraged(): boolean {
    return this.questBoss?.awakened === true && this.bossAttackStep >= 3;
  }

  private applyQuestClosedGateStyle(gate: QuestGate): void {
    const blockingRelic = this.getQuestGateBlockingRelic(gate);
    const fillColor = gate.kind === 'frontier' ? 0x33231f : 0x2a2017;
    const strokeColor = this.focusedQuestGate === gate
      ? 0xa9d9cf
      : blockingRelic
        ? 0xbd6c5d
      : gate.kind === 'frontier'
        ? 0xa77962
        : 0xc3aa72;
    const strokeAlpha = this.focusedQuestGate === gate ? 0.84 : 0.28;
    const strokeWidth = this.focusedQuestGate === gate ? 2 : 1;
    gate.setAlpha(1).setFillStyle(fillColor, 0.96).setStrokeStyle(strokeWidth, strokeColor, strokeAlpha);
    this.applyQuestGateDecorationStyle(gate, fillColor, strokeColor, Math.min(0.62, strokeAlpha + 0.12));
  }

  private setFocusedQuestGate(gate?: QuestGate): void {
    if (this.focusedQuestGate === gate) {
      return;
    }

    const previousGate = this.focusedQuestGate;
    this.focusedQuestGate = gate && !gate.opened ? gate : undefined;

    if (previousGate && !previousGate.opened) {
      this.applyQuestClosedGateStyle(previousGate);
    }

    if (this.focusedQuestGate) {
      this.applyQuestClosedGateStyle(this.focusedQuestGate);
    }

    this.updateProgressText();
  }

  private setQuestGateState(gate: QuestGate, opened: boolean, showFx: boolean): void {
    gate.opened = opened;
    gate.body.enable = !opened;

    if (opened) {
      if (this.focusedQuestGate === gate) {
        this.focusedQuestGate = undefined;
      }
      gate.setAlpha(0.2).setFillStyle(0x1d251f, 0.22).setStrokeStyle(1, 0x7f9e8c, 0.14);
      this.applyQuestGateDecorationStyle(gate, 0x282019, 0x6d8f7d, 0.18);
      gate.decorations?.forEach((shape) => {
        shape.setAlpha(0.34);
      });
      if (showFx) {
        this.spawnImpactBurst(gate.x, gate.y, 0x7ee2a8, false);
        this.showFloatingLabel(gate.x, gate.y - 18, 'Gate open', 0x7ee2a8);
      }
      return;
    }

    gate.decorations?.forEach((shape) => {
      shape.setAlpha(1);
    });
    this.applyQuestClosedGateStyle(gate);
  }

  private getNextQuestTrialForChapter(chapter: 1 | 2 | 3 | 4): QuestTrial | undefined {
    if (!this.questTrials) {
      return undefined;
    }

    return (this.questTrials.getChildren() as QuestTrial[])
      .find((trial) => !trial.solved && trial.chapter === chapter);
  }

  private openQuestIntraGatesForChapter(chapter: 1 | 2 | 3 | 4, showFx: boolean): void {
    if (!this.questGates) {
      return;
    }

    (this.questGates.getChildren() as QuestGate[])
      .filter((gate) => !gate.opened && gate.chapter === chapter && gate.kind === 'intra')
      .forEach((gate) => {
        this.setQuestGateState(gate, true, showFx);
      });
  }

  private openQuestGateForChapter(trial: QuestTrial): 'opened' | 'blocked' | 'clear' {
    if (!this.questGates) {
      return 'clear';
    }

    if (this.focusedQuestGate && !this.focusedQuestGate.opened) {
      if (this.getQuestGateBlockingRelic(this.focusedQuestGate)) {
        return 'blocked';
      }
      this.setQuestGateState(this.focusedQuestGate, true, true);
      this.refreshQuestJournal();
      return 'opened';
    }

    const gates = this.questGates.getChildren() as QuestGate[];
    const connectedGates = gates.filter((candidate) => !candidate.opened && candidate.roomKeys.includes(trial.roomKey));
    const closedIntraGates = connectedGates
      .filter((candidate) => candidate.chapter === trial.chapter && candidate.kind === 'intra')
      .sort((left, right) => {
        const leftDistance = Phaser.Math.Distance.Between(left.x, left.y, this.player.x, this.player.y);
        const rightDistance = Phaser.Math.Distance.Between(right.x, right.y, this.player.x, this.player.y);
        return leftDistance - rightDistance;
      });
    const chapterIntraGates = gates
      .filter((candidate) => !candidate.opened && candidate.chapter === trial.chapter && candidate.kind === 'intra')
      .sort((left, right) => {
        const leftDistance = Phaser.Math.Distance.Between(left.x, left.y, this.player.x, this.player.y);
        const rightDistance = Phaser.Math.Distance.Between(right.x, right.y, this.player.x, this.player.y);
        return leftDistance - rightDistance;
      });

    if (closedIntraGates.length > 0) {
      this.setQuestGateState(closedIntraGates[0], true, true);
      this.refreshQuestJournal();
      return 'opened';
    }

    if (chapterIntraGates.length > 0) {
      this.setQuestGateState(chapterIntraGates[0], true, true);
      this.refreshQuestJournal();
      return 'opened';
    }

    const targetChapter = Math.min(4, trial.chapter + 1) as 1 | 2 | 3 | 4;
    const nextTrial = this.getNextQuestTrialForChapter(targetChapter);
    const targetX = nextTrial?.x ?? this.player.x;
    const targetY = nextTrial?.y ?? this.player.y;
    const gate = connectedGates
      .filter((candidate) => candidate.chapter === targetChapter && candidate.kind === 'frontier')
      .sort((left, right) => {
        const leftDistance = Phaser.Math.Distance.Between(left.x, left.y, targetX, targetY);
        const rightDistance = Phaser.Math.Distance.Between(right.x, right.y, targetX, targetY);
        return leftDistance - rightDistance;
      })[0]
      ?? connectedGates.find((candidate) => candidate.chapter === targetChapter)
      ?? connectedGates[0]
      ?? gates.find((candidate) => !candidate.opened && candidate.chapter === targetChapter && candidate.kind === 'frontier')
      ?? gates.find((candidate) => !candidate.opened && candidate.chapter <= trial.chapter);

    if (!gate) {
      const blockedGate = connectedGates.find((candidate) => this.getQuestGateBlockingRelic(candidate))
        ?? gates.find((candidate) => !candidate.opened && !!this.getQuestGateBlockingRelic(candidate));
      return blockedGate ? 'blocked' : 'clear';
    }

    if (this.getQuestGateBlockingRelic(gate)) {
      return 'blocked';
    }

    this.setQuestGateState(gate, true, true);
    this.refreshQuestJournal();
    return 'opened';
  }

  private refreshQuestJournal(): void {
    if (!this.questJournalText) {
      return;
    }

    if (this.gameMode !== 'quest') {
      this.questJournalText.setText('');
      return;
    }

    const openedChests = this.treasureChests ? (this.treasureChests.getChildren() as TreasureChest[]).filter((chest) => chest.opened).length : 0;
    const totalChests = this.treasureChests ? this.treasureChests.getLength() : 0;
    const nextRelic = this.getQuestNextRelic();
    const bossStatus = this.questBoss?.defeated
      ? 'X'
      : this.questBoss?.engaged
        ? '!'
        : this.questBoss?.awakened ? '^' : '-';

    if (this.questViewMode === 'dungeon') {
      this.questJournalText.setText('');
      return;
    }

    this.questJournalText.setText([
      `K ${this.questRelics.has('brass-key') ? '*' : '-'}  B ${this.questRelics.has('river-boat') ? '*' : '-'}  A ${this.questRelics.has('sun-axe') ? '*' : '-'}  Q ${this.armoryShots}`,
      `W ${this.correctAnswers}/12  C ${openedChests}/${totalChests}  G ${nextRelic?.shortLabel ?? 'DRG'}  D ${bossStatus}`,
    ]);
  }

  private refreshStageHud(): void {
    if (this.gameMode === 'quest') {
      const encounter = this.getQuestEncounter();
      this.levelText.setText(this.questViewMode === 'dungeon' ? `Mtn ${this.level}` : `Mtn ${this.level}: ${encounter.chapterTitle}`);
      this.modeText.setText(this.getQuestObjectiveText());
      this.phaseText.setText(this.questViewMode === 'dungeon' ? '' : `${encounter.foeName} inside. Party ${this.lives}.`);
      this.refreshQuestJournal();
      this.refreshQuestOverworldPanel();
      return;
    }

    this.levelText.setText(`Level ${this.level}: ${this.getStageModeLabel(this.currentStageMode)}`);
    this.modeText.setText(`Arcade mode: ${this.getStageModeLabel(this.currentStageMode)}`);
    this.phaseText.setText(this.getPhaseDescription(this.level));
  }

  private refreshScoreHud(): void {
    this.scoreText.setText(this.gameMode === 'quest' ? `Renown ${this.score}` : `Score: ${this.score}`);
  }

  private refreshArmoryHud(): void {
    const label = this.armoryShots === 1 ? (this.gameMode === 'quest' ? 'arrow' : 'shot') : (this.gameMode === 'quest' ? 'arrows' : 'shots');
    this.armoryText.setText(this.gameMode === 'quest' ? `Quiver: ${this.armoryShots} ${label}` : `Armory: ${this.armoryShots} ${label}`);
  }

  private refreshVitalHud(): void {
    if (this.gameMode === 'quest') {
      this.livesText.setText(`Party: ${this.lives}  HP: ${this.heroHp}/${this.heroMaxHp}`);
      this.refreshQuestPlayerPresentation();
      return;
    }

    this.livesText.setText(`Lives: ${this.lives}`);
  }

  private async initializeTracker(): Promise<void> {
    try {
      const approvedCustomQuestions = await fetchApprovedCustomQuestions();
      const questionBank = [...questions, ...approvedCustomQuestions];
      this.questionBankSnapshot = questionBank;
      const flaggedQuestionIds = await initializeQuestionTracker(questionBank);
      this.questionDeck.setQuestionBank(questionBank);
      this.questionDeck.setExcludedQuestionIds(flaggedQuestionIds);
      this.trackerReady = true;
      this.nextQuestion();
      this.resetPlayer();
      if (this.gameMode === 'quest') {
        this.setExplanationMessage(this.getQuestEncounter().introText, `${this.getQuestEncounter().chapterTitle}. Enter mountain.`);
      }
    } catch {
      this.promptText.setText('Question tracker backend unavailable');
      this.categoryText.setText('Start the backend server to enable CSV logging and question flagging.');
      this.setExplanationMessage('Run the combined dev command so the game can save question stats to the backend CSV file.', 'Start tracker backend.');
    }
  }

  private async trackFlagQuestion(): Promise<void> {
    try {
      const flaggedQuestionIds = await flagQuestion(this.currentQuestion);
      this.questionDeck.setExcludedQuestionIds(flaggedQuestionIds);
      this.setExplanationMessage('Question flagged. Removed from future draws and logged to the tracker.', 'Question flagged.');

      this.time.delayedCall(300, () => {
        this.nextQuestion();
        this.resetPlayer();
      });
    } catch {
      this.acceptingAnswer = true;
      this.setExplanationMessage('Tracker could not flag that question. Check that the backend server is running.', 'Flag failed.');
    }
  }

  private async track(action: Promise<void>, message: string): Promise<void> {
    try {
      await action;
    } catch {
      this.setExplanationMessage(message);
    }
  }

  private getStageModeForLevel(level: 1 | 2 | 3 | 4): StageMode {
    switch (level) {
      case 1:
        return 'frogger';
      case 2:
        return 'galaga';
      case 3:
        return 'centipede';
      case 4:
        return 'exam';
    }
  }

  private getStageModeLabel(mode: StageMode): string {
    switch (mode) {
      case 'frogger':
        return 'Frogger Traffic';
      case 'galaga':
        return 'Galaga Sweep';
      case 'centipede':
        return 'Centipede Weave';
      case 'exam':
        return 'Final Exam Rush';
    }
  }

  private getModeSpeedMultiplier(): number {
    switch (this.currentStageMode) {
      case 'frogger':
        return 1;
      case 'galaga':
        return 1.1;
      case 'centipede':
        return 1.18;
      case 'exam':
        return 1.28;
    }
  }

  private beginInvulnerabilityWindow(): void {
    this.invulnerable = true;
    this.player.clearTint();

    this.invulnerabilityTween?.stop();
    this.invulnerabilityTween = this.tweens.add({
      targets: this.player,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.player.setAlpha(1);
        this.invulnerable = false;
      },
    });
  }

  private showLevelBanner(): void {
    this.bannerText.setText(this.gameMode === 'quest'
      ? `Chapter ${this.level}\n${this.getQuestEncounter().chapterTitle}`
      : `Level ${this.level}\n${this.getStageModeLabel(this.currentStageMode)}`);
    this.bannerText.setScale(0.8);
    this.bannerText.setAlpha(0);

    this.tweens.killTweensOf(this.bannerText);
    this.tweens.add({
      targets: this.bannerText,
      alpha: 1,
      scale: 1,
      duration: 220,
      ease: 'Back.Out',
      yoyo: true,
      hold: 500,
    });
  }

  private showCustomBanner(text: string): void {
    this.bannerText.setText(text);
    this.bannerText.setScale(1);
    this.bannerText.setAlpha(0);

    this.tweens.killTweensOf(this.bannerText);
    this.tweens.add({
      targets: this.bannerText,
      alpha: 1,
      duration: 90,
      ease: 'Stepped',
      yoyo: true,
      hold: 360,
    });
  }

  private clearTreasureLootCard(): void {
    this.treasureLootTimer?.remove(false);
    this.treasureLootTimer = undefined;
    if (this.treasureLootCard) {
      this.treasureLootCard.destroy(true);
      this.treasureLootCard = undefined;
    }
  }

  private showTreasureLootCard(summary: TreasureLootSummary): void {
    this.clearTreasureLootCard();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 - 18;
    const panelDepth = 34;
    const chromeColor = Phaser.Display.Color.IntegerToColor(summary.accentColor).lighten(12).color;
    const panel = this.pinToScreen(this.add.container(0, 0)).setDepth(panelDepth).setAlpha(0);
    const backdrop = this.add.rectangle(centerX, centerY, 520, 244, 0x07111a, 0.96)
      .setStrokeStyle(2, chromeColor, 0.9);
    const accentBar = this.add.rectangle(centerX - 214, centerY, 10, 208, summary.accentColor, 0.95);
    const kicker = this.add.text(centerX - 186, centerY - 92, 'CHEST OPENED', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffe8a8',
      fontStyle: 'bold',
    });
    const title = this.add.text(centerX - 186, centerY - 60, summary.title.toUpperCase(), {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#f4f7fb',
      fontStyle: 'bold',
      wordWrap: { width: 360 },
    });
    const meta = this.add.text(centerX - 186, centerY - 22, `${summary.rarity} ${summary.category}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#8fd6ff',
      fontStyle: 'bold',
    });
    const benefits = this.add.text(centerX - 186, centerY + 14, summary.benefitLines.join('\n'), {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#dff6ff',
      lineSpacing: 8,
      wordWrap: { width: 362 },
    });
    const flavor = this.add.text(centerX - 186, centerY + 106, summary.summary, {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#b7c9da',
      fontStyle: 'italic',
      wordWrap: { width: 372 },
    });

    panel.add([backdrop, accentBar, kicker, title, meta, benefits, flavor]);
    this.treasureLootCard = panel;

    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 140,
      ease: 'Sine.Out',
    });

    this.treasureLootTimer = this.time.delayedCall(3200, () => {
      if (!this.treasureLootCard) {
        return;
      }

      this.tweens.add({
        targets: this.treasureLootCard,
        alpha: 0,
        duration: 220,
        ease: 'Sine.In',
        onComplete: () => this.clearTreasureLootCard(),
      });
    });
  }

  private getPhaseDescription(level: 1 | 2 | 3 | 4): string {
    switch (level) {
      case 1:
        return 'Stage feel: clean lane traffic with one simple movement rule to read';
      case 2:
        return 'Stage feel: add a repeating vertical sway while the lanes keep their core pattern';
      case 3:
        return 'Stage feel: add patterned speed pulses on top of the weave so each lane has rhythm';
      case 4:
        return 'Stage feel: combine sway, weave, and speed pulses into a readable final exam pattern';
    }
  }

  private getQuestEncounter(chapter = this.questViewMode === 'dungeon' ? this.activeQuestTravelChapter : this.level): QuestEncounter {
    return QUEST_ENCOUNTERS[chapter - 1];
  }

  private isQuestBossDefeatedForChapter(chapter: 1 | 2 | 3 | 4): boolean {
    return this.defeatedQuestBossChapters.has(chapter);
  }

  private syncQuestBossToChapter(chapter: 1 | 2 | 3 | 4): void {
    if (!this.questBoss || !this.questBossAltar) {
      return;
    }

    const bossSpawn = this.questBossSpawns.get(chapter);
    if (!bossSpawn) {
      return;
    }

    this.questBoss.chapter = chapter;
    this.questBoss.title = this.getQuestEncounter(chapter).foeName;
    this.questBoss.chamber = bossSpawn.chamber;
    this.questBoss.setPosition(bossSpawn.bossX, bossSpawn.bossY);
    this.questBoss.awakened = false;
    this.questBoss.engaged = false;
    this.questBoss.defeated = this.isQuestBossDefeatedForChapter(chapter);

    this.questBossAltar.setPosition(bossSpawn.altarX, bossSpawn.altarY);
    this.questBossPillars.forEach((pillar) => {
      pillar.orbitRadius = bossSpawn.orbitRadius;
      pillar.setPosition(bossSpawn.altarX, bossSpawn.altarY);
      pillar.body.updateFromGameObject();
    });

    this.questBossHazards?.clear(true, true);
  }

  private getQuestRelicForUnlockChapter(chapter: 2 | 3 | 4): QuestRelic | undefined {
    return QUEST_RELICS.find((relic) => relic.unlocksChapter === chapter);
  }

  private getQuestRelicForChest(chest?: TreasureChest): QuestRelic | undefined {
    if (!chest || chest.chapter === 4) {
      return undefined;
    }

    const relic = QUEST_RELICS.find((candidate) => candidate.sourceChapter === chest.chapter);
    if (!relic || this.questRelics.has(relic.key)) {
      return undefined;
    }

    return relic;
  }

  private getQuestNextRelic(): QuestRelic | undefined {
    return QUEST_RELICS.find((relic) => !this.questRelics.has(relic.key));
  }

  private getQuestGateBlockingRelic(gate: QuestGate): QuestRelic | undefined {
    if (gate.kind !== 'frontier' || gate.chapter <= 1) {
      return undefined;
    }

    const relic = this.getQuestRelicForUnlockChapter(gate.chapter as 2 | 3 | 4);
    if (!relic || this.questRelics.has(relic.key)) {
      return undefined;
    }

    return relic;
  }

  private getQuestLevelFromRelics(): 1 | 2 | 3 | 4 {
    return Math.min(4, 1 + this.questRelics.size) as 1 | 2 | 3 | 4;
  }

  private hasRemainingQuestTrials(chapter?: 1 | 2 | 3 | 4): boolean {
    if (!this.questTrials) {
      return false;
    }

    return (this.questTrials.getChildren() as QuestTrial[]).some((trial) => !trial.solved && (chapter === undefined || trial.chapter === chapter));
  }

  private getQuestObjectiveText(): string {
    const activeChapter = this.questViewMode === 'dungeon' ? this.activeQuestTravelChapter : this.level;
    const nextRelic = this.getQuestNextRelic();
    if (nextRelic) {
      if (this.questViewMode === 'dungeon' && !this.hasRemainingQuestTrials(activeChapter) && !this.isQuestBossDefeatedForChapter(activeChapter)) {
        return `Face ${this.getQuestEncounter(activeChapter).foeName}.`;
      }

      return `Seek ${nextRelic.shortLabel}.`;
    }

    if (this.isQuestBossDefeatedForChapter(4)) {
      return 'Return home.';
    }

    if (this.questBoss?.awakened) {
      return this.questBoss.chapter === 4 ? 'Find the crown.' : `Defeat ${this.questBoss.title}.`;
    }

    return `Face ${this.getQuestEncounter(activeChapter).foeName}.`;
  }

  private getQuestMonsterTextureKey(hiddenName: string): string {
    switch (hiddenName.toLowerCase()) {
      case 'bat':
        return 'quest-monster-bat';
      case 'spider':
        return 'quest-monster-spider';
      case 'wraith':
        return 'quest-monster-wraith';
      case 'drake':
        return 'quest-monster-drake';
      case 'crawler':
        return 'quest-monster-crawler';
      case 'wing guard':
        return 'quest-monster-wing-guard';
      default:
        return 'quest-monster';
    }
  }

  private getQuestChapterMonsterPool(chapter: 1 | 2 | 3 | 4): string[] {
    return QUEST_CHAPTER_MONSTER_POOLS[chapter] ?? QUEST_MONSTER_NAMES;
  }

  private loseLatestQuestRelic(): QuestRelic | undefined {
    const lostKey = this.questRelicOrder.pop();
    if (!lostKey) {
      return undefined;
    }

    this.questRelics.delete(lostKey);
    const relic = QUEST_RELICS.find((candidate) => candidate.key === lostKey);
    if (!relic) {
      return undefined;
    }

    switch (relic.key) {
      case 'brass-key':
        this.armoryShots = Math.max(0, this.armoryShots - 1);
        break;
      case 'river-boat':
        this.questArmorTier = Math.max(0, this.questArmorTier - 1);
        this.heroMaxHp = Math.max(26, this.heroMaxHp - 5);
        break;
      case 'sun-axe':
        this.questWeaponTier = Math.max(0, this.questWeaponTier - 1);
        this.armoryShots = Math.max(0, this.armoryShots - 2);
        break;
    }

    this.heroHp = Math.min(this.heroHp, this.heroMaxHp);
    this.defeatedQuestBossChapters.delete(relic.sourceChapter);
    this.reopenQuestRelicChest(relic.sourceChapter);
    return relic;
  }

  private reopenQuestRelicChest(chapter: 1 | 2 | 3): void {
    if (!this.treasureChests) {
      return;
    }

    const chest = (this.treasureChests.getChildren() as TreasureChest[]).find((candidate) => candidate.chapter === chapter);
    if (!chest) {
      return;
    }

    chest.opened = false;
    chest.enableBody(true, chest.x, chest.y, true, true);
    chest.setVisible(true);
    chest.setActive(true);
    chest.setTint(this.getQuestChapterTint(chest.chapter));
    chest.setDepth(4);
  }

  private getQuestionHeaderText(question: MathQuestion): string {
    if (this.gameMode === 'quest') {
      if (this.currentQuestionSource === 'boss') {
        return `${this.getQuestEncounter().foeName} chamber / ${getCategoryLabel(question.category)} / boss ward`;
      }

      const reward = this.getQuestRewardProfile(question);
      const relic = this.getQuestRelicForChest(this.activeTreasureChest);
      return this.currentQuestionSource === 'treasure'
        ? relic
          ? `Relic cache / ${getCategoryLabel(question.category)} / ${relic.title}`
          : `Cache ward / ${getCategoryLabel(question.category)} / +${reward.hpGain} HP, +${reward.runeGain} arrow${reward.runeGain === 1 ? '' : 's'}`
        : `Gate ward / ${getCategoryLabel(question.category)} / +${reward.hpGain} HP`;
    }

    return `Question type: ${getCategoryLabel(question.category)} | Difficulty: ${getDifficultyLabel(question.difficulty)}`;
  }

  private getQuestRewardProfile(question: MathQuestion = this.currentQuestion): { hpGain: number; runeGain: number } {
    const answerText = question.options[question.answerIndex];
    const numericValue = this.extractAnswerMagnitude(answerText);
    const simplicityBonus = 7 - question.difficulty;
    const answerBonus = numericValue === null ? 1 : Phaser.Math.Clamp(Math.round(Math.log10(Math.abs(numericValue) + 1) * 3), 1, 4);

    return {
      hpGain: simplicityBonus + answerBonus + this.questMagicTier,
      runeGain: 1 + Math.min(1, this.questWeaponTier),
    };
  }

  private extractAnswerMagnitude(answerText: string): number | null {
    const fractionMatch = answerText.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/);
    if (fractionMatch) {
      const numerator = Number(fractionMatch[1]);
      const denominator = Number(fractionMatch[2]);
      if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }

    const numericMatch = answerText.match(/-?\d+(?:\.\d+)?/);
    if (!numericMatch) {
      return null;
    }

    const value = Number(numericMatch[0]);
    return Number.isFinite(value) ? value : null;
  }

  private getQuestDamageTaken(): number {
    const bossPenalty = this.currentQuestionSource === 'boss' ? 2 : 0;
    return Math.max(1, 3 + this.currentQuestion.difficulty + this.level + bossPenalty - this.questArmorTier);
  }

  private getLevelAdvanceMessage(): string {
    if (this.gameMode === 'quest') {
      return `${this.getQuestEncounter().chapterTitle} opens. ${this.getQuestEncounter().introText}`;
    }

    return `Level up: ${this.getStageModeLabel(this.currentStageMode)}.`;
  }

  private handleHiddenMonsterContact(monster: HiddenMonster): void {
    if (this.gameMode !== 'quest' || this.gameOver || this.recovering || !monster.active || monster.defeated) {
      return;
    }

    if (!monster.revealed) {
      this.revealHiddenMonster(
        monster,
        `${monster.hiddenName} blocks the corridor. Draw and fire.`,
        `${monster.hiddenName} revealed`,
      );
      return;
    }

    if (this.invulnerable || this.time.now < monster.lastContactAt) {
      return;
    }

    monster.lastContactAt = this.time.now + 650;
    const damage = this.getQuestMonsterContactDamage(monster);
    this.heroHp = Math.max(0, this.heroHp - damage);
    this.refreshVitalHud();
    this.spawnImpactBurst(this.player.x, this.player.y, monster.accentColor, false);
    this.playImpactTone(180, 120, 0.08, 0.03);
    this.beginInvulnerabilityWindow();
    this.setExplanationMessage(`${monster.hiddenName} strikes for ${damage} damage. Fire back.`, `${monster.hiddenName} hit ${damage}.`);

    if (this.heroHp <= 0) {
      this.handleQuestReincarnation(`${monster.hiddenName} brought the party down.`);
    }
  }

  private handleQuestShotMonsterHit(shot: Phaser.Physics.Arcade.Image, monster: HiddenMonster): void {
    if (!monster.active || monster.defeated) {
      return;
    }

    const questShot = shot as QuestShot;
    questShot.disableBody(true, true);
    if (!monster.revealed) {
      this.revealHiddenMonster(
        monster,
        `You flushed out ${monster.hiddenName}. Keep firing.`,
        'Shadow disturbed',
      );
    }

    const damage = questShot.damage ?? this.getQuestWeaponDamage();
    monster.hp = Math.max(0, monster.hp - damage);
    this.spawnImpactBurst(monster.x, monster.y, monster.accentColor ?? 0x7dd3fc, false);
    if (monster.hp <= 0) {
      this.setExplanationMessage(this.defeatHiddenMonster(monster), `${monster.hiddenName} down.`);
      return;
    }

    monster.setTintFill(monster.accentColor ?? 0x7dd3fc);
    this.tweens.add({
      targets: monster,
      alpha: 0.45,
      duration: 70,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        if (monster.active) {
          monster.clearTint();
          monster.setTint(monster.accentColor);
          monster.setAlpha(0.92);
        }
      },
    });
    this.setExplanationMessage(
      `${monster.hiddenName} takes ${damage} damage from your weapon. ${monster.hp} hit${monster.hp === 1 ? '' : 's'} left.`,
      `${monster.hiddenName} hit. ${monster.hp} left.`,
    );
  }

  private spawnQuestBossEmberVolley(): void {
    const boss = this.questBoss;
    if (!boss) {
      return;
    }

    const baseAngle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
    const offsets = [-0.28, 0, 0.28];
    const speed = 178;
    offsets.forEach((offset) => {
      this.spawnQuestBossHazard(
        boss.x + Math.cos(baseAngle + offset) * 24,
        boss.y + Math.sin(baseAngle + offset) * 24,
        Math.cos(baseAngle + offset) * speed,
        Math.sin(baseAngle + offset) * speed,
        2,
        'ember',
      );
    });
    this.playImpactTone(210, 320, 0.12, 0.035);
  }

  private spawnQuestBossHazard(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    damage: number,
    pattern: 'ember' | 'sweep',
  ): void {
    if (!this.questBossHazards) {
      return;
    }

    const hazard = this.physics.add.image(x, y, 'quest-boss-flare') as QuestBossHazard;
    hazard.damage = damage;
    hazard.spawnedAt = this.time.now;
    hazard.pattern = pattern;
    hazard.setVelocity(velocityX, velocityY);
    hazard.setDepth(5.2);
    hazard.setScale(pattern === 'ember' ? 0.9 : 1.1);
    hazard.setTint(pattern === 'ember' ? 0xffcf7a : 0xfb7185);
    this.questBossHazards.add(hazard);
  }

  private handleQuestBossHazardHit(hazard: QuestBossHazard): void {
    if (this.gameOver || this.recovering || this.invulnerable || !hazard.active) {
      return;
    }

    this.destroyQuestBossHazard(hazard, false);
    this.heroHp = Math.max(0, this.heroHp - hazard.damage);
    this.refreshVitalHud();
    this.spawnImpactBurst(this.player.x, this.player.y, 0xfb7185, false);
    this.playImpactTone(180, 110, 0.09, 0.035);
    this.cameras.main.shake(100, 0.0035);
    this.beginInvulnerabilityWindow();
    this.setExplanationMessage(
      hazard.pattern === 'ember'
        ? `The Cloudy Dragon's ember volley hits for ${hazard.damage} damage. Keep moving while you answer.`
        : `Sweeping flame licks across the altar chamber for ${hazard.damage} damage. Shift position and finish the trial.`,
      hazard.pattern === 'ember' ? `Ember hit ${hazard.damage}.` : `Flame hit ${hazard.damage}.`,
    );

    if (this.heroHp <= 0) {
      this.handleQuestReincarnation('The Cloudy Dragon burned through the party.');
    }
  }

  private handleQuestBossPillarHit(pillar: QuestBossPillar): void {
    if (!this.isQuestBossPillarActive() || this.gameOver || this.recovering || this.invulnerable || !pillar.body.enable) {
      return;
    }

    this.heroHp = Math.max(0, this.heroHp - pillar.damage);
    this.refreshVitalHud();
    this.spawnImpactBurst(this.player.x, this.player.y, 0xffcf7a, false);
    this.playImpactTone(220, 120, 0.08, 0.03);
    this.cameras.main.shake(90, 0.003);
    this.beginInvulnerabilityWindow();
    this.setExplanationMessage(
      this.isQuestBossEnraged()
        ? `The ${this.getQuestBossPillarFormationLabel()} slams into the party for ${pillar.damage} damage. The chamber tightens as the dragon enrages.`
        : `The ${this.getQuestBossPillarFormationLabel()} clips the party for ${pillar.damage} damage. Read the formation before you answer.`,
      `${this.getQuestBossPillarFormationLabel()} hit ${pillar.damage}.`,
    );

    if (this.heroHp <= 0) {
      this.handleQuestReincarnation('The altar wards shattered the party.');
    }
  }

  private destroyQuestBossHazard(hazard: QuestBossHazard, shotDown: boolean): void {
    if (!hazard.active) {
      return;
    }

    this.spawnImpactBurst(hazard.x, hazard.y, shotDown ? 0x7dd3fc : 0xfb7185, false);
    if (shotDown) {
      this.showFloatingLabel(hazard.x, hazard.y - 18, 'ember split', 0x7dd3fc);
    }
    hazard.disableBody(true, true);
    hazard.destroy();
  }

  private resolveQuestTrial(trial: QuestTrial): string {
    trial.solved = true;
    trial.disableBody(true, true);
    this.spawnImpactBurst(trial.x, trial.y, 0xffcf7a, true);
    this.showFloatingLabel(trial.x, trial.y - 24, 'Seal broken', 0xffcf7a);
    this.activeQuestTrial = undefined;
    this.refreshQuestTrials();
    const gateResult = this.openQuestGateForChapter(trial);
    if (gateResult === 'opened') {
      return this.isQuestDungeonMode() ? 'Seal broken. Gate opens.' : 'The seal shatters and a nearby gate slides open.';
    }

    if (gateResult === 'blocked') {
      const nextRelic = this.getQuestNextRelic();
      return this.isQuestDungeonMode()
        ? `Seal broken. ${nextRelic?.title ?? 'Relic'} needed.`
        : `The seal shatters, but the mountain pass still needs the ${nextRelic?.title ?? 'next relic'}.`;
    }

    return this.isQuestDungeonMode() ? 'Seal broken. Path clear.' : 'The seal shatters and the route ahead stays clear.';
  }

  private armFinalBossTrial(): void {
    if (!this.questBoss || this.questBoss.defeated) {
      return;
    }

    const encounter = this.getQuestEncounter(this.activeQuestTravelChapter);
    this.openQuestIntraGatesForChapter(this.activeQuestTravelChapter, false);
    this.setFocusedQuestGate(undefined);
    this.activeQuestTrial = undefined;
    this.activeTreasureChest = undefined;
    this.questBoss.awakened = true;
    this.questBoss.engaged = false;
    this.lastBossAttackAt = 0;
    this.bossAttackStep = 0;
    this.questBossHazards?.clear(true, true);
    this.refreshQuestBoss();
    this.assignQuestBossQuestion();
    this.refreshQuestChoices();
    this.refreshQuestTrials();
    this.refreshQuestJournal();
    this.updateProgressText();
    this.showCustomBanner(`Boss Chamber\n${encounter.foeName}`);
    this.playQuestCue('boss-awaken');
    this.setExplanationMessage(
      this.activeQuestTravelChapter === 4
        ? 'The summit wards break. The Cloudy Dragon wakes in the altar chamber. Reach the chamber and engage the final trial.'
        : `${encounter.foeName} wakes in the mountain chamber. Reach the boss and finish the final ward to claim the cache.`,
      this.activeQuestTravelChapter === 4 ? 'Dragon wakes. Reach altar.' : `${encounter.foeName} wakes. Reach chamber.`,
    );
  }

  private handleQuestBossContact(boss: QuestBoss): void {
    if (this.gameMode !== 'quest' || this.gameOver || this.recovering || boss.defeated || !boss.awakened) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, boss.x, boss.y);
    if (distance > QUEST_BOSS_CONTACT_RADIUS) {
      return;
    }

    boss.engaged = true;
    this.lastBossAttackAt = this.time.now - 200;
    this.refreshQuestBoss();
    this.updateProgressText();
    this.setExplanationMessage(
      boss.chapter === 4
        ? 'The Cloudy Dragon descends over the altar. Answer the final trial now and dodge the chamber fire.'
        : `${boss.title} charges from the chamber. Answer the boss trial now and keep firing.`,
      boss.chapter === 4 ? 'Dragon engaged. Answer now.' : `${boss.title} engaged.`,
    );
  }

  private handleQuestBossShot(shot: Phaser.Physics.Arcade.Image, boss: QuestBoss): void {
    if (!boss.awakened || boss.defeated) {
      return;
    }

    shot.disableBody(true, true);
    this.spawnImpactBurst(boss.x, boss.y, 0xfb7185, false);
    this.setExplanationMessage(
      this.questBoss?.chapter === 4
        ? 'Arrows only distract the dragon. The final blow comes from solving the altar trial.'
        : `Your shots stagger ${boss.title}, but the boss ward must still be solved to finish the fight.`,
      this.questBoss?.chapter === 4 ? 'Arrows do not kill it.' : 'Boss ward remains.',
    );
  }

  private resolveQuestBoss(): void {
    if (!this.questBoss) {
      return;
    }

    const bossChapter = this.questBoss.chapter;
    const bossTitle = this.questBoss.title;
    this.questBoss.defeated = true;
    this.defeatedQuestBossChapters.add(bossChapter);
    this.questBoss.engaged = false;
    this.questBossHazards?.clear(true, true);
    this.score += 500;
    this.currentQuestionSource = 'standard';
    this.activeQuestTrial = undefined;
    this.activeTreasureChest = undefined;
    this.setFocusedQuestGate(undefined);
    this.refreshScoreHud();
    this.refreshQuestBoss();
    this.refreshQuestJournal();
    this.spawnImpactBurst(this.questBoss.x, this.questBoss.y, 0xffcf7a, true);
    this.showFloatingLabel(this.questBoss.x, this.questBoss.y - 32, `${bossTitle} fallen`, 0xffcf7a);
    this.playQuestCue('boss-fall');

    if (bossChapter < 4) {
      this.showCustomBanner(`${bossTitle}\nDefeated`);
      this.setExplanationMessage(
        `${bossTitle} falls. The chapter cache is open.`,
        `${bossTitle} down. Cache open.`,
      );
      this.refreshQuestTrials();
      this.updateProgressText();
      this.time.delayedCall(GameScene.CORRECT_REVIEW_DELAY_MS, () => {
        if (this.gameMode !== 'quest' || this.gameOver) {
          return;
        }

        this.nextQuestion();
        this.resumeQuestAfterDamage();
      });
      return;
    }

    this.showTreasureLootCard({
      title: 'Crown of Kings',
      category: 'Relic',
      rarity: 'Mythic',
      summary: 'The summit crown is yours. Carry it back to the cabin to finish the quest.',
      benefitLines: ['+500 renown', 'Cloudy Dragon defeated', 'Return to the cabin to win'],
      accentColor: 0xffcf7a,
    });
    this.showCustomBanner('Crown of Kings\nClaimed');
    this.time.delayedCall(900, () => {
      const surfacePoint = this.getQuestSurfaceMarkerPosition(4);
      this.setQuestViewMode('overworld', 4);
      this.player.setPosition(surfacePoint.x, surfacePoint.y + 86);
      this.lastQuestTravelAt = this.time.now;
      this.questTravelBlockedUntil = this.time.now + 1400;
      this.setFocusedQuestGate(undefined);
      this.updateProgressText();
      this.setExplanationMessage('The crown is won. Carry it back to the cabin.', 'Return home with crown.');
    });
  }

  private defeatHiddenMonster(monster: HiddenMonster): string {
    monster.defeated = true;
    monster.clueMarker?.destroy();
    monster.disableBody(true, true);
    this.score += monster.rewardScore + this.questWeaponTier * 40;
    this.refreshScoreHud();
    this.refreshQuestJournal();
    this.spawnImpactBurst(monster.x, monster.y, 0x7dd3fc, true);
    this.showFloatingLabel(monster.x, monster.y - 24, `${monster.hiddenName} defeated`, 0xffe082);
    return this.isQuestDungeonMode()
      ? `${monster.hiddenName} down. +${monster.rewardScore}.`
      : `${monster.hiddenName} dissolves and grants ${monster.rewardScore} bonus renown.`;
  }

  private handleTreasureChestContact(chest: TreasureChest): void {
    if (this.gameMode !== 'quest' || chest.opened || this.gameOver || this.recovering || !this.acceptingAnswer || this.currentQuestionSource === 'treasure') {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
    if (distance > QUEST_TREASURE_CONTACT_RADIUS) {
      return;
    }

    if (!this.isQuestBossDefeatedForChapter(chest.chapter)) {
      this.setExplanationMessage(
        `${this.getQuestEncounter(chest.chapter).foeName} guards this cache. Break every seal in the mountain and defeat the boss first.`,
        `${this.getQuestEncounter(chest.chapter).foeName} guards cache.`,
      );
      return;
    }

    const wordProblems = this.questionBankSnapshot.filter((question) => question.category === 'word-problem');
    if (wordProblems.length === 0) {
      this.setExplanationMessage('This chest is sealed, but no word-problem treasure prompts are available.', 'Chest sealed. No cache riddle.');
      return;
    }

    const treasureQuestion = Phaser.Utils.Array.GetRandom(wordProblems);
    chest.opened = true;
    this.activeTreasureChest = chest;
    this.currentQuestion = treasureQuestion;
    this.currentQuestionSource = 'treasure';
    this.setFocusedQuestGate(undefined);
    void this.track(recordQuestionUsed(this.currentQuestion), 'Tracker could not record question usage.');
    this.refreshPromptLayout(`Treasure chest challenge: ${treasureQuestion.prompt}`);
    this.refreshSupportingDataLayout(treasureQuestion);
    this.refreshCalculatorQuestionData();
    this.categoryText.setText(this.getQuestionHeaderText(treasureQuestion));
    const relic = this.getQuestRelicForChest(chest);
    this.setExplanationMessage(
      relic
        ? `This cache is said to hide the ${relic.title}. Solve the word problem to claim it.`
        : 'This chest contains a random weapon, armour, or magic upgrade. Solve the word problem to claim it.',
      relic ? `${relic.title} cache.` : 'Cache trial.',
    );
    this.blurQuestAnswerInput(true);
    this.refreshQuestChoices();
    chest.setTint(0xffcf7a);
    this.showFloatingLabel(chest.x, chest.y - 24, 'Treasure trial', 0xffcf7a);
  }

  private resolveTreasureChestReward(chest: TreasureChest): string {
    const relic = this.getQuestRelicForChest(chest);
    const lootSummary = relic
      ? this.claimQuestRelic(relic)
      : (() => {
        const reward = this.rollTreasureUpgrade();
        reward.apply();
        return {
          title: reward.title,
          category: reward.category,
          rarity: reward.rarity,
          summary: reward.summary,
          benefitLines: reward.benefitLines,
          accentColor: reward.accentColor,
        } satisfies TreasureLootSummary;
      })();
    chest.disableBody(true, true);
    this.activeTreasureChest = undefined;
    this.currentQuestionSource = 'standard';
    this.refreshVitalHud();
    this.refreshArmoryHud();
    this.refreshScoreHud();
    this.refreshQuestJournal();
    this.showTreasureLootCard(lootSummary);
    if (relic) {
      this.level = this.getQuestLevelFromRelics();
      this.refreshQuestOverworldPanel();
      this.setFocusedQuestGate(undefined);
      this.setExplanationMessage(`${relic.title} recovered. The next mountain is unlocked. Return to camp when you're ready to continue the expedition.`, `${relic.title} won.`);
    }
    this.showFloatingLabel(chest.x, chest.y - 28, lootSummary.title, 0xffcf7a);
    return this.isQuestDungeonMode()
      ? `${lootSummary.title} claimed.`
      : `${lootSummary.title}: ${lootSummary.summary}`;
  }

  private claimQuestRelic(relic: QuestRelic): TreasureLootSummary {
    this.questRelics.add(relic.key);
    this.questRelicOrder = this.questRelicOrder.filter((key) => key !== relic.key);
    this.questRelicOrder.push(relic.key);
    this.score += 180;
    let benefitLines: string[];

    switch (relic.key) {
      case 'brass-key':
        this.armoryShots += 1;
        benefitLines = ['+1 arrow', '+180 renown', 'Opens Boat Mountain'];
        break;
      case 'river-boat':
        this.questArmorTier += 1;
        this.heroMaxHp += 5;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 5);
        benefitLines = ['+1 armor tier', '+5 max HP', '+5 HP restored', '+180 renown', 'Opens Axe Mountain'];
        break;
      case 'sun-axe':
        this.questWeaponTier += 1;
        this.armoryShots += 2;
        benefitLines = ['+1 weapon tier', '+2 arrows', '+180 renown', 'Opens Cloudy Mountain'];
        break;
    }

    this.showCustomBanner(`${relic.title}\nRecovered`);
    this.playQuestCue('relic');
    return {
      title: relic.title,
      category: 'Relic',
      rarity: 'Legendary',
      summary: relic.summary,
      benefitLines,
      accentColor: this.getQuestChapterTint(relic.sourceChapter),
    };
  }

  private rollTreasureUpgrade(): TreasureUpgrade {
    const upgrades: TreasureUpgrade[] = [
      {
        title: 'Great Bow',
        category: 'Weapon',
        rarity: 'Rare',
        summary: 'Bow power rises, the quiver fills, and the run gains renown.',
        benefitLines: ['+1 weapon tier', '+2 arrows', '+140 renown'],
        accentColor: 0xffcf7a,
        apply: () => {
          this.questWeaponTier += 1;
          this.armoryShots += 2;
          this.score += 140;
        },
      },
      {
        title: 'Mountain Cloak',
        category: 'Armor',
        rarity: 'Rare',
        summary: 'Cloak strength rises, max HP increases, and future hits soften.',
        benefitLines: ['+1 armor tier', '+5 max HP', '+5 HP restored'],
        accentColor: 0xa7f3d0,
        apply: () => {
          this.questArmorTier += 1;
          this.heroMaxHp += 5;
          this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 5);
        },
      },
      {
        title: 'Seeing Stone',
        category: 'Charm',
        rarity: 'Rare',
        summary: 'Charm strength rises, future healing improves, and one bonus arrow is stored.',
        benefitLines: ['+1 magic tier', '+3 HP restored', '+1 arrow'],
        accentColor: 0x9d8cff,
        apply: () => {
          this.questMagicTier += 1;
          this.armoryShots += 1;
          this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 3);
        },
      },
    ];

    return Phaser.Utils.Array.GetRandom(upgrades);
  }

  private endRun(title = 'Game Over', subtitle = `Final score: ${this.score}\nPress ENTER to restart`): void {
    this.gameOver = true;
    this.acceptingAnswer = false;
    this.recovering = false;
    this.clearTreasureLootCard();
    this.calculatorOpen = false;
    this.calculatorContainer.setVisible(false);
    this.physics.world.resume();
    this.player.setVelocity(0, 0);
    this.player.setTint(0xff6677);
    this.questBossHazards?.clear(true, true);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const panelDepth = 40;

    this.pinToScreen(this.add.rectangle(centerX, centerY, 680, 260, 0x02060d, 0.92).setStrokeStyle(2, 0x78cfff, 0.7).setDepth(panelDepth));
    this.pinToScreen(this.add.text(centerX, centerY - 55, title, {
      fontFamily: 'Trebuchet MS',
      fontSize: '44px',
      color: '#f4f7fb',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(panelDepth + 1));

    this.pinToScreen(this.add.text(centerX, centerY + 12, subtitle, {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#ffe082',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5).setDepth(panelDepth + 1));
  }
}
