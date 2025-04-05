import Phaser from 'phaser';

export default class HomePageScene extends Phaser.Scene {  // <-- Correction du nom de la classe
    constructor() {
        super('HomePageScene');  // <-- Correction de la clé de la scène
    }

    preload() {
        this.load.image('background', 'assets/backgroundLandingPage.png');
        this.load.image('playBtn', 'assets/play.png');
        this.load.image('creditsBtn', 'assets/credits.png');
        this.load.image('settingsBtn', 'assets/settings.png');
        this.load.image('playBerliozBtn', 'assets/playWithBerlioz.png');
        console.log('HomePageScene: preload');
    }

    create() {
        console.log('HomePageScene: create');
        
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

        this.createButton('playBtn', 0.5, 0.4);
        this.createButton('playBerliozBtn', 0.5, 0.55);
        this.createButton('settingsBtn', 0.5, 0.7);
        this.createButton('creditsBtn', 0.5, 0.85);        
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
            
            // Exemple pour le bouton Play :
            if (texture === 'playBtn') {
                this.scene.start('MainGameScene');
            }
            if (texture === 'playBerliozBtn') {
                this.scene.start('PianoScene');
            }
            if (texture === 'settingsBtn') {
                this.scene.start('SettingsScene');
            }
            if (texture === 'creditsBtn') {
                this.scene.start('CreditScene');
            }
        });

        return btn;
    }
}