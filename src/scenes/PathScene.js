// src/scenes/PathScene.js
import Phaser from 'phaser';
import Enemy from '../enemies/Enemy.js'; // Assure-toi que ce chemin est correct

// --- Constantes (optionnel mais pratique) ---
const ENEMY_SPAWN_DELAY = 800; // Délai en millisecondes entre chaque ennemi
const INITIAL_PLAYER_LIFE = 9;

export default class PathScene extends Phaser.Scene {
    constructor() {
        super('PathScene'); // Clé unique pour la scène

        // --- Propriétés ---
        this.graphics = null;       // Pour dessiner le chemin (debug)
        this.path = null;           // L'objet Phaser.Curves.Path
        this.enemies = null;        // Le groupe Phaser contenant les ennemis actifs
        this.enemiesToSpawn = [];   // La file d'attente des définitions d'ennemis à faire apparaître

        // --- État du jeu ---
        this.playerLife = INITIAL_PLAYER_LIFE;
        this.isGameOver = false;    // Flag pour savoir si la partie est terminée
        this.spawnTimer = null;     // Référence au timer de spawn (pour pouvoir l'arrêter si besoin)

        // Compteur de particules
        this.counter = 0;
        this.counterText = null;
        this.counterInterval = null;
    }

    preload() {
        // Chargement des images nécessaires
        this.load.image('golden', 'assets/golden.png');
        this.load.image('backgroundKey', 'assets/cuisine.png');
        this.load.image('chihuahua', 'assets/chihuahua.png');
        this.load.image('basset', 'assets/basset.png');
        // Charge ici d'autres assets (tours, sons, etc.)
        this.load.image('lifeFull', 'assets/pleinvie.png'); // Remplacez par le nom de votre fichier
        this.load.image('lifeEmpty', 'assets/videvi.png'); // Remplacez par le nom de votre fichier

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

        for (let i = 0; i < this.playerLife / 3; i++) {
            for (let j = 0; j < 3; j++){
                // Calculer la position X de chaque coeur
                const x = lifeStartX + j * lifeSpacingX;
                const y = lifeStartY + i * lifeSpacingY;
                // Créer le sprite avec l'image 'lifeFull'
                const lifeSprite = this.add.image(x, y, 'lifeFull');
                lifeSprite.setOrigin(0, 0.5); // Ancrer au centre gauche par exemple
                lifeSprite.setDepth(1000); // Mettre au premier plan
                lifeSprite.setScale(0.04);
                // Optionnel: Fixer par rapport à la caméra si elle bouge
                // lifeSprite.setScrollFactor(0);

                // Ajouter le sprite créé au tableau pour le retrouver plus tard
                this.lifeSprites.push(lifeSprite);
            }
        }

        // --- Graphics ---
        this.graphics = this.add.graphics();
        this.path = this.createPath();

        this.enemies = this.add.group(
            {
                classType: Enemy,
                runChildUpdate : true
            }
        );

        // --- Gestion des événements ---
        // Écoute l'événement émis par un Enemy lorsqu'il atteint la fin
        this.events.on('enemyReachedEnd', this.handleEnemyReachedEnd, this);

        // --- Préparation de la vague d'ennemis ---
        // Génère la liste des ennemis à faire apparaître pour cette vague
        this.enemiesToSpawn = this.generateEnemyQueue(10); // Génère 10 ennemis

        console.log(this.enemiesToSpawn);

        // --- Lancement du processus de spawn ---
        // Commence à faire apparaître les ennemis selon le délai défini
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

    createPath() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const startX = 540; 
        // *** MODIFICATION startY ***
        const startY = gameHeight * 0.82; // Modifié de 0.85 à 0.82
        // *** FIN MODIFICATION startY ***
        const endX = 460;
        const endY = gameHeight * 0.23;

        const path = new Phaser.Curves.Path(startX, startY);
        // Ajoute les segments du chemin
        path.lineTo(540, 1850);
        path.lineTo(330, 1850);
        path.lineTo(330, 1320);
        path.lineTo(750, 1320);
        path.lineTo(730, 880);
        path.lineTo(460, 880);
        path.lineTo(endX, endY); // Segment final vers la fin

        return path;
    }

    /**
     * Génère une liste (file d'attente) d'objets décrivant les ennemis à spawner.
     * @param {number} numberOfEnemies Le nombre total d'ennemis pour cette vague.
     * @returns {object[]} Un tableau d'objets, chacun décrivant un ennemi.
     */
    generateEnemyQueue(numberOfEnemies) {
        // Définit les types d'ennemis possibles avec leurs caractéristiques
        const enemyTypes = [
            { type: 'chihuahua', texture: 'chihuahua', health: 30, speed: 120 },
            { type: 'golden',    texture: 'golden',    health: 50, speed: 85 },
            { type: 'basset',    texture: 'basset',    health: 100, speed: 60 }
        ];
        const queue = [];

        for (let i = 0; i < numberOfEnemies; i++) {
            // Choisit un type d'ennemi au hasard
            const randomType = Phaser.Math.RND.pick(enemyTypes);
            // Ajoute la description de l'ennemi à la file d'attente
            queue.push({
                texture: randomType.texture,
                health: randomType.health,
                speed: randomType.speed
                // Note : On ne calcule plus le 'delay' ici, on utilisera un délai fixe entre chaque spawn
            });
        }
        return queue;
    }

