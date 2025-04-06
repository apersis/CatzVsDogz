// src/scenes/PathScene.js
import Phaser from 'phaser';
import Enemy from '../enemies/Enemy.js'; // Assure-toi que ce chemin est correct
import Tower from '../towers/Tower.js'; // Adapte le chemin si besoin

// --- Constantes ---
const ENEMY_SPAWN_DELAY = 800; // Délai en ms entre chaque ennemi
const INITIAL_PLAYER_LIFE = 9;

export default class PathScene extends Phaser.Scene {
    constructor() {
        super('PathScene');

        // --- Propriétés ---
        this.graphics = null;
        this.path = null;
        this.enemies = null;
        this.enemiesToSpawn = [];
        this.towers = null; // Groupe pour les tours fonctionnelles

        // --- État du jeu ---
        this.playerLife = INITIAL_PLAYER_LIFE;
        this.lifeSprites = []; // Tableau pour stocker les sprites de coeurs
        this.isGameOver = false;
        this.spawnTimer = null;
    }

    preload() {
        // --- Chargement des Assets ---
        // Ennemis
        this.load.image('golden', 'assets/golden.png');
        this.load.image('chihuahua', 'assets/chihuahua.png');
        this.load.image('basset', 'assets/basset.png');

        // Tours
        this.load.image('originTower', 'assets/tower1.png'); // Ta tour de base

        // Interface / Autres
        this.load.image('backgroundKey', 'assets/level1.png');
        this.load.image('lifeFull', 'assets/pleinvie.png');
        this.load.image('lifeEmpty', 'assets/videvi.png');

        // Ajoute ici d'autres assets si nécessaire (projectiles, sons...)
        // this.load.image('bullet', 'assets/bullet.png');
        // this.load.audio('shootSound', 'assets/shoot.mp3');
    }

    create() {
        // --- Fond ---
        this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);

        // --- Chemin ---
        this.graphics = this.add.graphics();
        this.path = this.createPath();

        // --- Groupe Ennemis ---
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        // --- Groupe Tours ---
        this.towers = this.add.group({
            classType: Tower, // Indique le type d'objet pour ce groupe
            runChildUpdate: true // Pour que l'update des tours soit appelé
        });

        // --- Placement des Tours (Exemples avec la classe Tower) ---
        // Remplace tes this.add.image par ceci :
        // new Tower(scene, x, y, texture, range, damage, attackRate, cost, enemiesGroup)

        // Tour 1 (Exemple)
        const tower1Range = 150; // Portée en pixels
        const tower1Damage = 10;  // Dégâts par tir
        const tower1AttackRate = 1000; // Attaque toutes les 1000ms (1 seconde)
        const tower1Cost = 50; // Coût pour placer cette tour
        const tower1 = new Tower(this, 550, 775, 'originTower', tower1Range, tower1Damage, tower1AttackRate, tower1Cost, this.enemies);
        tower1.setScale(0.07); // Applique l'échelle
        this.towers.add(tower1); // Ajoute la tour au groupe de tours

        // Tour 2 (Exemple)
        const tower2 = new Tower(this, 340, 775, 'originTower', 150, 10, 1000, 50, this.enemies);
        tower2.setScale(0.07);
        this.towers.add(tower2);

        // Fais de même pour tes autres emplacements de tours... Adapte les stats si tu veux des tours différentes
        const tower10 = new Tower(this, 340, 1200, 'originTower', 150, 10, 1000, 50, this.enemies);
        tower10.setScale(0.07);
        this.towers.add(tower10);

        // Tu peux afficher la portée d'une tour au clic par exemple (logique à ajouter)
        // tower1.setInteractive();
        // tower1.on('pointerdown', () => {
        //     tower1.showRange(!tower1.rangeCircle.visible); // Bascule la visibilité
        // });


        // --- Affichage des Vies (Coeurs) ---
        this.createLifeDisplay();

        // --- Événements ---
        this.events.on('enemyReachedEnd', this.handleEnemyReachedEnd, this);

