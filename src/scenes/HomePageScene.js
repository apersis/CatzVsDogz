import Phaser from "phaser";

export default class HomePageScene extends Phaser.Scene {
  // <-- Correction du nom de la classe
  constructor() {
    super("HomePageScene"); // <-- Correction de la clé de la scène
  }

    preload() {
        this.load.image('background', 'assets/backgroundLandingPage.png');
        this.load.image('catHome', 'assets/catHome.png');

        this.load.image('playBtn', 'assets/play.png');
        this.load.image('creditsBtn', 'assets/credits.png');
        this.load.image('settingsBtn', 'assets/settings.png');
        this.load.image('playBerliozBtn', 'assets/playWithBerlioz.png');
        console.log('HomePageScene: preload');
    }

  create() {
    console.log("HomePageScene: create");

    // Ajout du background
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "background")
        .setOrigin(0.5);
    const scale = Math.max(
        this.cameras.main.width / bg.width,
        this.cameras.main.height / bg.height
    );
    bg.setScale(scale).setScrollFactor(0);

    // Image du chat
    const catHome = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY * 0.85, "catHome")
        .setOrigin(0.5);
    catHome.setScale(Math.min(
        (this.cameras.main.width * 1.4) / catHome.width,
        (this.cameras.main.height * 0.8) / catHome.height
    ));

    // Configuration des boutons
    const buttonsConfig = [
        { texture: "playBtn", yPos: 0.5, scaleMultiplier: 1.0 },
        { texture: "playBerliozBtn", yPos: 0.62, scaleMultiplier: 1.5 }, // 15% plus grand
        { texture: "settingsBtn", yPos: 0.72, scaleMultiplier: 1.0 },
        { texture: "creditsBtn", yPos: 0.82, scaleMultiplier: 1.0 }
    ];

    buttonsConfig.forEach(btnConfig => {
        const btn = this.add.image(
            this.cameras.main.width * 0.5,
            this.cameras.main.height * btnConfig.yPos,
            btnConfig.texture
        ).setOrigin(0.5);

        // Calcul de la taille de base
        const baseScale = Math.min(
            (this.cameras.main.width * 0.65) / btn.width,
            (this.cameras.main.height * 0.1) / btn.height
        );

        // Application du multiplicateur de taille
        btn.setScale(baseScale * btnConfig.scaleMultiplier);

        // Interaction (inchangé)
        btn.setInteractive({ useHandCursor: true });
        btn.on("pointerover", () => btn.setScale(baseScale * btnConfig.scaleMultiplier * 1.05));
        btn.on("pointerout", () => btn.setScale(baseScale * btnConfig.scaleMultiplier));
        btn.on("pointerdown", () => this.handleButtonClick(btnConfig.texture));
    });
}

handleButtonClick(texture) {
    console.log(texture + " clicked");
    
    const sceneMap = {
        "playBtn": "PathScene",
        "playBerliozBtn": "PianoScene",
        "settingsBtn": "SettingsScene",
        "creditsBtn": "CreditScene"
    };

    if (sceneMap[texture]) {
        this.scene.start(sceneMap[texture]);
        if (texture === "playBtn") {
            this.sound.play("backgroundMusic", { loop: true });
        }
    }
}
}
