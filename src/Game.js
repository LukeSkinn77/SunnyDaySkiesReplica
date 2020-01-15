  var settings = {
    gameResolution:[800,600],
    carHeightRange:[50,100],
    playerStartPosition:[600, 350]
  }
  
  const StateEnum = {
    FLOATING : 0,
    FALLING : 1,
    DYING : 2
  }

export class SunnyDaySkies extends Phaser.Scene
{
    constructor()
    {
        super("SunnyDaySkies");
    }

    create()
    {
        this.highScore = 0;
        this.score = 0;
        this.lastBird = 5000;
        this.lastPower = 15000;
        this.floatPower = 100;
        this.isDead = false;
        this.numberCars = 0;
        this.currentlyPassedCars = 0;

        this.screenWidth = settings.gameResolution[0]/2;
        this.screenHeight = settings.gameResolution[1]/2;

        //Sky
        this.sky = this.add.tileSprite(this.screenWidth, this.screenHeight, settings.gameResolution[0],settings.gameResolution[1],"background_sky").setTileScale(1.5);
    
        //Platform floor
        this.platform = this.physics.add.sprite(this.screenWidth, 636, "floor");
        this.platform.displayWidth = 800;
        this.platform.setImmovable(true);
        
        //Car object pool handling
        this.cars = this.add.group({
          removeCallback: function(car)
          {
            car.scene.carsPool.add(car);
          }
        });
    
        this.carsPool = this.add.group({
          removeCallback: function(car)
          {
            car.scene.cars.add(car);
          }
        });
        
        //Signpost objct pool handling
        this.signPool = this.add.group({
          removeCallback: function(sign)
          {
            sign.scene.signs.add(sign);
          }
        })
        
        this.signs = this.add.group({
          removeCallback: function(sign)
          {
            sign.scene.signPool.add(sign);
          }
        })

        //Initial car batch
        this.addCar(650, 515)
        this.addCar(400, 515)
        this.addCar(150, 515)
        this.addCar(-100, 515)
    

        //Bird
        this.bird = this.physics.add.sprite(-50,250,"bird").setScale(0.3);
        this.bird.setVisible(false);
        this.bird.setActive(false);

        //Power Up
        this.powerup = this.physics.add.sprite(-50, 250, "powerup").setScale(0.2);
        this.powerup.setVisible(false);
        this.powerup.setActive(false);


        //Player
        this.player = this.physics.add.sprite(settings.playerStartPosition[0], settings.playerStartPosition[1], "player").setSize(100,270, true);
        this.player.line = new Phaser.Geom.Line(this.player.body.left, this.player.body.bottom, this.player.body.left - 1, this.player.body.bottom - 1);
        this.player.setScale(0.3)
        this.player.setCollideWorldBounds(true);

        //Collider collision for cars and ground
        this.carCollide = this.physics.add.collider(this.player, this.cars, this.collideWithCar, null, this);
        this.physics.add.collider(this.player, this.platform, this.collideWithGround, null, this);

        //Overlap collision for birds and powerups
        this.physics.add.overlap(this.player, this.bird, function()
        {
          this.playerState = StateEnum.DYING;
          this.player.anims.play("dead");
        }, null, this);

        this.physics.add.overlap(this.player, this.powerup, function()
        {
          this.floatPower = 100;
        }, null, this);


        this.player.body.setGravityY(300);
        this.isInAir = false;
        this.PlayerAnimations();

    
        //Score and powerbar UI
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.floatBar = this.add.sprite(700, 50, "floatbar");
        this.floatBarProgress = this.add.graphics();
        this.floatBarProgress.fillRect(this.floatBar.x - (this.floatBar.width * 0.5), this.floatBar.y -(this.floatBar.height * 0.5), 128, 32);

        //Attaches event to function
        this.physics.world.on("floatprogress", this.FloatPowerBar, this);

        //Game Over Properties
        this.gameoverBackground = this.add.graphics(
        {
          fillStyle:
          {
              color: 0xffffff
          }
        })
        this.gameoverBackground.fillRect(200, 100, 400, 400);
        this.gameoverBackground.setVisible(false);
        this.flyButton = this.add.sprite(400,400, "button_fly").setScale(0.3);
        this.flyButton.setVisible(false);
    
      this.input.on("pointerdown", this.Jump, this);
    }

