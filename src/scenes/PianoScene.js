import Phaser from "phaser";

export default class PianoScene extends Phaser.Scene {
  constructor() {
    super("PianoScene");
  }

  preload() {
    this.load.image("background", "assets/backgroundLandingPage.png");

    // Chargement des images des touches
    for (let i = 1; i <= 4; i++) {
      this.load.image(`Piano${i}`, `assets/Piano${i}.png`);
      this.load.audio(`son${i}`, `assets/son${i}.mp3`); // Chargement des sons
    }

    console.log("PianoScene: preload");
  }

  create() {
    console.log("PianoScene: create");

    // Ajout du background
    const bg = this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "background")
      .setOrigin(0.5);

    // Ajustement de la taille du background
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Création des touches du piano (2 lignes de 4 touches collées)
    const toucheWidth = 100; // Largeur des touches
    const startX = (this.cameras.main.width - toucheWidth * 4) / 2; // Centrage horizontal

    for (let i = 1; i <= 4; i++) {
      const touche1 = this.add
        .image(
          startX + toucheWidth * (i - 1),
          this.cameras.main.height * 0.7,
          `Piano${i}`
        )
        .setOrigin(0, 0) // Alignement à gauche
        .setInteractive();

      const touche2 = this.add
        .image(
          startX + toucheWidth * (i - 1),
          this.cameras.main.height * 0.85,
          `Piano${i}`
        )
        .setOrigin(0, 0) // Alignement à gauche
        .setInteractive();

      // Ajustement de la taille des touches
      const toucheScale = Math.min(
        toucheWidth / touche1.width,
        (this.cameras.main.height * 0.15) / touche1.height
      );
      touche1.setScale(toucheScale);
      touche2.setScale(toucheScale);

      // Interaction avec les touches
      touche1.on("pointerdown", () => {
        this.sound.play(`son${i}`);
      });

      touche2.on("pointerdown", () => {
        this.sound.play(`son${i}`);
      });
    }
  }
}
