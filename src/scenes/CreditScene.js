import Phaser from 'phaser';

export default class CreditScene extends Phaser.Scene {  // <-- Correction du nom de la classe
    constructor() {
        super('CreditScene');  // <-- Correction de la clé de la scène
    }

    preload() {
        this.load.image('background', 'assets/backgroundLandingPage.png');

        console.log('CreditScene: preload');
    }

    create() {
        console.log('CreditScene: create');
        
        // Ajout du background
        const bg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'background'
        ).setOrigin(0.5);

        // Ajustement de la taille
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);  
    }
}