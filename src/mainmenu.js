export class MainMenu extends Phaser.Scene
{
    constructor()
    {
        super("MainMenu");
    }

    preload()
    {
        this.menuBackground = this.add.graphics({
            fillStyle:{
                color: 0xffffff
            }
        })
    }

    create()
    {
        this.menuBackground.fillRect(0, 0, 800, 600);
        this.menuText = this.add.text(100, 300, 'Sunny Day Skies', { fontSize: '64px', fill: '#000' });
        this.input.on("pointerdown", function(){
            this.scene.start("Tutorial");
        }, this)
    }
}