        // --- Vagues d'ennemis ---
        this.enemiesToSpawn = this.generateEnemyQueue(10);
        this.startEnemySpawnProcess(ENEMY_SPAWN_DELAY);
    }

    // Fonction pour créer l'affichage des coeurs
    createLifeDisplay() {
        const lifeStartX = 730;
        const lifeStartY = 40;
        const lifeSpacingX = 100;
        const lifeSpacingY = 50;
        const rows = Math.ceil(INITIAL_PLAYER_LIFE / 3); // Calcule le nb de lignes nécessaire

        this.lifeSprites = []; // Réinitialise le tableau

        let lifeIndex = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < 3; j++) {
                if (lifeIndex < INITIAL_PLAYER_LIFE) {
                    const x = lifeStartX + j * lifeSpacingX;
                    const y = lifeStartY + i * lifeSpacingY;
                    const lifeSprite = this.add.image(x, y, 'lifeFull');
                    lifeSprite.setOrigin(0, 0.5);
                    lifeSprite.setDepth(1000);
                    lifeSprite.setScale(0.04);
                    // lifeSprite.setScrollFactor(0); // Si la caméra bouge
                    this.lifeSprites.push(lifeSprite);
                    lifeIndex++;
                }
            }
        }
    }

    // Fonction pour mettre à jour l'affichage des coeurs
    updateLifeDisplay() {
        for (let i = 0; i < this.lifeSprites.length; i++) {
            if (i < this.playerLife) {
                this.lifeSprites[i].setTexture('lifeFull');
            } else {
                // Change la texture seulement si elle n'est pas déjà vide
                if (this.lifeSprites[i].texture.key !== 'lifeEmpty') {
                    this.lifeSprites[i].setTexture('lifeEmpty');
                    console.log(`Vie perdue. Sprite ${i} (représentant la vie ${i+1}) changé en vide.`);
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
            { type: 'chihuahua', texture: 'chihuahua', health: 30, speed: 120 },
            { type: 'golden', texture: 'golden', health: 50, speed: 90 },
            { type: 'basset', texture: 'basset', health: 100, speed: 60 }
        ];
        const queue = [];
        for (let i = 0; i < numberOfEnemies; i++) {
            const randomType = Phaser.Math.RND.pick(enemyTypes);
            queue.push({
                texture: randomType.texture,
                health: randomType.health,
                speed: randomType.speed
            });
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
        // console.log(`Spawned ${texture}. Group size: ${this.enemies.getLength()}`); // Optionnel: moins de logs
    }

    handleEnemyReachedEnd(enemy) {
        if (this.isGameOver || !enemy || !enemy.active) {
            return;
        }

        if (this.playerLife > 0) {
            this.playerLife -= 1;
            console.log(`Vie perdue. Vies restantes: ${this.playerLife}`);
            this.updateLifeDisplay(); // Met à jour les sprites de coeur

            if (this.playerLife <= 0) {
                this.triggerGameOver(); // Appelle la fonction centralisée
            }
        }
        // L'ennemi se détruit via son propre code, pas besoin de le faire ici.
    }

    triggerGameOver() {
        this.isGameOver = true;
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        // Optionnel : Arrêter le mouvement des ennemis, mettre en pause, etc.
        // this.enemies.getChildren().forEach(e => { if(e.active) e.enabled = false; });
        // this.scene.pause();

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
            fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 6, align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(2000);
        // Optionnel : Bouton Restart
        // this.time.delayedCall(3000, () => this.scene.restart());
    }

    update(time, delta) {
        if (this.isGameOver) {
            return;
        }

        // --- Debug: Dessin du chemin ---
        // this.graphics.clear();
        // this.graphics.lineStyle(2, 0xffffff, 1);
        // this.path.draw(this.graphics);

        // Les ennemis et les tours sont mis à jour par leur groupe (`runChildUpdate: true`)

        // --- Autre logique ---
        // Vérifier fin de vague, lancer la suivante, etc.
    }
}