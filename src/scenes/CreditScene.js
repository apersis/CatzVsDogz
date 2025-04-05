import Phaser from 'phaser';

export default class CreditScene extends Phaser.Scene {  // <-- Correction du nom de la classe
    constructor() {
        super('CreditScene');
    }

    preload() {
        this.load.image('background', 'assets/backgroundLandingPage.png');
        this.load.image('retourBtn', 'assets/retour.png');

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

        this.createButton('retourBtn', 0.2, 0.90);   
    }

    createButton(texture, xPercent, yPercent) {
        const btn = this.add.image(
            this.cameras.main.width * xPercent,
            this.cameras.main.height * yPercent,
            texture
        ).setOrigin(0.5);

        // Ajustement de la taille du bouton
        const btnScale = Math.min(
            (this.cameras.main.width * 0.7) / btn.width,
            (this.cameras.main.height * 0.15) / btn.height
        );
        btn.setScale(btnScale);

        // Interaction avec le bouton
        btn.setInteractive({ useHandCursor: true });
        
        btn.on('pointerover', () => {
            btn.setScale(btnScale * 1.05);
        });
        
        btn.on('pointerout', () => {
            btn.setScale(btnScale);
        });
        
        btn.on('pointerdown', () => {
            // Vous pouvez ajouter ici les actions pour chaque bouton
            console.log(texture + ' clicked');
            
            if (texture === 'retourBtn') {
                this.scene.start('HomePageScene');
            }
        });

        return btn;
    }
}