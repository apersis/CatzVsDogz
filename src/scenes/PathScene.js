export default class PathScene extends Phaser.Scene
{
    constructor() {
        super('PathScene'); // Clé unique pour cette scène
    }

    followers;
    graphics;
    path;

    preload ()
    {
        this.load.image('golden', 'assets/golden.png');
    }

    // Dans src/scenes/PathScene.js, méthode create()
    create() {
        this.graphics = this.add.graphics();

        // Utiliser les dimensions du jeu pour définir le chemin
        const gameWidth = this.scale.width;  // ex: 390
        const gameHeight = this.scale.height; // ex: 844

        const startX = gameWidth * 0.1; // Point de départ X relatif
        const endX = gameWidth * 0.9;   // Point d'arrivée X relatif
        const startY = gameHeight * 0.1; // Point de départ Y relatif
        const endY = gameHeight * 0.9;   // Point d'arrivée Y relatif

        // Recréez votre chemin en utilisant ces variables relatives
        // Exemple très simplifié (à adapter à votre logique de zig-zag) :
        this.path = new Phaser.Curves.Path(startX, startY * 0.5); // Commence un peu en haut
        this.path.lineTo(startX, startY);

        const max = 8;
        const segmentHeight = (endY - startY) / max;

        for (let i = 0; i < max; i++) {
            const currentY = startY + segmentHeight * (i + 1);
            if (i % 2 === 0) {
                this.path.lineTo(endX, currentY);
            } else {
                this.path.lineTo(startX, currentY);
            }
        }

        this.followers = this.add.group();

        for (let i = 0; i < 32; i++)
            {
                const ball = this.followers.create(0, -50, 'golden');
    
                ball.setData('vector', new Phaser.Math.Vector2());
    
                this.tweens.add({
                    targets: ball,
                    z: 1,
                    ease: 'Linear',
                    duration: 12000,
                    repeat: -1,
                    delay: i * 100
                });
            }
        // this.path.lineTo(startX, endY + 50); // Ajuster la fin aussi si besoin

        // ... (le reste du code create() pour les followers) ...

        // IMPORTANT: vérifiez aussi où les followers sont créés initialement
        // this.followers.create(startX, startY * 0.5, 'ball'); // Au lieu de (0, -50) ?

        // ... (le reste du code create() pour les tweens) ...
    }

    update ()
    {
        this.graphics.clear();

        this.graphics.lineStyle(1, 0xffffff, 1);

        this.path.draw(this.graphics);

        const balls = this.followers.getChildren();

        for (let i = 0; i < balls.length; i++)
        {
            const t = balls[i].z;
            const vec = balls[i].getData('vector');

            //  The vector is updated in-place
            this.path.getPoint(t, vec);

            balls[i].setPosition(vec.x, vec.y);

            balls[i].setDepth(balls[i].y);
        }
    }
}

// const config = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     backgroundColor: '#2d2d2d',
//     parent: 'phaser-example',
//     scene: PathScene
// };

// const game = new Phaser.Game(config);