export default class PathScene extends Phaser.Scene {
  constructor() {
    super("PathScene");
    this.playerLife = 9;
    this.lifeText = null;
    this.path = null;
    this.graphics = null;
    this.dogsGroup = null;
    this.counter = 0;
    this.counterText = null;
  }

  preload() {
    this.load.image("golden", "assets/golden.png");
    this.load.image("backgroundKey", "assets/level1.png");
    this.load.image("retourBtn", "assets/retour.png");
    this.load.image("lancerBtn", "assets/lancer.png");
    this.load.image("pauseBtn", "assets/waitButton.png");
  }

  create() {
    // Setup de base
    let bg = this.add.image(0, 0, "backgroundKey").setOrigin(0, 0);

    // Texte des vies
    this.lifeText = this.add
      .text(30, 30, `Vies: ${this.playerLife}`, {
        fontSize: "32px",
        fill: "#FF0000",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setDepth(1000);

    // Setup du chemin et des chiens
    this.graphics = this.add.graphics();
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    this.path = new Phaser.Curves.Path(540, gameHeight * 0.82);
    this.path
      .lineTo(540, 1850)
      .lineTo(330, 1850)
      .lineTo(330, 1320)
      .lineTo(750, 1320)
      .lineTo(730, 880)
      .lineTo(460, 880)
      .lineTo(gameWidth * 0.42, gameHeight * 0.2);

    this.dogsGroup = this.add.group();
    const startPoint = this.path.getStartPoint();

    for (let i = 0; i < 32; i++) {
      const dog = this.dogsGroup.create(startPoint.x, startPoint.y, "golden");
      dog
        .setAlpha(0)
        .setScale(0.05)
        .setData("vector", new Phaser.Math.Vector2());

      this.tweens.add({
        targets: dog,
        z: 1,
        ease: "Linear",
        duration: 12000,
        repeat: -1,
        delay: i * 1000,
      });
    }

    // Boutons
    this.createButton("retourBtn", 0.2, 0.95);

    // Compteur (modifié)
    this.counterText = this.add
      .text(
        this.cameras.main.width * 0.49,
        this.cameras.main.height * 0.96,
        `Particules: ${this.counter}`,
        {
          fontSize: "28px",
          fill: "#FFFFFF",
        }
      )
      .setOrigin(0.5);

    // Timer qui ajoute +10 toutes les 0.1s
    this.time.addEvent({
      delay: 10,
      callback: () => {
        this.counter += 1112;
        this.counterText.setText(`Particules: ${this.counter}`);
      },
      callbackScope: this,
      loop: true,
    });
  }

  createButton(texture, xPercent, yPercent) {
    const btn = this.add
      .image(
        this.cameras.main.width * xPercent,
        this.cameras.main.height * yPercent,
        texture
      )
      .setOrigin(0.5);

    const btnScale = Math.min(
      (this.cameras.main.width * 0.3) / btn.width,
      (this.cameras.main.height * 0.1) / btn.height
    );

    btn
      .setScale(btnScale)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setScale(btnScale * 1.05))
      .on("pointerout", () => btn.setScale(btnScale))
      .on("pointerdown", () => {
        if (texture === "retourBtn") {
          this.scene.start("HomePageScene");
        }
      });

    return btn;
  }

  update() {
    // Dessin du chemin
    this.graphics.clear().lineStyle(1, 0xffffff, 0);
    this.path.draw(this.graphics);

    // Gestion des chiens
    this.dogsGroup.getChildren().forEach((dog) => {
      if (!dog.active) return;

      const t = dog.z;
      const vec = dog.getData("vector");
      this.path.getPoint(t, vec);

      dog.setPosition(vec.x, vec.y).setDepth(dog.y);

      if (dog.alpha === 0 && t > 0) dog.setAlpha(1);

      if (t >= 1.0) {
        this.playerLife -= 1;
        this.lifeText.setText(`Vies: ${this.playerLife}`);
        dog.destroy();

        if (this.playerLife <= 0) {
          this.add
            .text(this.scale.width / 2, this.scale.height / 2, "GAME OVER", {
              fontSize: "64px",
              fill: "#ff0000",
              stroke: "#000",
              strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(1000);

          this.scene.pause();
        }
      }
    });
  }
}