    /**
     * Lance le processus de spawn des ennemis de la file d'attente.
     * Utilise un timer récursif pour faire apparaître un ennemi après l'autre.
     * @param {number} delayBetweenSpawns Le temps en ms entre chaque apparition d'ennemi.
     */
    startEnemySpawnProcess(delayBetweenSpawns) {
        // S'arrête s'il n'y a plus d'ennemis à spawner ou si le jeu est terminé
        if (this.enemiesToSpawn.length === 0 || this.isGameOver) {
             if (this.spawnTimer) this.spawnTimer.remove(); // Nettoie le timer
             return;
        }

        // Prend le prochain ennemi de la file d'attente
        const nextEnemyData = this.enemiesToSpawn.shift();

        // Fait apparaître cet ennemi immédiatement
        this.spawnSingleEnemy(nextEnemyData.texture, nextEnemyData.health, nextEnemyData.speed);

        // Planifie le spawn du *prochain* ennemi après le délai spécifié
        // Utilisation d'un timer qui s'appelle lui-même (récursif)
        this.spawnTimer = this.time.delayedCall(delayBetweenSpawns, () => {
            this.startEnemySpawnProcess(delayBetweenSpawns); // Relance la fonction pour le suivant
        }, [], this);
    }

    /**
     * Crée et configure une instance d'un ennemi.
     * @param {string} texture Clé de la texture de l'ennemi.
     * @param {number} health Points de vie initiaux.
     * @param {number} speed Vitesse de déplacement.
     */
    spawnSingleEnemy(texture, health, speed) {
        // Utilise la méthode create du groupe, qui instancie Enemy grâce à `classType`
        // La position (0,0) est temporaire, setPath la corrigera.
        const enemy = this.enemies.create(0, 0, texture);

        // Configure les propriétés spécifiques de l'ennemi créé
        // (car `create` ne passe pas d'arguments au constructeur par défaut)
        enemy.health = health;
        enemy.maxHealth = health;
        enemy.moveSpeed = speed;
        enemy.setScale(0.05); // Applique l'échelle souhaitée

        // Assigne le chemin à suivre à l'ennemi (ce qui le positionne aussi au départ)
        enemy.setPath(this.path);

    }

    /**
     * Gère ce qui se passe quand un ennemi atteint la fin du chemin.
     * @param {Enemy} enemy L'instance de l'ennemi qui a atteint la fin.
     */
    handleEnemyReachedEnd(enemy) {
        // Ignore si le jeu est fini ou si l'ennemi n'est plus valide/actif
        console.log(this.playerLife);
        console.log(enemy);
        if (this.isGameOver || !enemy || !enemy.active) {
            return;
        }


        // 2. Diminuer la vie (seulement si > 0)
        if (this.playerLife > 0) {
            this.playerLife -= 1; // Diminue la variable de vie

            // 3. Mettre à jour le SPRITE de vie correspondant
            // L'index du sprite à changer est la nouvelle valeur de playerLife
            // (si vie=8, on change le sprite à l'index 8, qui est le 9ème coeur)
            if (this.lifeSprites[this.playerLife]) { // Vérifie que le sprite existe à cet index
                this.lifeSprites[this.playerLife].setTexture('lifeEmpty'); // Change la texture !
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
        // Ne fait rien si le jeu est terminé
        if (this.isGameOver) {
            return;
        }

        // --- Dessin du chemin (pour le debug uniquement) ---
        this.graphics.clear(); // Nettoie les dessins précédents
        // Décommenter les lignes suivantes pour voir le chemin en blanc
        // this.graphics.lineStyle(2, 0xffffff, 1);
        // this.path.draw(this.graphics);

        // --- Mise à jour des ennemis ---
        // Est gérée automatiquement par le groupe grâce à `runChildUpdate: true`
        // Pas besoin d'une boucle ici :
        // // this.enemies.getChildren().forEach(enemy => {
        // //    if (enemy.active) enemy.update(time, delta);
        // // });

        // --- Autre logique de mise à jour ---
        // - Vérifier si la vague est terminée (enemies.getLength() === 0 && enemiesToSpawn.length === 0) ?
        // - Lancer la vague suivante ?
        // - Gérer les actions des tours (viser, tirer) ?
    }
}