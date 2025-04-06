// src/main.js
import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import MainGameScene from "./scenes/MainGameScene";
import PathScene from "./scenes/PathScene";
import HomePageScene from "./scenes/HomePageScene.js";
import SettingsScene from "./scenes/SettingsScene.js";
import CreditsScene from "./scenes/CreditScene.js";
import PianoScene from "./scenes/PianoScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

// Dimensions cibles pour un format mobile portrait (ex: ~iPhone 12/13 ratio)
// Adaptez selon vos besoins (ex: 540x960 pour du 9:16 paysage)
const MOBILE_WIDTH = 1080;
const MOBILE_HEIGHT = 2400;

const config = {
  type: Phaser.AUTO, // Choisit WebGL si dispo, sinon Canvas
  width: MOBILE_WIDTH,
  height: MOBILE_HEIGHT,
  parent: undefined, // Phaser s'attachera au body par défaut
  physics: {
    default: "arcade", // On active la physique Arcade (simple et efficace pour beaucoup de jeux)
    arcade: {
      // gravity: { y: 0 }, // Pas de gravité par défaut pour un TD
      debug: true, // Mettez à false pour la production
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, // Redimensionne pour s'adapter à l'écran en gardant le ratio
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centre le canvas de jeu
  },
  // Liste des scènes du jeu
  scene: [
    BootScene,
    HomePageScene,
    MainGameScene,
    PathScene,
    SettingsScene,
    CreditsScene,
    PianoScene,
    GameOverScene,
  ],
};

// Création de l'instance du jeu
const game = new Phaser.Game(config);

export default game; // Optionnel, mais peut être utile
