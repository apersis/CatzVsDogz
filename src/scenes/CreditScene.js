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


        const title = this.add.text(
                this.cameras.main.centerX,
                900, // Position Y ajustable
                'Game brought to life by:\n\n',
                { 
                    fontFamily: 'McLaren',
                    fontSize: '4rem',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    align: 'center'
                }
            ).setOrigin(0.5);

        const content = this.add.text(
            this.cameras.main.centerX, // Position X centrée
            1500, // Position Y centrée
            'Allan BOUGUERAB\n \nRaphaëlle MENARD\n \nJohan MONS\n\nTom LE ROUX\n \nEloïc LESELLIER\n\n' +
            'Assets handcrafted by:\nMorgane BOILEAU\n\n' +
            'Music:\nPlease go away by The Kiffness', 
            { 
                fontFamily: 'McLaren',
                fontSize: '3rem',
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 15
            }
        ).setOrigin(0.5); // Centrage du texte

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