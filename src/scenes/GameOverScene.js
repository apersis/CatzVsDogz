// src/scenes/GameOverScene.js
import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        // Clé unique pour cette nouvelle scène
        super('GameOverScene');
    }

    preload() {
        // Charger les images nécessaires pour CET écran spécifiquement

        // 1. Charger l'image de fond (si différente ou non chargée globalement)
        // Si c'est la même que 'backgroundKey' et qu'elle est déjà chargée par une autre scène
        // qui tourne en parallèle (peu probable ici), vous n'avez pas besoin de la recharger.
        // Pour être sûr, on peut la recharger ici :
        this.load.image('backgroundGameOver', 'assets/backgroundLandingPage.png'); // Ou utilisez une image de fond spécifique au Game Over

        // 2. Charger l'image "Game Over" que vous voulez afficher par-dessus
        this.load.image('gameOverImage', 'assets/game-over.png'); 
        this.load.image('playAgainImage', 'assets/play-again.png');
    }

    create() {

        // 1. Afficher l'image de fond
        let bg = this.add.image(0, 0, 'backgroundGameOver').setOrigin(0, 0);
        // Ajuster sa taille pour remplir l'écran
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // 2. Afficher l'image "Game Over" par-dessus
        // Centre l'image au milieu de l'écran
        let gameOverImg = this.add.image(
            this.scale.width / 2.5,
            this.scale.height / 2, // Ajustez la position Y si besoin (ex: * 0.4 pour la monter un peu)
            'gameOverImage'
        );
        // gameOverImg.setOrigin(0.5); // Origine au centre (par défaut pour les images)
        // Optionnel: Redimensionner l'image Game Over si elle est trop grande/petite
        gameOverImg.setScale(0.4);

        let playAgainImg = this.add.image(
            this.scale.width / 2.5,
            this.scale.height / 1.3, // Ajustez la position Y si besoin (ex: * 0.4 pour la monter un peu)
            'playAgainImage'
        );
        playAgainImg.setScale(1.5);

        this.createButton('playAgainBtn', this.scale.width / 2.5, this.scale.height / 1.3 );

        // 3. Optionnel : Ajouter un texte ou un bouton pour rejouer
        this.add.text(this.scale.width / 2, this.scale.height * 0.75, 'Cliquez pour Rejouer', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        })
        .setOrigin(0.5) // Centrer le texte
        .setDepth(1)    // S'assurer qu'il est devant l'image Game Over si elle est grande
        .setInteractive() // Rend le texte cliquable
        .on('pointerdown', () => {
            console.log('Restarting game...');
            // Relance la scène de jeu principale (assurez-vous que la clé 'PathScene' est correcte)
            this.scene.start('PathScene');
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
      if (texture === "retourBtn") {
        this.scene.start("HomePageScene");
      }
      if (texture === "playAgainBtn") {
          this.scene.start("PathScene");
          this.sound.play("backgroundMusic", { loop: true });
      }
    });

    return btn;
  }
}