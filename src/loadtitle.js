export class LoadTitle extends Phaser.Scene
{
    constructor()
    {
        super("LoadTitle");
    }

    preload()
    {
        this.load.image("background_sky", 'src/assets/tex_background_sky.png');

        var loadBar = this.add.graphics({
            fillStyle:{
                color: 0xffffff
            }
        })

        //Sets files to be loaded
        var gameRes = {
            'image': [
                ["car", 'src/assets/tex_car_big.png'],
                ["floor", 'src/assets/tex_ground.png'],
                ["bird", 'src/assets/tex_bird.png'],
                ["floatbar", 'src/assets/tex_floatbar.png'],
                ["sign", 'src/assets/tex_signpost.png'],
                ["powerup", 'src/assets/tex_powerupthing.png']
            ],
            'spritesheet':[
                ["player", 'src/assets/tex_player_animation.png', {frameWidth: 256, frameHeight: 384 }],
                ["button_fly", 'src/assets/tex_button_flyagain_animation.png', {frameWidth: 512, frameHeight: 256 }]
            ]
        };
        //Loads in the assets
        for (var res in gameRes)
        {
            gameRes[res].forEach(function(resource){
                var load = this.load[res];
                load && load.apply(this.load, resource);
            },this);
        }

        //While loading, load bar is filled in
        this.load.on("progress", (loadPercent)=> {
            loadBar.fillRect(0, 300, 800 * loadPercent, 100);
        })

        //On completion, loads menu
        this.load.on("complete", ()=> {
            this.scene.start("MainMenu");
        })
    }
}