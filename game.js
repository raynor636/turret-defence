var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', this);

var BasicGame = function () { };

BasicGame.Boot = function () { };

var isoGroup;
var player;
var cursorPos;
var selectedTile;
var moveTween;

BasicGame.Boot.prototype = {

    preload: function () {

        game.load.image('tile', './assets/tile.png');
        game.load.spritesheet('tower', './assets/turret.png', 44, 57, 18);

        game.time.advancedTiming = true;

        game.plugins.add(new Phaser.Plugin.Isometric(game));

        game.iso.anchor.setTo(0.5, 0.2);

        game.input.onDown.add(this.addTower,this);

        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    },

    create: function () {

        isoGroup = game.add.group();

        this.spawnTiles();

        cursorPos = new Phaser.Plugin.Isometric.Point3();

       // player = game.add.isoSprite(185, 185, 0, 'characterAnim', 0, playerGroup);
        //player = game.add.isoSprite(185, 185, 0, 'box', 0, isoGroup);
        //player.anchor.set(0.5,0.5);

        //Setup physics
        //game.physics.isoArcade.gravity.setTo(0, 0, -500);
        //game.physics.isoArcade.enable(player);

        //player.body.moves=false;
        //player.body.collideWorldBounds = true;
    },

    update: function () {

        game.iso.unproject(game.input.activePointer.position, cursorPos);

        isoGroup.forEach(function (tile) {
            var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);

            if (!tile.selected && inBounds) {
                tile.selected = true;
                selectedTile = tile;
                tile.tint = 0x86bfda;
            }
            else if (tile.selected && !inBounds) {
                tile.selected = false;
                tile.tint = 0xffffff;
            }
        });

    },

    render: function () {
        game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
    },

    spawnTiles: function () {
        var tile;

        var myGrid = [];
        var i = 0;
        for (var xx = 0; xx < 400; xx += 38) {
            myGrid[i] = [];
            for (var yy = 0; yy < 400; yy += 38) {
                // Create a tile using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                tile = game.add.isoSprite(xx, yy, 0, 'tile', 0, isoGroup);
                tile.anchor.set(0.5, 0);
                myGrid[i].push('tile');
            }
            i++;
        }

        easystar.setGrid(myGrid);
        easystar.setAcceptableTiles(['tile']);
    },

    addTower: function (){
      var tile = selectedTile;

      var tower = game.add.isoSprite(Math.floor(tile.isoX), Math.floor(tile.isoY), 0, "tower", 0, isoGroup);
      tower.anchor.set(0.5,0.5);
      tower.animations.add("turn");
      tower.animations.play("turn", 19, true);

    },

    movePlayer: function (){
      var tile = selectedTile;

      var i = 0;
      function moveObject(object, p){
        var StepX = p[i].x || false, StepY = p[i].y || false;
        moveTween = game.add.tween( object ).to({ isoX: StepX*38, isoY: StepY*38}, 150);
        moveTween.start();
        moveTween.onComplete.add(function(){
          i++;
          if(i < p.length){
            console.log(p[i]);
            moveObject(object, p);
          }else{
            //player.play('idle');
          }
        });
      }
      easystar.findPath(Math.floor(player.isoX/38), Math.floor(player.isoY/38), Math.floor(tile.isoX/38), Math.floor(tile.isoY/38), function( path ) {
        if (path === null) {
          console.log("Path was not found.");
        } else {
          console.log(path);
          console.log("Path was found.");
          if (player.ismoving === false){
            console.log("is not moving");
            player.ismoving = true;
            moveObject(player, path);
          } else {
            console.log("is moving");
            player.ismoving = false;
            moveTween.stop();
          }
        }
      });
      easystar.calculate();
    }
};

var easystar = new EasyStar.js();
game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
