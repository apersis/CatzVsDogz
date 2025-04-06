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
        this.load.image('accueilImage', 'assets/retour.png')
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
            this.scale.width / 2,
            this.scale.height / 1.3, // Ajustez la position Y si besoin (ex: * 0.4 pour la monter un peu)
            'playAgainImage'
        );
        playAgainImg.setScale(1.5);
        playAgainImg.setInteractive({ useHandCursor: true }); // Rend l'IMAGE interactive et change le curseur au survol
        playAgainImg.on('pointerdown', () => {
            console.log('Play Again Image clicked! Restarting game...');
            // Relance la scène de jeu principale
            this.scene.stop('GameOverScene');
            this.scene.start('PathScene'); // Assurez-vous que 'PathScene' est la bonne clé
        });
        playAgainImg.on('pointerover', () => {
            // Légèrement plus clair au survol
            playAgainImg.setTint(0xDDDDDD);
        });
        playAgainImg.on('pointerout', () => {
            // Revient à la normale quand le curseur quitte l'image
            playAgainImg.clearTint();
        });

        gameOverImg.setScale(0.4);

        let homeImg = this.add.image(
            this.scale.width / 2,
            this.scale.height / 1.1, // Ajustez la position Y si besoin (ex: * 0.4 pour la monter un peu)
            'accueilImage'
        );
        homeImg.setScale(1.5);
        homeImg.setInteractive({ useHandCursor: true }); // Rend l'IMAGE interactive et change le curseur au survol
        homeImg.on('pointerdown', () => {
            console.log('Play Again Image clicked! Restarting game...');
            // Relance la scène de jeu principale
            this.scene.stop('GameOverScene');
            this.scene.start('HomePageScene'); // Assurez-vous que 'PathScene' est la bonne clé
        });
        homeImg.on('pointerover', () => {
            // Légèrement plus clair au survol
            homeImg.setTint(0xDDDDDD);
        });
        homeImg.on('pointerout', () => {
            // Revient à la normale quand le curseur quitte l'image
            homeImg.clearTint();
        });
    }
}