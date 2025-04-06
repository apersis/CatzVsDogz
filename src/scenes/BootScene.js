// src/scenes/BootScene.js
import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene'); // Clé unique pour cette scène
    }

    preload() {
        // Ici, on chargerait les assets MINIMAUX nécessaires pour l'écran de chargement suivant
        // (ex: logo, barre de chargement)
    }

    create() {
        // Une fois les assets minimes chargés (ou immédiatement si pas d'écran de chargement),
        // on lance la scène principale du jeu.
        this.scene.start('HomePageScene'); // Remplacez par 'HomePageScene' si nécessaire
    }
}