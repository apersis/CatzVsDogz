import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  preload() {
    this.load.image("background", "assets/backgroundLandingPage.png");
    this.load.image("playBtn", "assets/play.png");
    this.load.image("creditsBtn", "assets/credits.png");
    this.load.image("settingsBtn", "assets/settings.png");
    this.load.image("playBerliozBtn", "assets/playWithBerlioz.png");
    console.log("SettingsScene: preload");
  }

  create() {
    console.log("SettingsScene: create");

    // Ajout du background
    const bg = this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "background")
      .setOrigin(0.5);

    // Ajustement de la taille
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Création des particules rouges (sans asset externe)
    this.createParticles();
  }

  createParticles() {
    // 1. Création dynamique d'une texture pour les particules
    const particleSize = 15;
    const graphics = this.make.graphics({ fillStyle: { color: 0xff0000 } }); // Rouge
    graphics.fillCircle(particleSize, particleSize, particleSize); // Dessine un cercle

    // Génère une texture temporaire
    const texture = this.textures.createCanvas(
      "particleTexture",
      particleSize * 2,
      particleSize * 2
    );
    texture.draw(graphics, 0, 0); // Dessine le graphique sur la texture
    texture.refresh(); // Actualise la texture
    graphics.destroy(); // Nettoie le graphique temporaire

    // 2. Création du système de particules centré
    const particles = this.add.particles("particleTexture");

    // 3. Configuration de l'émetteur
    particles.createEmitter({
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY,
      lifespan: 2000,
      speed: { min: 20, max: 50 },
      scale: { start: 1, end: 0.2 },
      alpha: { start: 1, end: 0 },
      blendMode: "ADD",
      frequency: 50,
      quantity: 3,
      emitZone: {
        type: "random",
        source: new Phaser.Geom.Circle(0, 0, 30), // Émission dans un cercle de 30px
      },
    });
  }
}
