import Phaser from 'phaser';

import { getDifficultyLabel, QuestionDeck, type MathQuestion } from '../game/questions';

type AnswerGate = Phaser.GameObjects.Image & {
  body: Phaser.Physics.Arcade.StaticBody;
  answerIndex: number;
  answerLabel: Phaser.GameObjects.Text;
};

type EnemySprite = Phaser.Physics.Arcade.Image & {
  laneY: number;
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  private gates: AnswerGate[] = [];
  private currentQuestion!: MathQuestion;
  private promptText!: Phaser.GameObjects.Text;
  private explanationText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private questionDeck = new QuestionDeck(1);
  private score = 0;
  private lives = 3;
  private level: 1 | 2 | 3 | 4 = 1;
  private correctAnswers = 0;
  private lastShotAt = 0;
  private acceptingAnswer = true;
  private gameOver = false;

  constructor() {
    super('game');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#08111f');
    this.drawBackdrop();
    this.createHud();
    this.createControls();
    this.createPlayer();
    this.createEnemies();
    this.createAnswerGates();
    this.createCollisions();

    this.nextQuestion();
    this.resetPlayer();
  }

  update(time: number): void {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
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

    this.player.setVelocity(velocityX, velocityY);

    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && time - this.lastShotAt > 250) {
      this.spawnShot();
      this.lastShotAt = time;
    }
  }

  private drawBackdrop(): void {
    for (let lane = 0; lane < 4; lane += 1) {
      const y = 175 + lane * 95;
      this.add.rectangle(480, y, 900, 68, 0x11233a, 0.8).setStrokeStyle(1, 0x32577d, 0.9);
    }

    this.add.rectangle(480, 85, 900, 92, 0x0f1b2e, 0.9).setStrokeStyle(2, 0x78cfff, 0.8);
    this.add.rectangle(480, 590, 900, 72, 0x0f1b2e, 0.9).setStrokeStyle(2, 0x78cfff, 0.6);
  }

  private createHud(): void {
    this.promptText = this.add.text(40, 20, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#f4f7fb',
      wordWrap: { width: 880 },
    });

    this.add.text(40, 110, 'Hybrid Mode: Frogger crossing + Galaga shooting + Data Management questions', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#9fd3ff',
      wordWrap: { width: 880 },
    });

    this.scoreText = this.add.text(40, 600, 'Score: 0', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#ffe082',
    });

    this.levelText = this.add.text(300, 600, 'Level 1: Foundations', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#9fd3ff',
    });

    this.progressText = this.add.text(40, 570, 'Clear 3 correct answers to unlock harder questions.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#c7d8ea',
    });

    this.livesText = this.add.text(800, 600, 'Lives: 3', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#ff9aa2',
    });

    this.explanationText = this.add.text(480, 560, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#d9f4ff',
      align: 'center',
      wordWrap: { width: 860 },
    }).setOrigin(0.5);
  }

  private createControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  private createPlayer(): void {
    this.player = this.physics.add.image(480, 560, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.002);
    this.player.setMaxVelocity(260, 260);
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: false });
    this.shots = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: false });

    const lanes = [175, 270, 365, 460];
    lanes.forEach((laneY, laneIndex) => {
      const direction = laneIndex % 2 === 0 ? 1 : -1;
      for (let count = 0; count < 4; count += 1) {
        const x = 140 + count * 220;
        const enemy = this.physics.add.image(x, laneY, 'enemy') as EnemySprite;
        enemy.laneY = laneY;
        enemy.setVelocityX(this.getLaneSpeed(laneIndex) * direction);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1, 0);
        this.enemies.add(enemy);
      }
    });
  }

  private createAnswerGates(): void {
    const answerY = 85;
    const answerX = [170, 480, 790];

    this.gates = answerX.map((x, index) => {
      const gate = this.physics.add.staticImage(x, answerY, 'answer-gate') as unknown as AnswerGate;
      gate.answerIndex = index;
      gate.answerLabel = this.add.text(x, answerY, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#f4f7fb',
        align: 'center',
        wordWrap: { width: 180 },
      }).setOrigin(0.5);
      return gate;
    });
  }

  private createCollisions(): void {
    this.physics.add.overlap(this.player, this.enemies, () => this.handlePlayerHit(), undefined, this);
    this.physics.add.overlap(this.shots, this.enemies, (shot, enemy) => this.handleShotHit(shot as Phaser.Physics.Arcade.Image, enemy as EnemySprite), undefined, this);

    for (const gate of this.gates) {
      this.physics.add.overlap(this.player, gate, () => this.handleAnswer(gate.answerIndex), undefined, this);
    }
  }

  private nextQuestion(): void {
    this.currentQuestion = this.questionDeck.nextQuestion();
    this.promptText.setText(this.currentQuestion.prompt);
    this.explanationText.setText('');
    this.updateProgressText();

    for (const gate of this.gates) {
      gate.answerLabel.setText(this.currentQuestion.options[gate.answerIndex]);
      gate.clearTint();
      gate.answerLabel.setColor('#f4f7fb');
    }

    this.acceptingAnswer = true;
  }

  private handleAnswer(answerIndex: number): void {
    if (!this.acceptingAnswer || this.gameOver || this.player.y > 130) {
      return;
    }

    this.acceptingAnswer = false;
    const isCorrect = answerIndex === this.currentQuestion.answerIndex;

    if (isCorrect) {
      this.correctAnswers += 1;
      this.score += 100 + (this.level - 1) * 50;
      this.scoreText.setText(`Score: ${this.score}`);
      this.gates[answerIndex].setTint(0x48d597);
      const leveledUp = this.maybeAdvanceDifficulty();
      const levelMessage = leveledUp ? ` Level up: ${getDifficultyLabel(this.level)}.` : '';
      this.explanationText.setText(`Correct. ${this.currentQuestion.explanation}${levelMessage}`);
      this.time.delayedCall(900, () => {
        this.nextQuestion();
        this.resetPlayer();
      });
      return;
    }

    this.gates[answerIndex].setTint(0xff6677);
    this.explanationText.setText(`Incorrect. ${this.currentQuestion.explanation}`);
    this.loseLife();
  }

  private handlePlayerHit(): void {
    if (this.gameOver) {
      return;
    }

    this.explanationText.setText('You were hit by traffic. Reset and try the question again.');
    this.loseLife();
  }

  private handleShotHit(shot: Phaser.Physics.Arcade.Image, enemy: EnemySprite): void {
    shot.destroy();

    enemy.disableBody(true, true);
    this.time.delayedCall(1200, () => {
      const respawnX = Phaser.Math.Between(80, 880);
      enemy.enableBody(true, respawnX, enemy.laneY, true, true);
      const speed = Phaser.Math.Between(this.getMinimumRespawnSpeed(), this.getMaximumRespawnSpeed()) * (Math.random() > 0.5 ? 1 : -1);
      enemy.setVelocityX(speed);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0);
    });
  }

  private spawnShot(): void {
    const shot = this.physics.add.image(this.player.x, this.player.y - 28, 'shot');
    shot.setVelocityY(-380);
    shot.setCollideWorldBounds(false);
    this.shots.add(shot);

    this.time.delayedCall(1800, () => {
      if (shot.active) {
        shot.destroy();
      }
    });
  }

  private loseLife(): void {
    if (this.gameOver) {
      return;
    }

    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);

    if (this.lives <= 0) {
      this.endRun();
      return;
    }

    this.acceptingAnswer = false;
    this.time.delayedCall(900, () => {
      this.acceptingAnswer = true;
      this.resetPlayer();
    });
  }

  private resetPlayer(): void {
    this.player.setPosition(480, 560);
    this.player.setVelocity(0, 0);
  }

  private maybeAdvanceDifficulty(): boolean {
    const nextLevel = this.getLevelForProgress(this.correctAnswers);

    if (nextLevel === this.level) {
      this.updateProgressText();
      return false;
    }

    this.level = nextLevel;
    this.questionDeck.setDifficulty(this.level);
    this.levelText.setText(`Level ${this.level}: ${getDifficultyLabel(this.level)}`);
    this.applyDifficultyScaling();
    this.updateProgressText();

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

    enemyChildren.forEach((enemy, index) => {
      const direction = !enemy.body || enemy.body.velocity.x >= 0 ? 1 : -1;
      const laneIndex = index % 4;
      enemy.setVelocityX(this.getLaneSpeed(laneIndex) * direction);
    });
  }

  private updateProgressText(): void {
    const nextThreshold = this.level === 1 ? 3 : this.level === 2 ? 6 : this.level === 3 ? 9 : null;

    if (nextThreshold === null) {
      this.progressText.setText('Maximum difficulty unlocked. Expect faster traffic and harder Data Management questions.');
      return;
    }

    const remaining = nextThreshold - this.correctAnswers;
    this.progressText.setText(`${remaining} more correct answer${remaining === 1 ? '' : 's'} until Level ${this.level + 1}.`);
  }

  private getLaneSpeed(laneIndex: number): number {
    return 110 + laneIndex * 25 + (this.level - 1) * 35;
  }

  private getMinimumRespawnSpeed(): number {
    return 120 + (this.level - 1) * 25;
  }

  private getMaximumRespawnSpeed(): number {
    return 180 + (this.level - 1) * 35;
  }

  private endRun(): void {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.player.setTint(0xff6677);

    this.add.rectangle(480, 320, 560, 220, 0x02060d, 0.92).setStrokeStyle(2, 0x78cfff, 0.7);
    this.add.text(480, 265, 'Game Over', {
      fontFamily: 'Trebuchet MS',
      fontSize: '44px',
      color: '#f4f7fb',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 325, `Final score: ${this.score}\nPress ENTER to restart`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#ffe082',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5);
  }
}
