// src/scenes/PathScene.js
import Phaser from "phaser";
import Enemy from "../enemies/Enemy.js";

// Constantes
const ENEMY_SPAWN_DELAY = 800;
const INITIAL_PLAYER_LIFE = 9;

export default class PathScene extends Phaser.Scene {
  constructor() {
    super("PathScene");

    // Propriétés du jeu
    this.graphics = null;
    this.path = null;
    this.enemies = null;
    this.enemiesToSpawn = [];

    // État du jeu
    this.playerLife = INITIAL_PLAYER_LIFE;
    this.lifeSprites = [];
    this.isGameOver = false;
    this.spawnTimer = null;
    this.gamePaused = false; // Nouvelle propriété pour suivre l'état de la pause
    this.enemySpeeds = new Map(); // Nouvelle map pour stocker les vitesses des ennemis
    this.spawnDelay = ENEMY_SPAWN_DELAY; // Nouvelle propriété pour stocker le délai de spawn

    // Compteur de particules
    this.counter = 0;
    this.counterText = null;
    this.counterInterval = null;
  }

  preload() {
    // Assets
    this.load.image("golden", "assets/golden.png");
    this.load.image("backgroundKey", "assets/level1.png");
    this.load.image("chihuahua", "assets/chihuahua.png");
    this.load.image("basset", "assets/basset.png");
    this.load.image("lifeFull", "assets/pleinvie.png");
    this.load.image("lifeEmpty", "assets/videvi.png");
    this.load.image("retourBtn", "assets/retour.png");
    this.load.image("lancerBtn", "assets/lancer.png");
    this.load.image("pauseBtn", "assets/waitButton.png");
  }

  create() {
    // Setup de base
    this.add.image(0, 0, "backgroundKey").setOrigin(0, 0);

    // Affichage des vies (coeurs)
    this.setupLifeDisplay();

    // Chemin et ennemis
    this.graphics = this.add.graphics();
    this.path = this.createPath();
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    // Événements
    this.events.on("enemyReachedEnd", this.handleEnemyReachedEnd, this);

    // Vague d'ennemis
    this.enemiesToSpawn = this.generateEnemyQueue(10);
    this.startEnemySpawnProcess(ENEMY_SPAWN_DELAY);

    // Interface
    this.createButton("retourBtn", 0.15, 0.96);
    this.createButton("pauseBtn", 0.75, 0.96); // Ajout du bouton pause
    this.createButton("lancerBtn", 0.9, 0.96); // Ajout du bouton play
    this.setupCounter();
  }

