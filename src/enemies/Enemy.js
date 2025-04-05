import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, health, moveSpeed) {
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this); // Active la physique pour le mouvement

        this.health = health;
        this.maxHealth = health;
        this.moveSpeed = moveSpeed;
        this.path = null;
        this.pathIndex = 0;
        this.destination = null;
        this.isAlive = true;
    }

    setPath(path) {
        this.path = path;
        this.pathIndex = 0;
        this.moveToNextPoint();
    }

    moveToNextPoint() {
        if (this.path && this.pathIndex < this.path.getLength()) {
            const nextPoint = this.path.getPoint(this.pathIndex / (this.path.getLength() - 1));
            this.destination = new Phaser.Math.Vector2(nextPoint.x, nextPoint.y);
            this.scene.physics.moveToObject(this, this.destination, this.moveSpeed);
            this.pathIndex++;
        } else {
            this.reachedEndOfPath();
        }
    }

    reachedEndOfPath() {
        console.log('Ennemi a atteint la fin du chemin !');
        this.destroy(); // Ou effectuez d'autres actions (infliger des dégâts à la base, etc.)
    }

    takeDamage(amount) {
        if (!this.isAlive) {
            return;
        }
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        this.body.velocity.set(0);
        this.destroy();
    }

    update(time, delta) {
        if (!this.isAlive || !this.body || !this.destination) {
            return;
        }

        const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.destination.x, this.destination.y);

        if (distanceToTarget < 5) { // Seuil pour considérer le point atteint
            this.body.reset(this.destination.x, this.destination.y); // Réinitialise position et vitesse
            this.moveToNextPoint();
        }
    }
}