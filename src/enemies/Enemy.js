// src/enemies/Enemy.js
import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, health, moveSpeed) {
        super(scene, x, y, textureKey);
        scene.add.existing(this); // Ajoute l'ennemi à la scène

        this.health = health;
        this.maxHealth = health;
        this.moveSpeed = moveSpeed; // Vitesse en pixels par seconde
        this.path = null;
        this.pathProgress = 0; // Progression sur le chemin (0 à 1)
        this.pathVector = new Phaser.Math.Vector2(); // Vecteur pour stocker la position sur le chemin
        this.pathLength = 0; // Longueur totale du chemin (pour le calcul de progression)
        this.isAlive = true;
    }

    setPath(path) {
        this.path = path;
        this.pathProgress = 0; // Commence au début
        this.pathLength = this.path.getLength(); // Calcule la longueur une fois
        // Positionne l'ennemi au point de départ exact
        this.path.getPoint(0, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);
    }

    // Pas besoin de moveToNextPoint ou destination avec cette approche

    reachedEndOfPath() {
        if (this.isAlive) {
            this.isAlive = false; // Marque comme non vivant pour éviter actions multiples
            console.log('Enemy reached end, emitting event'); // Log pour vérifier
            // Émettre l'événement AVANT de détruire, pour que la scène puisse réagir
            this.scene.events.emit('enemyReachedEnd', this);
            this.destroy(); // L'ennemi se détruit proprement
        }
    }

    takeDamage(amount) {
        if (!this.isAlive) {
            return;
        }
        this.health -= amount;
        console.log(`Enemy took ${amount} damage, health: ${this.health}`); // Log dégâts
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.isAlive) return; // Évite double mort
        console.log('Enemy dying'); // Log mort
        this.isAlive = false;
        // Ici, tu pourrais ajouter une animation de mort, des particules, etc.
        // Émettre un événement si la scène doit savoir qu'un ennemi est mort (pour l'argent, score...)
        // this.scene.events.emit('enemyDied', this);
        this.destroy(); // Se détruit
    }

    update(time, delta) {
        // Si l'ennemi n'est plus vivant ou n'a pas de chemin, on arrête
        if (!this.isAlive || !this.path || this.pathLength <= 0) {
            return;
        }

        // Calculer la distance à parcourir pour ce frame
        const distanceToMove = this.moveSpeed * (delta / 1000); // delta est en ms, on veut s

        // Calculer l'incrément de progression sur le chemin (distance / longueur totale)
        this.pathProgress += distanceToMove / this.pathLength;

        // Vérifier si on a atteint ou dépassé la fin
        if (this.pathProgress >= 1) {
            this.pathProgress = 1; // Bloquer à 1 pour être sûr
            this.path.getPoint(this.pathProgress, this.pathVector); // Aller au point final exact
            this.setPosition(this.pathVector.x, this.pathVector.y); // Se positionner
            this.setDepth(this.y); // Mettre à jour la profondeur une dernière fois
            this.reachedEndOfPath(); // Déclencher la logique de fin de chemin
            return; // Arrêter l'update ici car l'ennemi sera détruit
        }

        // Obtenir le point sur la courbe correspondant à la progression
        this.path.getPoint(this.pathProgress, this.pathVector);

        // Mettre à jour la position du sprite
        this.setPosition(this.pathVector.x, this.pathVector.y);

        // Gérer la profondeur pour le rendu (comme dans ton ancien code)
        this.setDepth(this.y);
    }
}