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
            
        // Ajoutez cette ligne :
        // 'backgroundKey' est la clé unique que vous choisissez.
        // 'assets/images/background_td.png' est le chemin depuis le dossier 'public'.
        this.load.image('backgroundKey', 'assets/level1.png');
    }

    // Dans src/scenes/PathScene.js, méthode create()
    create() {
        let bg = this.add.image(0, 0, 'backgroundKey').setOrigin(0, 0);

        this.graphics = this.add.graphics();

        // Utiliser les dimensions du jeu pour définir le chemin
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        console.log(gameHeight);
        console.log(gameWidth);

        const startX = gameWidth * 0.5; // Point de départ X relatif
        const startY = gameHeight * 0.85; // Point de départ Y relatif
        const endX = gameWidth * 0.42;   // Point d'arrivée X relatif
        const endY = gameHeight * 0.2;   // Point d'arrivée Y relatif

        // Recréez votre chemin en utilisant ces variables relatives
        // Exemple très simplifié (à adapter à votre logique de zig-zag) :
        this.path = new Phaser.Curves.Path(startX, startY); // Commence un peu en haut
        this.path.lineTo(540,1850)
        this.path.lineTo(330,1850)
        this.path.lineTo(330,1320)
        this.path.lineTo(750,1320)
        this.path.lineTo(730,880)
        this.path.lineTo(460,880)
        this.path.lineTo(endX,endY)
        this.followers = this.add.group();

        for (let i = 0; i < 32; i++)
            {
                const ball = this.followers.create(0, -50, 'golden');

                ball.setScale(0.05)
    
                ball.setData('vector', new Phaser.Math.Vector2());
    
                this.tweens.add({
                    targets: ball,
                    z: 1,
                    ease: 'Linear',
                    duration: 12000,
                    repeat: -1,
                    delay: i * 1000
                });
            }
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