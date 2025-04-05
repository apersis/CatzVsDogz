import Phaser from "phaser";

export default class PianoScene extends Phaser.Scene {
  constructor() {
    super("PianoScene"); // Clé unique
  }

  preload() {
    // Charge l'image de fond
    this.load.image(
      "background",
      "assets/backgroundLandingPage.png"
    ); /* Chemin correct */
    console.log("PianoScene: preload");
  }

  create() {
    console.log("PianoScene: create");
    // Ajoute l'image de fond
    this.add.image(0, 0, "background").setOrigin(0, 0);
  }

  update(time, delta) {
    // Cette fonction est appelée à chaque frame
  }
}
