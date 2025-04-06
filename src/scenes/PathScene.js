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
        this.load.image('originTower', 'assets/tower1.png')
            
        // Ajoutez cette ligne :
        // 'backgroundKey' est la clé unique que vous choisissez.
        // 'assets/images/background_td.png' est le chemin depuis le dossier 'public'.
        this.load.image('backgroundKey', 'assets/level1.png');
    }

    create() {
        // --- Fond ---
        let bg = this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);
        let tower = this.add.image(550, 775, 'originTower')
        tower.setScale(0.07)
        let towerDeux = this.add.image(340, 775, 'originTower')
        towerDeux.setScale(0.07)
        let towerTrois = this.add.image(550, 820, 'originTower')
        towerTrois.setScale(0.07)
        let towerQuatre = this.add.image(750, 820, 'originTower')
        towerQuatre.setScale(0.07)
        let towerCinq = this.add.image(650, 900, 'originTower')
        towerCinq.setScale(0.07)
        let towerSix = this.add.image(340, 950, 'originTower')
        towerSix.setScale(0.07)
        let towerSept = this.add.image(550, 950, 'originTower')
        towerSept.setScale(0.07)
        let towerHuit = this.add.image(340, 1000, 'originTower')
        towerHuit.setScale(0.07)
        let towerNeuf = this.add.image(260, 1000, 'originTower')
        towerNeuf.setScale(0.07)
        let towerDix = this.add.image(340, 1200, 'originTower')
        towerDix.setScale(0.07)

        // bg.setDisplaySize(this.scale.width, this.scale.height);

        // --- Texte de Vie ---
        this.lifeText = this.add.text(30, 30, `Vies: ${this.playerLife}`, {
            fontSize: '32px', fill: '#FF0000', stroke: '#000', strokeThickness: 4
        });
        this.lifeText.setDepth(1000); // Augmenté pour être sûr qu'il soit devant les chiens

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

            // Logique de fin de chemin
            if (t >= 1.0) {
                console.log('Chien a atteint la fin!');
                this.playerLife -= 1;
                if (this.playerLife < 0) this.playerLife = 0;

                if (this.lifeText) {
                    this.lifeText.setText(`Vies: ${this.playerLife}`);
                } else {
                    console.warn("this.lifeText n'est pas défini.");
                }

                dog.destroy(); // Détruire le chien

                // Game Over Check
                if (this.playerLife <= 0) {
                    console.error("GAME OVER SIMPLE!");
                    this.scene.pause();

                    // Afficher Game Over Text
                    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
                        fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 6
                     })
                     .setOrigin(0.5)
                     // *** MODIFICATION Z-Index Game Over ***
                     .setDepth(1000); // Valeur élevée pour être sûr qu'il est au-dessus de tout
                     // *** FIN MODIFICATION Z-Index ***
                }
            }
        }
    } // Fin de update()

} // Fin de la classe