import Phaser from "phaser";
import {LoadTitle} from "./loadtitle.js"
import {SunnyDaySkies} from "./Game.js";
import { MainMenu } from "./mainmenu.js";
import { Tutorial } from "./tutorial.js";

const config = {
  type: Phaser.AUTO,
  parent: "TestGame",
  width: 800,
  height: 600,
  physics:
  {
    default: "arcade",
    arcade:
    {
      debug: true
    }
  },
  scene: [ LoadTitle, MainMenu, Tutorial, SunnyDaySkies ]
};
const game = new Phaser.Game(config);