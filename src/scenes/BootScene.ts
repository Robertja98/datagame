import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x6ee7ff, 1);
    graphics.fillRect(0, 0, 42, 42);
    graphics.generateTexture('player', 42, 42);
    graphics.clear();

    graphics.fillStyle(0xff6677, 1);
    graphics.fillRect(0, 0, 34, 34);
    graphics.generateTexture('enemy', 34, 34);
    graphics.clear();

    graphics.fillStyle(0xffe082, 1);
    graphics.fillRect(0, 0, 8, 20);
    graphics.generateTexture('shot', 8, 20);
    graphics.clear();

    graphics.fillStyle(0x1a2940, 1);
    graphics.fillRoundedRect(0, 0, 220, 72, 14);
    graphics.lineStyle(3, 0x78cfff, 1);
    graphics.strokeRoundedRect(0, 0, 220, 72, 14);
    graphics.generateTexture('answer-gate', 220, 72);
    graphics.destroy();

    this.add.text(480, 120, 'DataGame', {
      fontFamily: 'Trebuchet MS',
      fontSize: '46px',
      color: '#f4f7fb',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 195, 'A Grade 12 Data Management arcade prototype', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#9fd3ff',
    }).setOrigin(0.5);

    this.add.text(480, 300, 'Cross the lanes, dodge enemy traffic, and reach the correct answer gate.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.add.text(480, 360, 'Arrow keys or WASD to move\nSpace to shoot\nReach the top answer gate to solve the question', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#c7d8ea',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    this.add.text(480, 520, 'Press SPACE or click to start', {
      fontFamily: 'Trebuchet MS',
      fontSize: '26px',
      color: '#ffe082',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('game'));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('game'));
  }
}
