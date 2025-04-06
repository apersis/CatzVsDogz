// src/scenes/PathScene.js
import Phaser from 'phaser';
import Enemy from '../enemies/Enemy.js';
import Tower from '../towers/Tower.js';

// --- Constantes ---
const ENEMY_SPAWN_DELAY = 800;
const INITIAL_PLAYER_LIFE = 9;

export default class PathScene extends Phaser.Scene {
    constructor() {
        super('PathScene');
        this.graphics = null;
        this.path = null;
        this.enemies = null;
        this.enemiesToSpawn = [];
        this.towers = null;
        this.playerLife = INITIAL_PLAYER_LIFE;
        this.lifeSprites = [];
        this.isGameOver = false;
        this.spawnTimer = null;
        this.selectedTowerData = null; // Pour stocker les données de la tour sélectionnée
        this.placementLocations = []; // Pour stocker les emplacements de placement
    }

    preload() {
        this.load.image('golden', 'assets/golden.png');
        this.load.image('chihuahua', 'assets/chihuahua.png');
        this.load.image('basset', 'assets/basset.png');
        this.load.image('originTower', 'assets/tower1.png');
        this.load.image('backgroundKey', 'assets/level1.png');
        this.load.image('lifeFull', 'assets/pleinvie.png');
        this.load.image('lifeEmpty', 'assets/videvi.png');
        this.load.image('entrechat', 'assets/entrechat.png'); // Image pour le bouton de la tour 1
        this.load.image('felintion', 'assets/felintion.png'); // Image pour le bouton de la tour 2
        this.load.image('langue_rapeuse', 'assets/langue_rapeuse.png'); // Image pour le bouton de la tour 3
    }

    create() {
        this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);
        this.graphics = this.add.graphics();
        this.path = this.createPath();

        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        this.towers = this.add.group({
            classType: Tower,
            runChildUpdate: true
        });

        this.placementLocations = [
            { x: 450, y: 1750 },
            { x: 200, y: 1600 },
            { x: 450, y: 1450 },
            { x: 450, y: 1230 },
            { x: 850, y: 1400 },
            { x: 620, y: 1120 },
            { x: 850, y: 950 },
            { x: 550, y: 990 },
            { x: 570, y: 775 },
            { x: 340, y: 775 }
        ];
        

