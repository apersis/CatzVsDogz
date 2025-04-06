import Phaser from 'phaser';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    preload() {
        this.load.image('background', 'assets/backgroundLandingPage.png');
        this.load.image('retourBtn', 'assets/retour.png');

        //Remplacer par les bons assets
        this.load.image('difficulte', 'assets/difficulte.png');
        this.load.image('btnNormal', 'assets/easy.png'); // Level easy
        this.load.image('btnActive', 'assets/hard.png'); // Level hard au clic
        console.log('SettingsScene: preload');
    }

    create() {
        console.log('SettingsScene: create');
        
        // Ajout du background
        const bg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'background'
        ).setOrigin(0.5);

        // Ajustement du background
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);  

        const difficulte = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY*0.8,
            'difficulte'
        ).setOrigin(0.5);

        // Ajustement de la taille de l'image difficulté
        const diffScale = Math.min(
        (this.cameras.main.width * 0.8) / difficulte.width,
        (this.cameras.main.height * 0.2) / difficulte.height
    );
    difficulte.setScale(diffScale);

        this.createButton('retourBtn', 0.2, 0.90);  

        this.createToggleButton(0.5, 0.5);
    }

    createToggleButton(xPercent, yPercent) {
        // Création du bouton avec l'image normale
        const btn = this.add.image(
            this.cameras.main.width * xPercent,
            this.cameras.main.height * yPercent,
            'btnNormal'
        ).setOrigin(0.5);

        // Ajustement taille
        const btnScale = Math.min(
            (this.cameras.main.width * 0.4) / btn.width,
            (this.cameras.main.height * 0.2) / btn.height
        );
        btn.setScale(btnScale).setInteractive({ useHandCursor: true });

        // Interaction
        let isActive = false; // État initial
        
        btn.on('pointerdown', () => {
            isActive = !isActive; // Inverse l'état
            btn.setTexture(isActive ? 'btnActive' : 'btnNormal');
            
// !!!!! Ajoutez ici la logique liée au changement d'état
            console.log('Bouton toggle:', isActive ? 'ACTIF' : 'INACTIF');
        });

        // Effet hover
        btn.on('pointerover', () => {
            btn.setScale(btnScale * 1.1);
        });
        
        btn.on('pointerout', () => {
            btn.setScale(btnScale);
        });

        return btn;
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