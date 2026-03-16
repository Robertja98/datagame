import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  private generatePlayerTexture(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x133252, 1);
    graphics.fillRoundedRect(0, 0, 48, 48, 16);
    graphics.fillStyle(0x6ee7ff, 1);
    graphics.fillRoundedRect(5, 5, 38, 38, 14);
    graphics.fillStyle(0xeaffff, 0.85);
    graphics.fillCircle(17, 17, 8);
    graphics.lineStyle(3, 0xb7fbff, 1);
    graphics.strokeRoundedRect(3, 3, 42, 42, 14);
    graphics.generateTexture('player', 48, 48);
    graphics.clear();
  }

  private generateQuestPlayerTextures(graphics: Phaser.GameObjects.Graphics): void {
    const partyLayouts: Record<1 | 2 | 3, Array<[number, number]>> = {
      1: [[24, 22]],
      2: [[18, 22], [30, 22]],
      3: [[16, 24], [24, 16], [32, 24]],
    };

    ([1, 2, 3] as Array<1 | 2 | 3>).forEach((count) => {
      graphics.fillStyle(0xffffff, 1);
      partyLayouts[count].forEach(([x, y]) => {
        graphics.fillCircle(x, y, 5);
      });
      graphics.lineStyle(2, 0xdff6ff, 1);
      partyLayouts[count].forEach(([x, y]) => {
        graphics.strokeCircle(x, y, 6);
      });
      graphics.generateTexture(`quest-party-${count}`, 48, 48);
      graphics.clear();
    });

    graphics.fillStyle(0x040608, 1);
    graphics.fillCircle(24, 15, 3);
    graphics.fillRect(23, 18, 2, 10);
    graphics.fillRect(18, 21, 12, 2);
    graphics.fillRect(20, 28, 2, 8);
    graphics.fillRect(26, 28, 2, 8);
    graphics.fillRect(28, 17, 2, 14);
    graphics.fillStyle(0xe6d7a4, 1);
    graphics.fillRect(30, 15, 2, 12);
    graphics.fillRect(30, 15, 5, 2);
    graphics.generateTexture('quest-hero', 48, 48);
    graphics.clear();
  }

  private generateObstacleTextures(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x18283f, 1);
    graphics.fillRoundedRect(0, 0, 44, 34, 12);
    graphics.fillStyle(0x7dd3fc, 1);
    graphics.fillRoundedRect(4, 5, 28, 18, 8);
    graphics.fillTriangle(18, 23, 24, 23, 18, 29);
    graphics.fillStyle(0xe0f2fe, 1);
    graphics.fillRoundedRect(10, 10, 14, 4, 2);
    graphics.generateTexture('enemy-chat-bubble', 44, 34);
    graphics.clear();

    graphics.fillStyle(0x172433, 1);
    graphics.fillRoundedRect(0, 8, 52, 22, 8);
    graphics.fillStyle(0xfbbf24, 1);
    graphics.fillRoundedRect(4, 10, 44, 16, 8);
    graphics.fillStyle(0xfff7d6, 0.95);
    graphics.fillRoundedRect(8, 13, 15, 5, 2);
    graphics.fillCircle(12, 31, 4);
    graphics.fillCircle(39, 31, 4);
    graphics.generateTexture('enemy-skate-deck', 52, 36);
    graphics.clear();

    graphics.fillStyle(0x1f2937, 1);
    graphics.fillRoundedRect(4, 0, 24, 42, 10);
    graphics.fillStyle(0xfb7185, 1);
    graphics.fillRoundedRect(7, 4, 18, 34, 8);
    graphics.fillStyle(0xffe4ec, 1);
    graphics.fillRoundedRect(10, 9, 12, 3, 1);
    graphics.fillStyle(0xfda4af, 1);
    graphics.fillRoundedRect(10, 17, 12, 13, 3);
    graphics.generateTexture('enemy-energy-pop', 32, 42);
    graphics.clear();

    graphics.lineStyle(6, 0x38bdf8, 1);
    graphics.strokeCircle(21, 18, 11);
    graphics.fillStyle(0x172554, 1);
    graphics.fillRoundedRect(1, 18, 10, 15, 5);
    graphics.fillRoundedRect(31, 18, 10, 15, 5);
    graphics.fillStyle(0xe0f2fe, 0.95);
    graphics.fillCircle(21, 18, 5);
    graphics.generateTexture('enemy-beat-pod', 42, 36);
    graphics.clear();

    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(0, 4, 54, 28, 12);
    graphics.fillStyle(0xa78bfa, 1);
    graphics.fillRoundedRect(4, 8, 46, 20, 10);
    graphics.fillStyle(0xf5f3ff, 1);
    graphics.fillCircle(18, 18, 4);
    graphics.fillCircle(36, 18, 4);
    graphics.fillRoundedRect(23, 13, 8, 10, 3);
    graphics.generateTexture('enemy-pocket-console', 54, 36);
    graphics.clear();

    graphics.fillStyle(0x1f2937, 1);
    graphics.fillRoundedRect(0, 10, 50, 20, 10);
    graphics.fillStyle(0x34d399, 1);
    graphics.fillRoundedRect(4, 13, 42, 14, 8);
    graphics.fillStyle(0xd1fae5, 1);
    graphics.fillRoundedRect(10, 17, 12, 4, 2);
    graphics.fillStyle(0xa7f3d0, 1);
    graphics.fillRoundedRect(28, 16, 8, 6, 2);
    graphics.fillRoundedRect(38, 16, 4, 6, 2);
    graphics.generateTexture('enemy-sneaker-drop', 50, 34);
    graphics.clear();
  }

  private generateShotTexture(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0xffe082, 1);
    graphics.fillRoundedRect(0, 0, 10, 28, 4);
    graphics.lineStyle(2, 0xfff4bf, 1);
    graphics.strokeRoundedRect(0, 0, 10, 28, 4);
    graphics.generateTexture('shot', 10, 28);
    graphics.clear();
  }

  private generateSparkTexture(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(6, 6, 4);
    graphics.lineStyle(2, 0xfff1a8, 1);
    graphics.strokeCircle(6, 6, 5);
    graphics.generateTexture('impact-spark', 12, 12);
    graphics.clear();
  }

  private generateAnswerGateTexture(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x1a2940, 1);
    graphics.fillRoundedRect(0, 0, 220, 72, 14);
    graphics.lineStyle(3, 0x78cfff, 1);
    graphics.strokeRoundedRect(0, 0, 220, 72, 14);
    graphics.generateTexture('answer-gate', 220, 72);
    graphics.clear();
  }

  private generateQuestTextures(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x4b3317, 1);
    graphics.fillRect(6, 9, 20, 12);
    graphics.fillStyle(0x7e5c2f, 1);
    graphics.fillRect(6, 9, 20, 4);
    graphics.fillStyle(0xe2c978, 1);
    graphics.fillRect(15, 13, 2, 4);
    graphics.lineStyle(2, 0xc9ad67, 1);
    graphics.strokeRect(6, 9, 20, 12);
    graphics.generateTexture('quest-chest', 32, 28);
    graphics.clear();

    graphics.fillStyle(0x14181f, 1);
    graphics.fillRect(6, 14, 28, 14);
    graphics.fillStyle(0x74b58a, 1);
    graphics.fillRect(2, 18, 10, 6);
    graphics.fillRect(28, 18, 10, 6);
    graphics.fillStyle(0xcde9d5, 1);
    graphics.fillRect(17, 10, 6, 4);
    graphics.fillRect(17, 24, 6, 4);
    graphics.lineStyle(2, 0x8ad59f, 1);
    graphics.strokeRect(6, 14, 28, 14);
    graphics.generateTexture('quest-monster', 40, 40);
    graphics.clear();

    graphics.fillStyle(0x0d1015, 1);
    graphics.fillRect(10, 18, 20, 8);
    graphics.fillStyle(0x82d29a, 1);
    graphics.fillRect(4, 14, 10, 4);
    graphics.fillRect(26, 14, 10, 4);
    graphics.fillRect(2, 18, 8, 3);
    graphics.fillRect(30, 18, 8, 3);
    graphics.fillRect(8, 26, 4, 4);
    graphics.fillRect(28, 26, 4, 4);
    graphics.fillStyle(0xdff7e6, 1);
    graphics.fillRect(15, 17, 3, 3);
    graphics.fillRect(22, 17, 3, 3);
    graphics.generateTexture('quest-monster-bat', 40, 40);
    graphics.clear();

    graphics.fillStyle(0x13171d, 1);
    graphics.fillRect(14, 16, 12, 12);
    graphics.fillStyle(0x78b88d, 1);
    graphics.fillRect(10, 12, 4, 6);
    graphics.fillRect(26, 12, 4, 6);
    graphics.fillRect(8, 18, 4, 10);
    graphics.fillRect(28, 18, 4, 10);
    graphics.fillRect(10, 28, 4, 6);
    graphics.fillRect(26, 28, 4, 6);
    graphics.fillRect(4, 30, 4, 2);
    graphics.fillRect(32, 30, 4, 2);
    graphics.fillStyle(0xe0f4e6, 1);
    graphics.fillRect(17, 18, 2, 2);
    graphics.fillRect(21, 18, 2, 2);
    graphics.generateTexture('quest-monster-spider', 40, 40);
    graphics.clear();

    graphics.fillStyle(0x111722, 1);
    graphics.fillRect(14, 10, 12, 18);
    graphics.fillStyle(0x84c7b8, 0.92);
    graphics.fillRect(10, 14, 20, 18);
    graphics.fillRect(14, 8, 12, 6);
    graphics.fillStyle(0xd9fbff, 1);
    graphics.fillRect(16, 15, 3, 3);
    graphics.fillRect(21, 15, 3, 3);
    graphics.lineStyle(2, 0xbaf0e5, 1);
    graphics.strokeRect(11, 15, 18, 16);
    graphics.generateTexture('quest-monster-wraith', 40, 40);
    graphics.clear();

    graphics.fillStyle(0x17110c, 1);
    graphics.fillRect(10, 16, 20, 10);
    graphics.fillStyle(0x8bc29e, 1);
    graphics.fillRect(8, 14, 24, 8);
    graphics.fillRect(30, 18, 6, 4);
    graphics.fillRect(18, 10, 8, 4);
    graphics.fillRect(12, 24, 4, 6);
    graphics.fillRect(24, 24, 4, 6);
    graphics.fillStyle(0xe8f7db, 1);
    graphics.fillRect(25, 16, 3, 3);
    graphics.generateTexture('quest-monster-drake', 40, 40);
    graphics.clear();

    graphics.fillStyle(0x12161b, 1);
    graphics.fillRect(8, 18, 24, 8);
    graphics.fillStyle(0x8dbf7f, 1);
    graphics.fillRect(10, 16, 20, 6);
    graphics.fillRect(5, 20, 5, 4);
    graphics.fillRect(30, 20, 5, 4);
    graphics.fillRect(12, 26, 4, 4);
    graphics.fillRect(18, 27, 4, 4);
    graphics.fillRect(24, 26, 4, 4);
    graphics.fillStyle(0xe6f2cf, 1);
    graphics.fillRect(13, 18, 2, 2);
    graphics.fillRect(25, 18, 2, 2);
    graphics.generateTexture('quest-monster-crawler', 40, 40);
    graphics.clear();

    graphics.fillStyle(0x10141b, 1);
    graphics.fillRect(14, 12, 12, 16);
    graphics.fillStyle(0x7abdb1, 1);
    graphics.fillRect(6, 16, 28, 6);
    graphics.fillRect(10, 10, 6, 4);
    graphics.fillRect(24, 10, 6, 4);
    graphics.fillRect(16, 28, 3, 6);
    graphics.fillRect(21, 28, 3, 6);
    graphics.fillStyle(0xe6fff2, 1);
    graphics.fillRect(17, 15, 2, 2);
    graphics.fillRect(21, 15, 2, 2);
    graphics.generateTexture('quest-monster-wing-guard', 40, 40);
    graphics.clear();

    graphics.fillStyle(0xefe6be, 1);
    graphics.fillRect(6, 12, 6, 6);
    graphics.fillRect(14, 6, 6, 6);
    graphics.fillRect(22, 12, 6, 6);
    graphics.fillRect(12, 20, 10, 6);
    graphics.lineStyle(2, 0x8b6d3b, 0.9);
    graphics.strokeRect(5, 11, 8, 8);
    graphics.strokeRect(13, 5, 8, 8);
    graphics.strokeRect(21, 11, 8, 8);
    graphics.strokeRect(11, 19, 12, 8);
    graphics.generateTexture('quest-clue-tracks', 34, 32);
    graphics.clear();

    graphics.fillStyle(0xe4dcc6, 1);
    graphics.fillRect(6, 13, 22, 5);
    graphics.fillRect(13, 6, 5, 20);
    graphics.fillCircle(8, 15, 4);
    graphics.fillCircle(26, 15, 4);
    graphics.lineStyle(2, 0x8f8570, 0.9);
    graphics.strokeRect(5, 12, 24, 7);
    graphics.strokeRect(12, 5, 7, 22);
    graphics.generateTexture('quest-clue-bones', 34, 32);
    graphics.clear();

    graphics.lineStyle(3, 0xb7f0ff, 1);
    graphics.strokeCircle(12, 16, 6);
    graphics.strokeCircle(22, 16, 10);
    graphics.lineStyle(2, 0xe6fbff, 1);
    graphics.strokeCircle(12, 16, 2);
    graphics.generateTexture('quest-clue-echo', 34, 32);
    graphics.clear();

    graphics.fillStyle(0x1a140f, 1);
    graphics.fillRect(10, 3, 8, 26);
    graphics.fillStyle(0xe4cf83, 1);
    graphics.fillRect(11, 7, 6, 6);
    graphics.fillRect(11, 17, 6, 3);
    graphics.lineStyle(2, 0xf1e2ad, 1);
    graphics.strokeRect(10, 3, 8, 26);
    graphics.generateTexture('quest-trial', 28, 32);
    graphics.clear();

    graphics.fillStyle(0x311b14, 1);
    graphics.fillRect(14, 12, 26, 10);
    graphics.fillRect(8, 18, 38, 8);
    graphics.fillStyle(0xb65f3a, 1);
    graphics.fillRect(10, 18, 34, 6);
    graphics.fillStyle(0xe1c36f, 1);
    graphics.fillRect(14, 10, 4, 4);
    graphics.fillRect(34, 10, 4, 4);
    graphics.fillRect(24, 8, 6, 4);
    graphics.lineStyle(2, 0xcfaf63, 1);
    graphics.strokeRect(12, 16, 30, 10);
    graphics.generateTexture('quest-boss', 52, 34);
    graphics.clear();

    graphics.fillStyle(0xe7c76d, 1);
    graphics.fillRect(4, 4, 4, 4);
    graphics.fillStyle(0xbd6038, 1);
    graphics.fillRect(3, 3, 6, 6);
    graphics.lineStyle(1, 0xf6e2a4, 0.9);
    graphics.strokeRect(3, 3, 6, 6);
    graphics.generateTexture('quest-boss-flare', 12, 12);
    graphics.clear();
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const launchMode = (gameMode: 'arcade' | 'quest'): void => {
      this.scene.start('game', { gameMode });
    };
    const openPage = (path: string): void => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    };
    const createMenuLink = (x: number, y: number, label: string, path: string, color: string): Phaser.GameObjects.Text => {
      const link = this.add.text(x, y, label, {
        fontFamily: 'Trebuchet MS',
        fontSize: '17px',
        color,
        fontStyle: 'bold',
      }).setOrigin(0.5);

      link.setInteractive({ useHandCursor: true });
      link.setAlpha(0.9);
      link.on('pointerover', () => {
        link.setAlpha(1);
        link.setScale(1.03);
      });
      link.on('pointerout', () => {
        link.setAlpha(0.9);
        link.setScale(1);
      });
      link.on('pointerdown', () => {
        openPage(path);
      });

      return link;
    };

    const graphics = this.add.graphics();

    this.generatePlayerTexture(graphics);
    this.generateQuestPlayerTextures(graphics);
    this.generateObstacleTextures(graphics);
    this.generateShotTexture(graphics);
    this.generateSparkTexture(graphics);
    this.generateAnswerGateTexture(graphics);
    this.generateQuestTextures(graphics);
    graphics.destroy();

    this.add.rectangle(centerX, height / 2, width - 180, height - 170, 0x08131f, 0.72).setStrokeStyle(2, 0x2a587c, 0.7);
    this.add.rectangle(centerX, height / 2 + 58, width - 360, 260, 0x102238, 0.88).setStrokeStyle(2, 0x78cfff, 0.35);
    this.add.rectangle(centerX, height - 146, 720, 142, 0x0d1d30, 0.88).setStrokeStyle(2, 0xffcf7a, 0.28);

    this.add.text(centerX, 118, 'DataGame', {
      fontFamily: 'Trebuchet MS',
      fontSize: '52px',
      color: '#f4f7fb',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, 196, 'A Grade 12 Data Management hybrid prototype', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#9fd3ff',
    }).setOrigin(0.5);

    this.add.text(centerX, 304, 'Choose an arcade lane-run or a dungeon quest inspired by Intellivision-style exploration.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 860 },
    }).setOrigin(0.5);

    const arcadeCard = this.add.container(centerX - 230, 480);
    const arcadeBackground = this.add.rectangle(0, 0, 360, 210, 0x12253a, 0.94).setStrokeStyle(2, 0x78cfff, 0.42);
    const arcadeGlow = this.add.rectangle(0, -76, 304, 18, 0xffffff, 0.06);
    const arcadeTitle = this.add.text(0, -68, 'Arcade Crossover', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const arcadeBody = this.add.text(0, 10, 'Frogger lanes, Galaga sweeps, Centipede weaves, and answer gates. Correct answers stock runes for the lane-clearing shot.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#d9f4ff',
      align: 'center',
      wordWrap: { width: 296 },
      lineSpacing: 6,
    }).setOrigin(0.5);
    const arcadeHint = this.add.text(0, 82, 'Press 1 or click', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#9fd3ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    arcadeCard.add([arcadeBackground, arcadeGlow, arcadeTitle, arcadeBody, arcadeHint]);
    arcadeCard.setSize(360, 210);
    arcadeCard.setInteractive({ useHandCursor: true });
    arcadeCard.on('pointerover', () => {
      arcadeBackground.setFillStyle(0x17314c, 0.98);
      arcadeCard.setScale(1.02);
    });
    arcadeCard.on('pointerout', () => {
      arcadeBackground.setFillStyle(0x12253a, 0.94);
      arcadeCard.setScale(1);
    });
    arcadeCard.on('pointerdown', () => {
      launchMode('arcade');
    });

    const questCard = this.add.container(centerX + 230, 480);
    const questBackground = this.add.rectangle(0, 0, 360, 210, 0x231b2f, 0.95).setStrokeStyle(2, 0xffcf7a, 0.42);
    const questGlow = this.add.rectangle(0, -76, 304, 18, 0xffffff, 0.06);
    const questTitle = this.add.text(0, -68, 'Quest Mode', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const questBody = this.add.text(0, 10, 'A top-down dungeon crawl inspired by Cloudy Mountain. Explore chambers, reveal the map, break glowing seals, and claim relics.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#f7ecff',
      align: 'center',
      wordWrap: { width: 300 },
      lineSpacing: 6,
    }).setOrigin(0.5);
    const questHint = this.add.text(0, 82, 'Press 2 or click', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffd58f',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    questCard.add([questBackground, questGlow, questTitle, questBody, questHint]);
    questCard.setSize(360, 210);
    questCard.setInteractive({ useHandCursor: true });
    questCard.on('pointerover', () => {
      questBackground.setFillStyle(0x332343, 0.98);
      questCard.setScale(1.02);
    });
    questCard.on('pointerout', () => {
      questBackground.setFillStyle(0x231b2f, 0.95);
      questCard.setScale(1);
    });
    questCard.on('pointerdown', () => {
      launchMode('quest');
    });

    this.add.text(centerX, 660, 'Arrow keys or WASD to move\nSpace uses a rune to clear a lane hazard\nC opens the graphing/scientific calculator\nF flags a bad question and E exports the tracker CSV', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#c7d8ea',
      align: 'center',
      lineSpacing: 16,
    }).setOrigin(0.5);

    this.add.text(centerX, height - 164, 'SPACE starts Arcade, 2 starts Quest', {
      fontFamily: 'Trebuchet MS',
      fontSize: '26px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, height - 126, 'Admin links', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#c7d8ea',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    createMenuLink(centerX - 140, height - 96, 'Question Review', '/admin.html', '#9fd3ff');
    createMenuLink(centerX + 140, height - 96, 'Dungeon Master', '/dungeon-master.html', '#ffd58f');

    this.input.keyboard?.once('keydown-SPACE', () => launchMode('arcade'));
    this.input.keyboard?.once('keydown-ONE', () => launchMode('arcade'));
    this.input.keyboard?.once('keydown-TWO', () => launchMode('quest'));
  }
}