    //Assigns animations
    PlayerAnimations()
    {
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("player", {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: "right_static",
        frames: [{key: "player", frame: 0}],
        frameRate: 20
      });
      this.anims.create({
        key: "left_static",
        frames: [{key: "player", frame: 6}],
        frameRate: 20
      });
      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("player", {start: 6, end: 9}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: "dead",
        frames: [{key: "player", frame: 5}],
        frameRate: 20
      });
    }

    Jump()
    {
        if (this.isInAir && !this.isDead)
        {
          //Alters jump depending on whether floating or falling down and changes gravity
          switch(this.playerState)
          {
            case StateEnum.FLOATING:
              this.player.body.setGravityY(500);
              this.playerState = StateEnum.FALLING;
              break;
            case StateEnum.FALLING:
              this.player.setVelocityY(200 * -1);
              this.player.body.setGravityY(100);
              this.playerState = StateEnum.FLOATING;
              break;
          }
        }
        else
        {
          //Initial jump from ground
          if (this.player.body.touching.down)
          {
            this.player.setVelocityY(200 * -1);
            this.player.body.setGravityY(100);
            this.playerState = StateEnum.FLOATING      
            this.isInAir = true;
          }
        }
    }

    //Repositions object at left of screen to move across
    setObject(obj)
    {
      obj.x = -50;
      var randNum = (Math.random() * 100) * 2
      obj.y = randNum;
      obj.setActive(true);
      obj.setVisible(true);
    }

    addCar(xPos,yPos)
    {
      var newCar;
      //If cars available in pool, assigns and removes one from pool and spawns at left of screen
      if (this.carsPool.getLength())
      {
        newCar = this.carsPool.getFirst();
        newCar.x = xPos;
        newCar.y = yPos;
        newCar.isPassed = false;
        newCar.active = true;
        newCar.visible = true;
        this.carsPool.remove(newCar);
      }
      //Creates new car if unavailable in pool
      else
      {
        newCar = this.physics.add.sprite(xPos, yPos, "car");
        newCar.isPassed = false;
        newCar.displayWidth = 200;
        newCar.displayHeight = 125;
        newCar.body.setImmovable(true);
  
        this.cars.add(newCar);
      }
    }

    addSign(xPos, yPos)
    {
      var newSign;
      //Retrieves sign from pool if possible
      if (this.signPool.getLength())
      {
        newSign = this.signPool.getFirst();
        //Removes text
        newSign.removeAt(1);
        //Adds new text
        var signtxt =  this.add.text(0,0, this.currentlyPassedCars, { fontSize: '32px', fill: '#000'});
        newSign.addAt(signtxt, 1)
        newSign.x = xPos;
        newSign.y = yPos;
        newSign.active = true;
        newSign.visible = true;
        this.signPool.remove(newSign);
      }
      else
      {
        //Creates new container with sprite and text
        newSign = this.add.container(xPos,yPos);
        var signPost = this.add.sprite(0, 0, "sign");
        var signText = this.add.text(0,0, this.currentlyPassedCars, { fontSize: '32px', fill: '#000'});
        newSign.add([signPost, signText]);
        newSign.setSize(128,128);
        this.physics.world.enable(newSign);
        newSign.body.setImmovable(true);
        this.signs.add(newSign);
      }
    }
    
    collideWithCar()
    {
      if (this.player.body.touching.down)
      {
        if (this.isInAir)
        {
          //Calculates and adds points depending on the state the player is in when they land
           var newFigure = ((5 + (5 * this.currentlyPassedCars)) * this.currentlyPassedCars);
           switch (this.playerState)
           {
              case StateEnum.FLOATING:
                this.score += newFigure * 2;
                break;
              case StateEnum.FALLING:
                this.score += newFigure;
                break;
              case StateEnum.DYING:
                this.score += newFigure;
                break;
          }
          this.scoreText.setText('Score: ' + this.score);
        }
        this.currentlyPassedCars = 0;
        this.floatPower = 100;
        this.physics.world.emit("floatprogress");
        this.isInAir = false;
      }
    }
  
    collideWithGround()
    {
      this.physics.world.removeCollider(this.carCollide);

      //Game over menu
      if (!this.isDead)
      {
        this.isDead = true;

        //Loads highscore from cookies, if not available, highscore is 0
        this.highScore = parseInt(localStorage.getItem('highscore')) || 0;
        
        //Saves highscore if higher than current
        if (this.score > this.highScore)
        {
          localStorage.setItem('highscore', this.score);
          this.highScore = this.score;
        }
        this.gameoverBackground.setVisible(true);

        //Button for resetting game setup
        this.flyButton.setVisible(true).setInteractive();
        this.flyButton.on("pointerdown", () =>{
          this.scene.start("SunnyDaySkies");
        });
        this.scoreTextFinal = this.add.text(300, 200, "Your Score: " + this.score,{ fontSize: '32px', fill: '#000' });
        this.scoreTextFinal.setVisible(true);
        this.carTextFinal = this.add.text(300, 250, "Total Cars: " + this.numberCars,{ fontSize: '32px', fill: '#000' });
        this.carTextFinal.setVisible(true);
        this.highTextFinal = this.add.text(300, 300, "High Score: " + this.highScore,{ fontSize: '32px', fill: '#000'});
        this.highTextFinal.setVisible(true);
      }
    }

    //Sets power bar value
    FloatPowerBar()
    {
      this.floatBarProgress.clear();
      var value = this.floatBar.width/ 100;
      this.floatBarProgress.fillRect(this.floatBar.x - (this.floatBar.width * 0.5), this.floatBar.y -(this.floatBar.height * 0.5),  this.floatPower * value, 32);
    }

    //Sets speed of cars and background
    SpeedSetter(carSignSpeed, skySpeed, delta)
    {
      this.cars.getChildren().forEach(car => {
        car.body.setVelocityX(carSignSpeed);
      });
      this.signs.getChildren().forEach(sign => {
        sign.body.setVelocityX(carSignSpeed);
      });
      this.sky.tilePositionX += delta * skySpeed;
    }

    GetNearestCar()
    {
      var nearCar = settings.gameResolution[0];
      this.cars.getChildren().forEach(function(car)
      {
        nearCar = Math.min(car.x, nearCar);
      }, this)
      return nearCar;
    }
  
    update(time, delta)
    {
      //Maintains player position
      this.player.x = settings.playerStartPosition[0];

      //Sets line positions depending on direction, which is used to prevent player from walking off car
      if (this.player.isRight)
      {
        this.player.line = new Phaser.Geom.Line(this.player.body.right, this.player.body.bottom, this.player.body.right + 1, this.player.body.bottom - 1);
      }
      else
      {
        this.player.line = new Phaser.Geom.Line(this.player.body.left, this.player.body.bottom, this.player.body.left - 1, this.player.body.bottom - 1);
      }

      //Bird velocity
      if (this.bird.active && this.bird.x < (settings.gameResolution[0] + 50))
      {
        this.bird.setVelocityX(100);
      }
      else
      {
        this.bird.setActive(false);
        this.bird.setVisible(false);
        this.bird.setVelocityX(0);
      }

      //Powerup velocity
      if (this.powerup.active && this.powerup.x < (settings.gameResolution[0] + 50))
      {
        this.powerup.setVelocityX(80);
      }
      else
      {
        this.powerup.setActive(false);
        this.powerup.setVisible(false);
        this.powerup.setVelocityX(0);
      }

      //Player In Air
      if (this.isInAir) 
      {
        switch(this.playerState)
        {
          case StateEnum.FLOATING:
            this.SpeedSetter(400.0, 0.7, delta);
            break;
          case StateEnum.FALLING:
            this.SpeedSetter(100.0, 0.3, delta);
            break;
          case StateEnum.DYING:
            this.SpeedSetter(150.0, 0.5, delta);
            break;
        }
        
        //FloatBar decreaser
        if (this.floatPower >= 0 && !this.isDead)
        {
          this.floatPower -= delta /100
          this.physics.world.emit("floatprogress");
        }

        //Kills player when bar empty
        if (this.floatPower <= 0 && this.playerState != StateEnum.DYING)
        {
          this.playerState = StateEnum.DYING;
          this.player.anims.play("dead");
        }

        this.cars.getChildren().forEach(function(car)
        {
          //If cars have passed, add points and sign showing current num of cars
          if ((car.x >= this.player.x) && !car.isPassed && !this.isDead)
          {
            car.isPassed = true;
  
            this.numberCars++;
            this.score+=10;
            this.currentlyPassedCars++;
            var sign = this.addSign(car.x, car.y - car.displayHeight);
            this.scoreText.setText('Score: ' + this.score);
          }
  
          //Kills car at certain point
          if (car.x > 800 + car.displayWidth/2)
          {
            this.cars.killAndHide(car);
            this.cars.remove(car);
          }
        }, this); 

        //Adds car if last car is far enough away
        if (this.cars.getLength() < 5 && this.GetNearestCar() > 50)
        {
          this.addCar(-250, 515);
        }

        //Kills sign at certain point
        this.signs.getChildren().forEach(function(sign)
        {
          if (sign.x > settings.gameResolution[0] + sign.displayWidth/2)
          {
            this.signs.killAndHide(sign);
            this.signs.remove(sign);
          }
        }, this); 

        
        //If enough time passed, reset bird and powerup
        if (time > this.lastBird)
        {
          this.setObject(this.bird);
          this.lastBird = time + 17000;
        }
        if (time > this.lastPower)
        {
          this.setObject(this.powerup);
          this.lastPower = time + 15000;
        }      
      }
      //Player On Car
      else
      {
        this.canWalk = false;
        //If player moving left
        if (this.input.mousePointer.x < this.player.x)
        {
          this.cars.getChildren().forEach(car => {
  
            //Check if line intersects with car player on, enabling player to walk
            if (Phaser.Geom.Intersects.LineToRectangle(this.player.line, car.body))
            {
              this.canWalk = true;  
            }
  
          }, this);
  
          if (this.canWalk)
          {
            this.SpeedSetter(100.0, 0.7, delta);
          }
          else
          {
            this.SpeedSetter(0.0, 0.5, delta);
          }
  
  
          if (this.player.anims.getCurrentKey() != "left")
          {
            this.player.anims.play("left");
            this.player.isRight = false;
          
          }
        }
        //If player moving Right
        else if (this.input.mousePointer.x > this.player.x)
        {
         this.cars.getChildren().forEach(car => {
  
          if (Phaser.Geom.Intersects.LineToRectangle(this.player.line, car.body))
          {
            this.canWalk = true;  
          }
  
        }, this);
  
        if (this.canWalk)
        {
          this.SpeedSetter(-100.0, 0.3, delta);
        }
        else
        {
          this.SpeedSetter(0.0, 0.5, delta);
        }
  
  
          if (this.player.anims.getCurrentKey() != "right")
          {
            this.player.anims.play("right");
            this.player.isRight = true;
          }
        }
        else
        {
          this.SpeedSetter(0.0, 0.5, delta);

          if (this.player.anims.getCurrentKey() != "left")
          {
            this.player.anims.play("right_static");
          }
          else
          {
            this.player.anims.play("left_static");
          }
        }
      }
    }
}