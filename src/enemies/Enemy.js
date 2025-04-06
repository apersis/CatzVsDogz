// src/enemies/Enemy.js
import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, health, moveSpeed, reward = 10) { // Ajout de la récompense en paramètre
        super(scene, x, y, textureKey);
        scene.add.existing(this);

        this.health = health;
        this.maxHealth = health;
        this.moveSpeed = moveSpeed;
        this.path = null;
        this.pathProgress = 0;
        this.pathVector = new Phaser.Math.Vector2();
        this.pathLength = 0;
        this.isAlive = true;
        this.reward = reward; // Propriété pour la récompense
    }

    setPath(path) {
        this.path = path;
        this.pathProgress = 0;
        this.pathLength = this.path.getLength();
        this.path.getPoint(0, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);
    }

    reachedEndOfPath() {
        if (this.isAlive) {
            this.isAlive = false;
            console.log('Enemy reached end, emitting event');
            this.scene.events.emit('enemyReachedEnd', this);
            this.destroy();
        }
    }

    takeDamage(amount) {
        if (!this.isAlive) {
            return;
        }
        this.health -= amount;
        console.log(`Enemy took ${amount} damage, health: ${this.health}`);
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.isAlive) return;
        console.log('Enemy dying');
        this.isAlive = false;
        this.scene.events.emit('enemyDied', this); // Émet un événement quand l'ennemi meurt
        this.destroy();
    }

    update(time, delta) {
        if (!this.isAlive || !this.path || this.pathLength <= 0) {
            return;
        }

        const distanceToMove = this.moveSpeed * (delta / 1000);
        this.pathProgress += distanceToMove / this.pathLength;

        if (this.pathProgress >= 1) {
            this.pathProgress = 1;
            this.path.getPoint(this.pathProgress, this.pathVector);
            this.setPosition(this.pathVector.x, this.pathVector.y);
            this.setDepth(this.y);
            this.reachedEndOfPath();
            return;
        }

        this.path.getPoint(this.pathProgress, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);
        this.setDepth(this.y);
    }
}