import Phaser from 'phaser';

export default class Tower extends Phaser.GameObjects.Image {

    /**
     * Constructeur de la classe Tower.
     * @param {Phaser.Scene} scene La scène à laquelle la tour appartient.
     * @param {number} x Position X.
     * @param {number} y Position Y.
     * @param {string} texture Clé de la texture de la tour.
     * @param {number} range Portée d'attaque (en pixels).
     * @param {number} damage Dégâts infligés par tir.
     * @param {number} attackRate Temps entre chaque tir (en millisecondes).
     * @param {number} cost Coût d'invocation de la tour.
     * @param {Phaser.GameObjects.Group} enemiesGroup Référence au groupe d'ennemis de la scène.
     */
    constructor(scene, x, y, texture, range, damage, attackRate, cost, enemiesGroup) {
        super(scene, x, y, texture);
        scene.add.existing(this); // Ajoute la tour à la scène

        // --- Propriétés Principales ---
        this.range = range;
        this.damage = damage;
        this.attackRate = attackRate; // Temps en ms entre les tirs
        this.cost = cost;
        this.enemiesGroup = enemiesGroup; // Référence au groupe d'ennemis

        // --- État Interne ---
        this.attackTimer = 0; // Compteur pour le délai d'attaque
        this.target = null; // Référence à l'ennemi actuellement ciblé

        // --- Visuel (Optionnel) ---
        this.rangeCircle = scene.add.circle(this.x, this.y, this.range);
        this.rangeCircle.setStrokeStyle(1, 0xffffff, 0.3); // Blanc semi-transparent
        this.rangeCircle.setVisible(false); // Cache par défaut
    }

    // Méthode pour définir le groupe d'ennemis (si non passé au constructeur)
    setEnemiesGroup(group) {
        this.enemiesGroup = group;
    }

    // Méthode appelée à chaque frame par le groupe de tours
    update(time, delta) {
        // Incrémente le timer d'attaque
        this.attackTimer += delta;

        // Vérifie s'il est temps d'attaquer
        if (this.attackTimer >= this.attackRate) {
            // Trouve une cible potentielle
            this.findTarget();

            // Si une cible a été trouvée (et est toujours valide)
            if (this.target && this.target.active && this.target.isAlive) {
                // Vérifie si la cible est toujours à portée (sécurité)
                const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

                if (distanceToTarget <= this.range) {
                    // Tire sur la cible
                    this.fire();
                    // Réinitialise le timer d'attaque
                    this.attackTimer -= this.attackRate;
                } else {
                    // La cible est sortie de portée, on l'oublie
                    this.target = null;
                }
            }
        } else if (!this.target) {
            this.findTarget(); // Cherche une cible même si pas prêt à tirer
        }
    }

    // Trouve l'ennemi valide le plus proche à portée
    findTarget() {
        let closestEnemy = null;
        let minDistance = Infinity;

        this.enemiesGroup.getChildren().forEach(enemy => {
            if (enemy.active && enemy.isAlive) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < minDistance && distance <= this.range) {
                    minDistance = distance;
                    closestEnemy = enemy;
                }
            }
        });

        this.target = closestEnemy;
    }

    // Fonction pour effectuer le tir (direct damage)
    fire() {
        if (this.target && this.target.active && this.target.isAlive) {
            console.log(`Tower at (${this.x}, ${this.y}) firing at enemy!`);

            // --- Action Principale : Infliger les dégâts ---
            this.target.takeDamage(this.damage);

            // --- Effets Visuels/Sonores (TODO) ---
            let line = this.scene.add.line(0, 0, this.x, this.y, this.target.x, this.target.y, 0xff0000, 0.8).setOrigin(0,0);
            line.setLineWidth(2);
            this.scene.time.delayedCall(100, () => { line.destroy(); });
        }
    }

    // Pour afficher/cacher le cercle de portée (utile pour le placement)
    showRange(visible = true) {
        this.rangeCircle.setVisible(visible);
    }

    // Méthode pour les futures améliorations (Upgrade)
    upgrade(newDamage, newRange, newAttackRate) {
        // Vérifier si on a assez d'argent, etc.
        this.damage = newDamage;
        this.range = newRange;
        this.attackRate = newAttackRate;
        // Mettre à jour le cercle de portée visuel
        this.rangeCircle.setRadius(this.range);
        console.log("Tower upgraded!");
        // Changer la texture si l'upgrade change l'apparence
        // this.setTexture('upgradedTowerTexture');
    }
}