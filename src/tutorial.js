export class Tutorial extends Phaser.Scene
{
    constructor()
    {
        super("Tutorial");
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
        this.menuText = this.add.text(100, 100, 'How to Play', { fontSize: '64px', fill: '#000' });
        this.menuText = this.add.text(60, 200, 'Click to open or close the umbrella', { fontSize: '32px', fill: '#000' });
        this.menuText = this.add.text(100, 300, 'Fly&land on car to score', { fontSize: '32px', fill: '#000' });
        this.menuText = this.add.text(100, 400, "Umbrella's power", { fontSize: '32px', fill: '#000' });
        this.menuText = this.add.text(100, 500, 'Bonus', { fontSize: '32px', fill: '#000' });
        this.input.on("pointerdown", function(){
            this.scene.start("SunnyDaySkies");
        }, this);
    }
}