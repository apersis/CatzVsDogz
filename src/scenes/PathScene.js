// src/scenes/PathScene.js
import Phaser from 'phaser';
import Enemy from '../enemies/Enemy.js';
import Tower from '../towers/Tower.js';

// --- Constantes ---
const ENEMY_SPAWN_DELAY = 800;
const INITIAL_PLAYER_LIFE = 9;
const INITIAL_PLAYER_MONEY = 400; // Argent de départ

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
        this.selectedTowerData = null;
        this.placementLocations = [];
        this.playerMoney = INITIAL_PLAYER_MONEY; // Ajout de l'argent du joueur
        this.moneyText = null; // Pour afficher l'argent
        // Compteur de particules
        this.counter = 0;
        this.counterText = null;
        this.counterInterval = null;
    }

    preload() {
        this.load.image('golden', 'assets/golden.png');
        this.load.image('backgroundKey', 'assets/cuisine.png');
        this.load.image('chihuahua', 'assets/chihuahua.png');
        this.load.image('basset', 'assets/basset.png');
        this.load.image('skin_entrechat', 'assets/skin_entrechat.png');
        this.load.image('skin_felintion', 'assets/skin_felintion.png');
        this.load.image('skin_langue_rapeuse', 'assets/skin_langue_rapeuse.png');
        this.load.image('lifeFull', 'assets/pleinvie.png');
        this.load.image('lifeEmpty', 'assets/videvi.png');
        this.load.image('entrechat', 'assets/entrechat.png');
        this.load.image('felintion', 'assets/felintion.png');
        this.load.image('langue_rapeuse', 'assets/langue_rapeuse.png');
        this.load.image('towerPlace', 'assets/emplacementTower.png')
        this.load.image('1thon', 'assets/1thon.png')
        this.load.image('2thon', 'assets/2thon.png')
        this.load.image('3thon', 'assets/3thon.png')
        if (!this.textures.exists('waterParticle')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x0398fc, 0.8); // Bleu de base avec transparence
            graphics.fillCircle(16, 16, 16);
            graphics.generateTexture('waterParticle', 32, 32);
            graphics.destroy();
        }
    }

    create() {
        // --- Mise en place du fond ---
        // --- Fond ---
        let bg = this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);
        // Optionnel : Ajuster la taille du fond à l'écran
        // bg.setDisplaySize(this.scale.width, this.scale.height);

        const lifeStartX = 730; // Position X du premier coeur
        const lifeStartY = 40; // Position Y des coeurs
        const lifeSpacingX = 100; // Espace entre chaque coeur (ajustez selon la taille de votre sprite)
        const lifeSpacingY = 50; // Espace entre chaque coeur (ajustez selon la taille de votre sprite)

        this.lifeSprites = []; // Vider le tableau au cas où la scène est recréée

        this.playerLife = INITIAL_PLAYER_LIFE;

        // --- Graphics ---
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

        this.placementLocations.forEach(location => {
            const placementZone = this.add.image(location.x, location.y, 'towerPlace')
                .setOrigin(0.5)
                .setScale(0.3) // Ajuste l'échelle selon la taille de ton image
                .setInteractive()
                .on('pointerdown', () => this.handlePlacementClick(location.x, location.y));
            placementZone.setDepth(1);
        });

        const buttonX = this.scale.width - 120;
        let buttonY = this.scale.height - 50;
        const buttonSpacing = 40;

        const entrechat = this.add.image(buttonX - 725, buttonY - 100, 'entrechat')
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedTowerData = {
                    texture: 'skin_entrechat',
                    range: 300,
                    damage: 50,
                    attackRate: 2500,
                    cost: 150,
                };
                console.log('Tour Entrechat sélectionnée (coût 150).');
            });
        entrechat.setDepth(2);

        const felintion = this.add.image(buttonX - 425, buttonY - 100, 'felintion')
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedTowerData = {
                    texture: 'skin_felintion',
                    range: 600,
                    damage: 5,
                    attackRate: 500,
                    cost: 180,
                };
                console.log('Tour Felintion sélectionnée (coût 180).');
            });
        felintion.setDepth(2);

        const langue_rapeuse = this.add.image(buttonX - 125, buttonY - 100, 'langue_rapeuse')
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedTowerData = {
                    texture: 'skin_langue_rapeuse',
                    range: 150,
                    damage: 40,
                    attackRate: 2000,
                    cost: 80,
                };
                console.log('Tour Langue Rapeuse sélectionnée (coût 80).');
            });
        langue_rapeuse.setDepth(2);

        this.createLifeDisplay();
        this.events.on('enemyReachedEnd', this.handleEnemyReachedEnd, this);
        this.events.on('enemyDied', this.handleEnemyDied, this); // Écoute l'événement de mort de l'ennemi
        this.enemiesToSpawn = this.generateEnemyQueue(1000000);
        this.startEnemySpawnProcess(ENEMY_SPAWN_DELAY);

        // Génération de fumée -------------------------------------
        this.smoke = this.add.particles(0, 0, 'smokeParticle', {
            x: this.cameras.main.centerX * 0.23,
            y: this.cameras.main.height * 0.35,
            quantity: 10, // Nombre de particules
            speed: { min: 30, max: 60 }, 
            angle: { min: 75, max: 105 }, // Direction verticale précise
            scale: { 
                start: 0.4,  // Taille initiale
                end: 1.2,     // Taille finale
                ease: 'Quad.easeOut'
            },
            alpha: { 
                start: 0.8, 
                end: 0,
                ease: 'Cubic.easeOut' 
            },
            lifespan: 3500, // Durée de vie augmentée
            frequency: 120,  // Apparition plus fréquente
            blendMode: 'NORMAL',
            tint: [0xBBBBBB, 0x787878, 0x323232], // Nuances de gris
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Circle(0, 0, 20) // Zone d'émission élargie
            },
            gravityY: -200, // Force ascensionnelle
            rotate: { min: -5, max: 5 } // Légère rotation
        }).setDepth(500);

        // Animation de variation
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                this.smoke.setQuantity(Phaser.Math.Between(3, 7));
            },
            loop: true
        });
        //-----------------------------------------------
        // Génération d'eau' -------------------------------------
        this.water = this.add.particles(0, 0, 'waterParticle', {
            x: this.cameras.main.centerX * 1.95,
            y: this.cameras.main.height * 0.18,
            quantity: 20, // Nombre de particules
            speed: { min: 30, max: 50 }, 
            angle: { min: 87, max: 93 }, // Direction verticale précise
            scale: { 
                start: 0.2,  // Taille initiale
                end: 0.4,     // Taille finale
                ease: 'Quad.easeOut'
            },
            alpha: { 
                start: 1, 
                end: 0.2,
                ease: 'Cubic.easeOut' 
            },
            lifespan: 1000, // Durée de vie
            frequency: 120,  // Apparition plus fréquente
            blendMode: 'NORMAL',
            tint: [0x0398fc, 0x46a2e0, 0x1432f5], // Nuances de bleu
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Circle(0, 0, 5) // Zone d'émission élargie
            },
            gravityY: 200, // Force ascensionnelle
            rotate: { min: -3, max: 3 } // Légère rotation
        }).setDepth(500);

        // Animation de variation
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                this.water.setQuantity(Phaser.Math.Between(10, 15));
            },
            loop: true
        });

        this.setupCounter();

        
        // --- Affichage de l'argent du joueur ---
        this.moneyText = this.add.text(120, 180, this.playerMoney, {
            fontSize: '50px',
            fill: '#000',
            stroke: '#000',
            strokeThickness: 2
        }).setDepth(1000);
        this.moneySprite = this.add.image(100, 80, '1thon').setOrigin(0, 0.5).setDepth(1000).setScale(0.05);
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

    handlePlacementClick(x, y) {
        if (this.selectedTowerData) {
            const { texture, range, damage, attackRate, cost } = this.selectedTowerData;
            if (this.playerMoney >= cost) {
                this.playerMoney -= cost;
                this.updateMoneyDisplay();
                const newTower = new Tower(this, x, y, texture, range, damage, attackRate, cost, this.enemies);
                newTower.setScale(0.07);
                newTower.setDepth(2); // Ajout de cette ligne pour définir la profondeur de la tour
                this.towers.add(newTower);
                this.selectedTowerData = null;
                console.log(`Tour placée ! Argent restant: ${this.playerMoney}`);
            } else {
                console.log("Pas assez d'argent pour placer cette tour.");
                // Optionnellement, afficher un message à l'utilisateur
            }
        } else {
            console.log('Aucune tour sélectionnée pour le placement.');
        }
    }

    handleEnemyDied(enemy) {
        const reward = enemy.reward || 10; // Récompense par défaut de 10 pièces
        this.playerMoney += reward;
        this.updateMoneyDisplay();
        console.log(`Ennemi éliminé, argent gagné: ${reward}. Argent total: ${this.playerMoney}`);
    }

    updateMoneyDisplay() {
        this.moneyText.setText(this.playerMoney);
        if(this.playerMoney < 500){
            this.moneySprite.setTexture('1thon');
        }else if(this.playerMoney < 1000){
            this.moneySprite.setTexture('2thon');
        }else{
            this.moneySprite.setTexture('3thon');
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
            { type: 'chihuahua', texture: 'chihuahua', health: 30, speed: 120, reward: 10 }, // Ajout de la récompense
            { type: 'golden', texture: 'golden', health: 50, speed: 85, reward: 20 },
            { type: 'basset', texture: 'basset', health: 100, speed: 60, reward: 30 }
        ];
        const queue = [];
        for (let i = 0; i < numberOfEnemies; i++) {
            const randomType = Phaser.Math.RND.pick(enemyTypes);
            queue.push({ texture: randomType.texture, health: randomType.health, speed: randomType.speed, reward: randomType.reward });
        }
        return queue;
    }

    startEnemySpawnProcess(delayBetweenSpawns) {
        if (this.enemiesToSpawn.length === 0 || this.isGameOver) {
             if (this.spawnTimer) this.spawnTimer.remove(); // Nettoie le timer
             return;
        }
        const nextEnemyData = this.enemiesToSpawn.shift();
        this.spawnSingleEnemy(nextEnemyData.texture, nextEnemyData.health, nextEnemyData.speed, nextEnemyData.reward); // Passe la récompense
        this.spawnTimer = this.time.delayedCall(delayBetweenSpawns, () => {
            this.startEnemySpawnProcess(delayBetweenSpawns);
        }, [], this);
    }

    spawnSingleEnemy(texture, health, speed, reward) {
        const enemy = this.enemies.create(0, 0, texture);
        enemy.health = health;
        enemy.maxHealth = health;
        enemy.moveSpeed = speed;
        enemy.setScale(0.05);
        enemy.setPath(this.path);
        enemy.reward = reward; // Assigner la récompense à l'ennemi
    }

    handleEnemyReachedEnd(enemy) {
        if (this.isGameOver || !enemy || !enemy.active) return;
        if (this.playerLife > 0) {
            this.playerLife -= 1; // Diminue la variable de vie

            // 3. Mettre à jour le SPRITE de vie correspondant
            // L'index du sprite à changer est la nouvelle valeur de playerLife
            // (si vie=8, on change le sprite à l'index 8, qui est le 9ème coeur)
            if (this.lifeSprites[this.playerLife]) { // Vérifie que le sprite existe à cet index
                this.lifeSprites[this.playerLife].setTexture('lifeEmpty'); // Change la texture !
                console.log(this.lifeSprites[this.playerLife])
                console.log(this.playerLife)
            } else {
                console.warn(`Sprite de vie à l'index ${this.playerLife} non trouvé.`);
            }

            // 4. Vérifier si Game Over (la vie est maintenant à 0 ou moins)
            if (this.playerLife <= 0) {
                this.triggerGameOver()
            }
        }
    }

    /**
     * Déclenche la fin de la partie.
     */
    triggerGameOver() {
        this.events.off('enemyReachedEnd');

        this.scene.stop('PathScene')
        this.scene.start('GameOverScene');
    }

    update(time, delta) {
        if (this.isGameOver) return;
        // this.graphics.clear();
        // this.graphics.lineStyle(2, 0xffffff, 1);
        // this.path.draw(this.graphics);
    }
}