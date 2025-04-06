import Phaser from "phaser";

export default class PianoScene extends Phaser.Scene {
  constructor() {
    super("PianoScene");
  }

  preload() {
    this.load.image("background", "assets/backgroundLandingPage.png");
    this.load.image("retourBtn", "assets/retour.png");

    // Chargement des images des touches
    for (let i = 1; i <= 8; i++) {
      this.load.image(`Piano${i}`, `assets/Piano${i}.png`);
      this.load.audio(`son${i}`, `assets/son${i}.mp3`);
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

    // Paramètres des touches
    const keyWidth = 200;
    const keyHeight = 400;
    const totalWidth = keyWidth * 4; // Largeur totale des 4 touches par ligne
    const startX = (this.cameras.main.width - totalWidth) / 2; // Position de départ pour centrage
    const yPosition1 = this.cameras.main.height * 0.6; // Position verticale de la première ligne
    const yPosition2 = this.cameras.main.height * 0.75; // Position verticale de la deuxième ligne

    // Création des touches du piano (2 lignes identiques)
    for (let i = 0; i < 4; i++) {
      const touche1 = this.add
        .image(startX + keyWidth * i, yPosition1, `Piano${i + 1}`)
        .setDisplaySize(keyWidth, keyHeight)
        .setOrigin(0, 0.5)
        .setInteractive();

      touche1.on("pointerdown", () => {
        this.sound.play(`son${i + 1}`);
      });

      const touche2 = this.add
        .image(startX + keyWidth * i, yPosition2, `Piano${i + 1}`) // Touches identiques à la première ligne
        .setDisplaySize(keyWidth, keyHeight)
        .setOrigin(0, 0.5)
        .setInteractive();

      touche2.on("pointerdown", () => {
        this.sound.play(`son${i + 5}`); // Jouer les sons 5 à 8
      });
    }
    this.createButton("retourBtn", 0.2, 0.9);
  }

  createButton(texture, xPercent, yPercent) {
    const btn = this.add
      .image(
        this.cameras.main.width * xPercent,
        this.cameras.main.height * yPercent,
        texture
      )
      .setOrigin(0.5);

    // Ajustement de la taille du bouton
    const btnScale = Math.min(
      (this.cameras.main.width * 0.7) / btn.width,
      (this.cameras.main.height * 0.15) / btn.height
    );
    btn.setScale(btnScale);

    // Interaction avec le bouton
    btn.setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => {
      btn.setScale(btnScale * 1.05);
    });

    btn.on("pointerout", () => {
      btn.setScale(btnScale);
    });

    btn.on("pointerdown", () => {
      // Vous pouvez ajouter ici les actions pour chaque bouton
      console.log(texture + " clicked");

      if (texture === "retourBtn") {
        this.scene.start("HomePageScene");
      }
    });

    return btn;
  }
}