  setupLifeDisplay() {
    const lifeStartX = 730;
    const lifeStartY = 40;
    const lifeSpacingX = 100;
    const lifeSpacingY = 50;

    for (let i = 0; i < INITIAL_PLAYER_LIFE / 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = lifeStartX + j * lifeSpacingX;
        const y = lifeStartY + i * lifeSpacingY;
        const lifeSprite = this.add
          .image(x, y, "lifeFull")
          .setOrigin(0, 0.5)
          .setDepth(1000)
          .setScale(0.04);
        this.lifeSprites.push(lifeSprite);
      }
    }
  }

  setupCounter() {
    this.counterText = this.add
      .text(
        this.cameras.main.width * 0.5,
        this.cameras.main.height * 0.98,
        `Particules: ${this.counter}`,
        {
          fontSize: "28px",
          fill: "#FFFFFF",
        }
      )
      .setOrigin(0.5);

    this.counterInterval = this.time.addEvent({
      delay: 10, // 0.1 seconde
      callback: () => {
        this.counter += 1231;
        this.counterText.setText(`Particules: ${this.counter}`);
      },
      callbackScope: this,
      loop: true,
    });
  }

  createButton(texture, xPercent, yPercent) {
    const btn = this.add
      .image(
        this.cameras.main.width * xPercent,
        this.cameras.main.height * yPercent,
        texture
      )
      .setOrigin(0.5);

    const btnScale = Math.min(
      (this.cameras.main.width * 0.3) / btn.width,
      (this.cameras.main.height * 0.1) / btn.height
    );

    btn
      .setScale(btnScale)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setScale(btnScale * 1.05))
      .on("pointerout", () => btn.setScale(btnScale))
      .on("pointerdown", () => {
        if (texture === "retourBtn") {
          this.scene.start("HomePageScene");
        } else if (texture === "pauseBtn") {
          this.pauseGame();
        } else if (texture === "lancerBtn") {
          this.resumeGame();
        }
      });

    return btn;
  }

  createPath() {
    const gameHeight = this.scale.height;
    const path = new Phaser.Curves.Path(540, gameHeight * 0.82);

    path
      .lineTo(540, 1850)
      .lineTo(330, 1850)
      .lineTo(330, 1320)
      .lineTo(750, 1320)
      .lineTo(730, 880)
      .lineTo(460, 880)
      .lineTo(460, gameHeight * 0.23);

    return path;
  }

  generateEnemyQueue(numberOfEnemies) {
    const enemyTypes = [
      { type: "chihuahua", texture: "chihuahua", health: 30, speed: 120 },
      { type: "golden", texture: "golden", health: 50, speed: 90 },
      { type: "basset", texture: "basset", health: 100, speed: 60 },
    ];

    return Array(numberOfEnemies)
      .fill()
      .map(() => {
        const randomType = Phaser.Math.RND.pick(enemyTypes);
        return {
          texture: randomType.texture,
          health: randomType.health,
          speed: randomType.speed,
        };
      });
  }

  startEnemySpawnProcess(delayBetweenSpawns) {
    if (this.enemiesToSpawn.length === 0 || this.isGameOver) {
      if (this.spawnTimer) this.spawnTimer.remove();
      return;
    }

    const nextEnemyData = this.enemiesToSpawn.shift();
    this.spawnSingleEnemy(
      nextEnemyData.texture,
      nextEnemyData.health,
      nextEnemyData.speed
    );

    this.spawnTimer = this.time.delayedCall(
      delayBetweenSpawns,
      () => {
        this.startEnemySpawnProcess(delayBetweenSpawns);
      },
      [],
      this
    );
  }

  spawnSingleEnemy(texture, health, speed) {
    const enemy = this.enemies.create(0, 0, texture);
    enemy.health = health;
    enemy.maxHealth = health;
    enemy.moveSpeed = speed;
    enemy.setScale(0.05);
    enemy.setPath(this.path);
  }

  handleEnemyReachedEnd(enemy) {
    if (this.isGameOver || !enemy?.active) return;

    if (this.playerLife > 0) {
      this.playerLife -= 1;

      if (this.lifeSprites[this.playerLife]) {
        this.lifeSprites[this.playerLife].setTexture("lifeEmpty");
      }

      if (this.playerLife <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    if (this.counterInterval) this.counterInterval.destroy();

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "GAME OVER", {
        fontSize: "64px",
        fill: "#ff0000",
        stroke: "#000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(2000);

    this.scene.pause();
  }

  pauseGame() {
    if (this.gamePaused) return;
    this.gamePaused = true;
    this.enemies.getChildren().forEach((enemy) => {
      this.enemySpeeds.set(enemy, enemy.moveSpeed);
      enemy.moveSpeed = 0;
    });
    // Arrêter le timer de spawn
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
  }

  resumeGame() {
    if (!this.gamePaused) return;
    this.gamePaused = false;
    this.enemies.getChildren().forEach((enemy) => {
      enemy.moveSpeed = this.enemySpeeds.get(enemy);
    });
    // Redémarrer le timer de spawn
    if (!this.spawnTimer) {
      this.startEnemySpawnProcess(this.spawnDelay);
    }
  }

  update() {
    if (this.isGameOver) return;
    this.graphics.clear();
  }
}