        // --- Création des emplacements interactifs ---
        this.placementLocations.forEach(location => {
            const placementZone = this.add.rectangle(location.x, location.y, 64, 64, 0x888888, 0.5)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.handlePlacementClick(location.x, location.y));
            placementZone.setDepth(1);
        });

        const buttonX = this.scale.width - 120;
        let buttonY = this.scale.height - 50;
        const buttonSpacing = 40;

        // --- Création du bouton pour la tour 1 ---
        const entrechat = this.add.image(buttonX -725, buttonY -100, 'entrechat')
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedTowerData = {
                    texture: 'originTower', // Tu peux changer la texture si tu en as une différente
                    range: 150,
                    damage: 50, // Gros dégâts
                    attackRate: 2500, // Très faible vitesse d'attaque (2.5 secondes)
                    cost: 150, // Coût élevé
                };
                console.log('Tour 1 sélectionnée (gros dégâts, lente).');
            });
        entrechat.setDepth(2);

        // --- Création du bouton pour la tour 2 ---
        const felintion = this.add.image(buttonX -425 , buttonY -100, 'felintion')
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedTowerData = {
                    texture: 'originTower', // Tu peux changer la texture
                    range: 300, // Très grande portée
                    damage: 5, // Très faibles dégâts
                    attackRate: 500, // Très haute vitesse d'attaque (0.1 seconde)
                    cost: 180, // Coût élevé
                };
                console.log('Tour 2 sélectionnée (faibles dégâts, rapide, grande portée).');
            });
        felintion.setDepth(2);

        // --- Création du bouton pour la tour 3 ---
        const langue_rapeuse = this.add.image(buttonX -125, buttonY-100, 'langue_rapeuse')
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedTowerData = {
                    texture: 'originTower', // Tu peux changer la texture
                    range: 50, // Très faible portée
                    damage: 40, // Gros dégâts
                    attackRate: 2000, // Très faible vitesse d'attaque (2 secondes)
                    cost: 80, // Coût moyen
                };
                console.log('Tour 3 sélectionnée (gros dégâts, lente, très faible portée).');
            });
        langue_rapeuse.setDepth(2);

        this.createLifeDisplay();
        this.events.on('enemyReachedEnd', this.handleEnemyReachedEnd, this);
        this.enemiesToSpawn = this.generateEnemyQueue(10);
        this.startEnemySpawnProcess(ENEMY_SPAWN_DELAY);
    }

    handlePlacementClick(x, y) {
        if (this.selectedTowerData) {
            const { texture, range, damage, attackRate, cost } = this.selectedTowerData;
            const newTower = new Tower(this, x, y, texture, range, damage, attackRate, cost, this.enemies);
            newTower.setScale(0.07);
            this.towers.add(newTower);
            this.selectedTowerData = null; // Réinitialiser la sélection après placement
            console.log('Tour placée !');
            // Optionnellement, désactiver l'emplacement après placement si on ne veut qu'une tour par emplacement
            // placementZone.disableInteractive();
        } else {
            console.log('Aucune tour sélectionnée pour le placement.');
        }
    }

    createLifeDisplay() {
        const lifeStartX = 730;
        const lifeStartY = 40;
        const lifeSpacingX = 100;
        const lifeSpacingY = 50;
        const rows = Math.ceil(INITIAL_PLAYER_LIFE / 3);
        this.lifeSprites = [];
        let lifeIndex = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < 3; j++) {
                if (lifeIndex < INITIAL_PLAYER_LIFE) {
                    const x = lifeStartX + j * lifeSpacingX;
                    const y = lifeStartY + i * lifeSpacingY;
                    const lifeSprite = this.add.image(x, y, 'lifeFull').setOrigin(0, 0.5).setDepth(1000).setScale(0.04);
                    this.lifeSprites.push(lifeSprite);
                    lifeIndex++;
                }
            }
        }
    }

    updateLifeDisplay() {
        for (let i = 0; i < this.lifeSprites.length; i++) {
            this.lifeSprites[i].setTexture(i < this.playerLife ? 'lifeFull' : 'lifeEmpty');
        }
    }

    createPath() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const startX = 540;
        const startY = gameHeight * 0.82;
        const endX = 460;
        const endY = gameHeight * 0.23;
        const path = new Phaser.Curves.Path(startX, startY);
        path.lineTo(540, 1850);
        path.lineTo(330, 1850);
        path.lineTo(330, 1320);
        path.lineTo(750, 1320);
        path.lineTo(730, 880);
        path.lineTo(460, 880);
        path.lineTo(endX, endY);
        return path;
    }

    generateEnemyQueue(numberOfEnemies) {
        const enemyTypes = [
            { type: 'chihuahua', texture: 'chihuahua', health: 30, speed: 120 },
            { type: 'golden', texture: 'golden', health: 50, speed: 90 },
            { type: 'basset', texture: 'basset', health: 100, speed: 60 }
        ];
        const queue = [];
        for (let i = 0; i < numberOfEnemies; i++) {
            const randomType = Phaser.Math.RND.pick(enemyTypes);
            queue.push({ texture: randomType.texture, health: randomType.health, speed: randomType.speed });
        }
        console.log("Enemy queue generated:", queue);
        return queue;
    }

    startEnemySpawnProcess(delayBetweenSpawns) {
        if (this.enemiesToSpawn.length === 0 || this.isGameOver) {
            console.log("Spawning finished or game over.");
            if (this.spawnTimer) this.spawnTimer.remove();
            return;
        }
        const nextEnemyData = this.enemiesToSpawn.shift();
        this.spawnSingleEnemy(nextEnemyData.texture, nextEnemyData.health, nextEnemyData.speed);
        this.spawnTimer = this.time.delayedCall(delayBetweenSpawns, () => {
            this.startEnemySpawnProcess(delayBetweenSpawns);
        }, [], this);
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
        if (this.isGameOver || !enemy || !enemy.active) return;
        if (this.playerLife > 0) {
            this.playerLife -= 1;
            console.log(`Vie perdue. Vies restantes: ${this.playerLife}`);
            this.updateLifeDisplay();
            if (this.playerLife <= 0) this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        if (this.spawnTimer) this.spawnTimer.remove();
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
            fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5).setDepth(2000);
    }

    update(time, delta) {
        if (this.isGameOver) return;
        // this.graphics.clear();
        // this.graphics.lineStyle(2, 0xffffff, 1);
        // this.path.draw(this.graphics);
    }
}