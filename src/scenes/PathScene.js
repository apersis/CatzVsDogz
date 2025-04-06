export default class PathScene extends Phaser.Scene {
    constructor() {
        super('PathScene'); // Clé unique pour cette scène

        // --- Propriétés de la scène ---
        this.playerLife = 9;
        this.lifeText = null;
        this.path = null;
        this.graphics = null;
        this.dogsGroup = null; // Renommé: anciennement followers
    }

    preload() {
        // Renommer la clé si vous voulez, mais gardons 'golden' pour l'instant
        // Si vous renommez ici, changez aussi dans create()
        this.load.image('golden', 'assets/golden.png');
        this.load.image('backgroundKey', 'assets/level1.png');
        this.load.image('lifeFull', 'assets/pleinvie.png'); // Remplacez par le nom de votre fichier
        this.load.image('lifeEmpty', 'assets/videvi.png'); // Remplacez par le nom de votre fichier
        
    }

    create() {
        // --- Fond ---
        let bg = this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);
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

        // --- Définition du Chemin (startY modifié) ---
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const startX = 540; // TODO: Adapter !
        // *** MODIFICATION startY ***
        const startY = gameHeight * 0.82; // Modifié de 0.85 à 0.82
        // *** FIN MODIFICATION startY ***
        const endX = gameWidth * 0.42;
        const endY = gameHeight * 0.2;

        this.path = new Phaser.Curves.Path(startX, startY);
        // TODO: Adapter TOUTES ces coordonnées pour l'écran mobile !
        this.path.lineTo(540, 1850);
        this.path.lineTo(330, 1850);
        this.path.lineTo(330, 1320);
        this.path.lineTo(750, 1320);
        this.path.lineTo(730, 880);
        this.path.lineTo(460, 880);
        this.path.lineTo(endX, endY);

        // --- Création du Groupe de Chiens (Renommé) ---
        this.dogsGroup = this.add.group(); // Renommé: anciennement followers
        const startPoint = this.path.getStartPoint();

        for (let i = 0; i < 32; i++) {
            // Renommé: ball -> dog
            const dog = this.dogsGroup.create(startPoint.x, startPoint.y, 'golden');

            // *** MODIFICATION Visibilité Initiale ***
            dog.setAlpha(0); // Rendre invisible au départ
            // *** FIN MODIFICATION Visibilité Initiale ***

            dog.setScale(0.05);
            dog.setData('vector', new Phaser.Math.Vector2());

            // Le tween anime toujours la propriété 'z' qui sera lue dans update()
            this.tweens.add({
                targets: dog,
                z: 1,
                ease: 'Linear',
                duration: 12000,
                repeat: -1,
                delay: i * 1000
            });
        }
    } // Fin de create()

    update() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xffffff, 0); // Chemin invisible
        this.path.draw(this.graphics);

        // Renommé: balls -> dogs, followers -> dogsGroup
        const dogs = this.dogsGroup.getChildren();

        // Itération arrière
        for (let i = dogs.length - 1; i >= 0; i--) {
            // Renommé: ball -> dog
            const dog = dogs[i];
            if (!dog || !dog.active) {
                 continue;
            }

            const t = dog.z; // Progression 0 à 1
            const vec = dog.getData('vector');

            // Mise à jour position
            this.path.getPoint(t, vec);
            dog.setPosition(vec.x, vec.y);
            dog.setDepth(dog.y); // Profondeur basée sur Y

            // *** MODIFICATION : Rendre visible si bouge ***
            // Si le chien est invisible ET que sa progression est > 0 (il a commencé à bouger)
            if (dog.alpha === 0 && t > 0) {
                dog.setAlpha(1); // Le rendre visible
            }
            // *** FIN MODIFICATION ***

            // --- Logique de fin de chemin MODIFIÉE ---
            if (t >= 1.0) {
                console.log('Chien a atteint la fin!');

                // 1. Détruire le chien AVANT de changer la vie/sprite
                dog.destroy();

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
                        console.error("GAME OVER SIMPLE!");
                        this.scene.pause();
                        // Afficher Game Over Text (avec Z-index élevé)
                        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 6 })
                            .setOrigin(0.5)
                            .setDepth(1000); // Z-index élevé
                    }
                }
            }
        }
    } // Fin de update()

} // Fin de la classe