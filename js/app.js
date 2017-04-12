
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);
var lastTime;

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();
    lastTime = now;
    requestAnimFrame(main);
};

function init() {
    terrainPattern = ctx.createPattern(resources.get('img/background.png'), 'no-repeat');
    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });

    reset();
    lastTime = Date.now();
    main();
}

resources.load([
    'img/sprites.png',
    'img/background.png'
]);
resources.onReady(init);

// Game state
var player = {
    pos: [0, 0],
    sprite: new Sprite('img/sprites.png', [0, 0], [34, 30], 16, [0, 1, 2, 3, 4, 5, 6, 7])
};

var bombs = [];
var coins = [];
var explosions = [];

var gameTime = 0;
var isGameOver;
var terrainPattern;

var score = 0;
var scoreEl = document.getElementById('score');

var playerSpeed = 200;
var coinSpeed = 100;

// Update game objects
function update(dt) {
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt);

    //adding coins 
    equation: 1 - .993^gameTime
    if(Math.random() < 1 - Math.pow(.996, gameTime)) {
        coins.push({
            pos: [Math.random() * (canvas.width - 18), -50],
            sprite: new Sprite('img/sprites.png', [0, 79], [18, 17], 1, [0])
        });
    }
    // adding bombs
    // equation1: 1 - .993^gameTime
    // if(Math.random() < 1 - Math.pow(.999, gameTime)) {
    //     bombs.push({
    //         pos: [Math.random() * (canvas.width - 30), -50],
    //         sprite: new Sprite ('img/sprites.png', [0, 34], [30, 25], 16 [0, 1])
    //     });
    // }
    
    checkCollisions();
    scoreEl.innerHTML = score;
};

function handleInput(dt) {
    if(input.isDown('LEFT') || input.isDown('a')) {
        player.pos[0] -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.pos[0] += playerSpeed * dt;
    }
}

function updateEntities(dt) {
    player.sprite.update(dt);

    // Update all the bombs
    // for(var i = 0; i < bombs.length; i++) {
    //     var bomb = bombs[i];

    //     // Remove the bomb if it goes offscreen
    //     if(bomb.pos[1] < 0 || bomb.pos[1] > canvas.height ||
    //        bomb.pos[0] > canvas.width) {
    //         bombs.splice(i, 1);
    //         i--;
    //     }
    // }

    // Update all the coins
    for(var i = 0; i < coins.length; i++) {
        coins[i].pos[1] += coinSpeed * dt; //0
        coins[i].sprite.update(dt);

        // Remove if offscreen
        if(coins[i].pos[1] - coins[i].sprite.size[1] > canvas.height) { //0
            coins.splice(i, 1);
            i--;
        }
    }

    // // Update all the explosions
    // for(var i = 0; i < explosions.length; i++) {
    //     explosions[i].sprite.update(dt);

    //     // Remove if animation is done
    //     if(explosions[i].sprite.done) {
    //         explosions.splice(i, 1);
    //         i--;
    //     }
    // }
}

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
    checkPlayerBounds();
    
    // Run collision detection for all coins and bombs
    for(var i = 0; i < coins.length; i++) {
        var pos = coins[i].pos;
        var size = coins[i].sprite.size;

        // for(var j = 0; j < bombs.length; j++) {
        //     var pos2 = bombs[j].pos;
        //     var size2 = bombs[j].sprite.size;

        //     if(boxCollides(pos, size, pos2, size2)) {
        //         // Remove the coin
        //         coins.splice(i, 1);
        //         i--;
        //         score += 100;

        //         // Add an explosion
        //         explosions.push({
        //             pos: pos,
        //             sprite: new Sprite('img/sprites.png',
        //                                [0, 117],
        //                                [39, 39],
        //                                16,
        //                                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        //                                null,
        //                                true)
        //         });

        //         // Remove the bomb and stop this iteration
        //         bombs.splice(j, 1);
        //         break;
        //     }
        // } gameOver();
        
        // Run collision detection for all player and coins
        if(boxCollides(pos, size, player.pos, player.sprite.size)) { 
            //Remove the coin
            coins.splice(i, 1);
            i--;
            score += 100;
        }
    }
}

function checkPlayerBounds() {
    if(player.pos[0] < 0) {
        player.pos[0] = 0;
    }
    else if(player.pos[0] > canvas.width - player.sprite.size[0]) {
        player.pos[0] = canvas.width - player.sprite.size[0];
    }
}


function render() {
    ctx.fillStyle = terrainPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(!isGameOver) {
        renderEntity(player);
    }

    renderEntities(bombs);
    renderEntities(coins);
    renderEntities(explosions);
};

function renderEntities(list) {
    for(var i = 0; i < list.length; i++) {
        renderEntity(list[i]);
    }    
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}

function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    isGameOver = true;
}

function reset() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    isGameOver = false;
    gameTime = 0;
    score = 0;

    coins = [];
    bombs = [];

    player.pos = [canvas.width / 2, 430];
};
