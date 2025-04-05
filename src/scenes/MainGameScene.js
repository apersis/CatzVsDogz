// src/scenes/MainGameScene.js
import Phaser from 'phaser';

export default class MainGameScene extends Phaser.Scene {
    constructor() {
        super('MainGameScene'); // Clé unique
    }

    preload() {
        // C'est ici qu'on chargera TOUS les assets du jeu principal :
        // - Image de la carte (map)
        // - Sprites des tours
        // - Sprites des ennemis (spritesheets pour animations)
        // - Sons, musique, polices...
        // Exemples (à décommenter et adapter avec vos fichiers):
        // this.load.image('background', 'assets/images/background.png');
        // this.load.image('towerPlaceholder', 'assets/images/tower.png');
        // this.load.spritesheet('enemyWalk', 'assets/sprites/enemy_walk.png', { frameWidth: 32, frameHeight: 32 });
        console.log('MainGameScene: preload');
    }

    create() {
        console.log('MainGameScene: create');
        // Mettre en place les éléments initiaux du jeu

        // 1. Fond (simple couleur pour l'instant)
        this.cameras.main.setBackgroundColor('#3d3d3d');
        // Ou si vous avez chargé une image 'background' dans preload:
        // this.add.image(0, 0, 'background').setOrigin(0, 0);

        // 2. Afficher un texte de titre simple
        this.add.text(this.scale.width / 2, 50, 'Tower Defense - Mobile Setup', {
            fontSize: '20px', // Ajuster la taille pour mobile
            fill: '#ffffff'
        }).setOrigin(0.5); // Centrer le texte horizontalement

        // 3. Zone de jeu (pour référence visuelle - à supprimer plus tard)
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00ff00, 1);
        // Dessine un rectangle représentant les limites du canvas défini
        graphics.strokeRect(0, 0, this.scale.width, this.scale.height);

        // --- Ici commencerait la logique du Tower Defense ---
        // - Dessiner/placer la carte/chemin
        // - Initialiser les emplacements de tours
        // - Mettre en place l'interface utilisateur (vie, argent...)
        // - Préparer le système de vagues d'ennemis
    }

    update(time, delta) {
        // Cette fonction est appelée à chaque frame (environ 60 fois par seconde)
        // C'est ici qu'on mettra la logique qui évolue dans le temps :
        // - Déplacement des ennemis
        // - Visée et tir des tours
        // - Gestion des vagues
        // - Vérification des conditions de victoire/défaite
    }
}