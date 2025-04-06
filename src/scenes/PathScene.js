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
        this.lifeText = null;       // Référence à l'objet Text pour la vie
        this.isGameOver = false;    // Flag pour savoir si la partie est terminée
        this.spawnTimer = null;     // Référence au timer de spawn (pour pouvoir l'arrêter si besoin)
    }

    preload() {
        // Chargement des images nécessaires
        this.load.image('golden', 'assets/golden.png');
        this.load.image('backgroundKey', 'assets/level1.png');
        this.load.image('chihuahua', 'assets/chihuahua.png');
        this.load.image('basset', 'assets/basset.png');
        // Charge ici d'autres assets (tours, sons, etc.)
        this.load.image('lifeFull', 'assets/pleinvie.png'); // Remplacez par le nom de votre fichier
        this.load.image('lifeEmpty', 'assets/videvi.png'); // Remplacez par le nom de votre fichier
        
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
        const initialLives = this.playerLife; // Nombre de vies au départ

        this.lifeSprites = []; // Vider le tableau au cas où la scène est recréée

        for (let i = 0; i < initialLives / 3; i++) {
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

        // --- Lancement du processus de spawn ---
        // Commence à faire apparaître les ennemis selon le délai défini
        this.startEnemySpawnProcess(ENEMY_SPAWN_DELAY);
    }

    createPath() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const startX = 540; // TODO: Adapter !
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
            { type: 'golden',    texture: 'golden',    health: 50, speed: 90 },
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
        console.log("Enemy queue generated:", queue);
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
             console.log("Spawning finished or game over.");
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
                console.log(`Vie perdue. Sprite ${this.playerLife} changé.`);
            } else {
                console.warn(`Sprite de vie à l'index ${this.playerLife} non trouvé.`);
            }

            // 4. Vérifier si Game Over (la vie est maintenant à 0 ou moins)
            if (this.playerLife <= 0) {
                console.log("GAME OVER SIMPLE!");
                this.scene.pause();
                // Afficher Game Over Text (avec Z-index élevé)
                this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 6 })
                    .setOrigin(0.5)
                    .setDepth(1000); // Z-index élevé
            }
        }
    }

    /**
     * Déclenche la fin de la partie.
     */
    triggerGameOver() {
        this.isGameOver = true; // Met le flag à true pour arrêter les updates/spawns
        console.error("GAME OVER!");

        // Arrête le timer de spawn s'il est en cours
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }

        // Optionnel : Arrêter le mouvement des ennemis restants
        // this.enemies.getChildren().forEach(enemy => {
        //     if (enemy.active) enemy.enabled = false; // Désactive l'update de l'ennemi
        // });

        // Optionnel : Mettre la scène en pause
        // this.scene.pause();

        // Affiche le message "GAME OVER"
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 6,
            align: 'center'
        })
        .setOrigin(0.5) // Centre le texte
        .setDepth(2000); // S'assure qu'il est au-dessus de tout

        // Optionnel : Ajouter une option pour redémarrer après quelques secondes
        // this.time.delayedCall(3000, () => this.scene.restart());
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