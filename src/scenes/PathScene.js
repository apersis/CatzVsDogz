import Phaser from 'phaser';
import Enemy from '../enemies/Enemy.js';

export default class PathScene extends Phaser.Scene {
    constructor() {
        super('PathScene');
        this.graphics = null;
        this.path = null;
        this.enemies = null; // Groupe pour nos ennemis
    }

    preload() {
        this.load.image('golden', 'assets/golden.png');
        this.load.image('backgroundKey', 'assets/level1.png');
        this.load.image('chihuahua', 'assets/chihuahua.png');
        this.load.image('basset', 'assets/basset.png');
    }

    create() {
        let bg = this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);

        this.graphics = this.add.graphics();
        this.path = this.createPath();

        this.enemies = this.add.group();

        // Exemple d'utilisation de la fonction pour créer 10 ennemis aléatoires
        this.createRandomEnemies(10);
    }

    createPath() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const startX = gameWidth * 0.5;
        const startY = gameHeight * 0.85;
        const endX = gameWidth * 0.42;
        const endY = gameHeight * 0.2;

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

    createRandomEnemies(numberOfEnemies) {
        const enemyTypes = ['golden', 'chihuahua', 'basset']; // Liste des clés d'images d'ennemis
        const minHealth = 50;
        const maxHealth = 150;
        const minSpeed = 30;
        const maxSpeed = 70;

        for (let i = 0; i < numberOfEnemies; i++) {
            const startPoint = this.path.getPoint(0);
            const randomTexture = Phaser.Math.RND.pick(enemyTypes);
            const randomHealth = Phaser.Math.RND.integerInRange(minHealth, maxHealth);
            const randomSpeed = Phaser.Math.RND.integerInRange(minSpeed, maxSpeed);

            const enemy = new Enemy(this, startPoint.x, startPoint.y, randomTexture, randomHealth, randomSpeed);
            enemy.setScale(0.5); // Réduit la taille de l'image de moitié (ajustez la valeur selon vos besoins)
            enemy.setPath(this.path);
            this.enemies.add(enemy);
        }
    }

    update() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xffffff, 0);
        this.path.draw(this.graphics);

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.time.now, this.delta);
        });
    }
}