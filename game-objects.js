function Sprite(pos) {
  this.x = pos.x;
  this.y = pos.y;
  this.is_destroyed = false;
}
Sprite.prototype.canMove = function(vect) {
  if (!this.movable)
    return false;

  var sprite = collide(add(this, vect), sprites);
  if (sprite)
    return sprite.canMove(vect);
  else
    return true;
};
Sprite.prototype.move = function(vect) {  
  this.x += vect.x;
  this.y += vect.y;
  var sprite = collide(this, sprites);
  if (sprite && sprite.movable)
    sprite.move(vect);
};
Sprite.prototype.draw = function() {
  var x = this.x * block_size - viewport.x * block_size;
  var y = this.y * block_size - viewport.y * block_size;
  if (this.img) {
    ctx.drawImage(this.img, x, y);
  }
  else {
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(x, y, block_size, block_size);
  }
};
Sprite.prototype.destroy = function() {
  if (this.is_destroyed) return;
  this.is_destroyed = true;
  var ix = this.arr.indexOf(this);
  if (ix > -1)
    this.arr.splice(ix, 1);
  else
    warning('this not found in this.arr');
  
  ix = sprites.indexOf(this);
  if (ix > -1)
    sprites.splice(ix, 1);
  else
    warning('this not found in sprites');
};

function Player(opts) {
  Player.super_.call(this, opts);
  this.id = opts.id;
  // this.fillStyle = "#3333CC";
  this.fillStyle = opts.color;
  this.img = ship;
  this.arr = [this];
  this.movable = true;
  this.avail_blocks = 0;
}
inherits(Player, Sprite);
Player.prototype.move = function(vect) {
  Player.super_.prototype.move.apply(this, arguments);
  viewport.follow(this);
};
Player.prototype.destroy = function() {
  Player.super_.prototype.destroy.apply(this, arguments);
  playing = false;
};

function Beast(pos) {
  Beast.super_.call(this, pos);
  this.fillStyle = "rgb(0,0,0)";
  this.img = beast;
  this.arr = beasts;
}
inherits(Beast, Sprite);

// a beast can only move in a certain direction
// (or, more accurately, something else can only *push* the beast in this direction)
// if the beast is against a block & will be squished
Beast.prototype.canMove = function(vect) {
  return collide(add(this, vect), blocks);
};

// move toward the player if possible but semi-randomly
Beast.prototype.move = function(vect) {
  // TODO: need to handle the case if a beast is pushed into another beast
  // they both get squished if there's a block at the end?
  // and they both get pushed if there's not?
  if (vect) {
    this.x += vect.x;
    this.y += vect.y;
    return;
  }

  var player = getClosestPlayer(this);

  // figure out optimal direction for beast to move
  if (peaceful_beasts || !player) {
    var dir = {x: random([-1, 0, 1])};
    if (dir.x)
      dir.y = random([-1, 0, 1]);
    // avoid a direction of 0,0 (we prefer moving beasts)
    else
      dir.y = random([-1, 1]);
  }
  else {
    var diff = difference(this, player);

    // Game Over:
    // I'm not sure how, but sometimes a beast can be right on top of a player
    // yet move() is still called...
    if (!diff.x && !diff.y)
      return player.destroy();

    var dir = {x: 0, y: 0};
    if (diff.x)
      dir.x = diff.x < 0 ? 1 : -1;
    if (diff.y)
      dir.y = diff.y < 0 ? 1 : -1;
  }
  
  // blocks-n-beasts (avoid colliding w/ blocks or beasts... or anything but the player)
  var bnb = sprites.slice();
  players.forEach(function(player) {
    var player_ix = bnb.indexOf(player);
    bnb.splice(player_ix, 1);
  });
  
  var directions = [];
  if (!collide(add(this, dir), bnb))
    directions.push(dir);

  var clock = clone(dir);
  var counter = clone(dir);
  // work your way both ways around the clock
  for (var n = 0; n < 3; ++n) {
    clock = clockwise(clock);
    counter = counterclock(counter);
    if (!collide(add(this, clock), bnb))
      directions.push(clock);
    if (!collide(add(this, counter), bnb))
      directions.push(counter);
  }

  // add the exact opposite direction
  clock = clockwise(clock);
  if (!collide(add(this, clock), bnb))
    directions.push(clock);

  var chosen_dir;
  for (var n = 0; n < directions.length; n++) {
    if (n == directions.length - 1) {
      chosen_dir = directions[n];
    }
    else if (m.random() < 0.7) {
      chosen_dir = directions[n];
      break;
    }
  }

  if (chosen_dir) {
    this.x += chosen_dir.x;
    this.y += chosen_dir.y;
  }

  // game over!
  if (player && (this.x == player.x && this.y == player.y))
    player.destroy();
}

function getClosestPlayer(pos) {
  var minimum_sum, closest_player;
  players.forEach(function(player) {
    var diff = difference(pos, player);
    var sum = Math.abs(diff.x) + Math.abs(diff.y);
    if (minimum_sum == null || sum < minimum_sum) {
      minimum_sum = sum;
      closest_player = player;
    }
  });
  return closest_player;
}

function add(sprite1, sprite2) {
    return {x: sprite1.x + sprite2.x, y: sprite1.y + sprite2.y};
}
function clone(dir) {
    return {x: dir.x, y: dir.y};
}

function Block(pos) {
  Block.super_.call(this, pos);
  this.fillStyle = "#888888";
  this.img = window['rock' + (m.random() < 0.8 ? '1' : '2')];
  this.movable = true;
  this.arr = blocks;
  this.is_turret = false;
}
inherits(Block, Sprite);
Block.prototype.makeTurret = function() {
  if (this.is_turret) return;
  this.is_turret = true;
  var pos_above = {x: this.x, y: this.y-1};
  if (collide(pos_above, blocks))
    this.img = wall_bottom;
  else
    this.img = wall_top;
  this.fillStyle = "#666666";
  
  // a cleaner way to do this would be to have a single object
  // that represents the group of bricks and a way to get the blocks that are adjacent to that
  // instead, we share a last_destroy variable w/ the others to ensure no two adjacent turret blocks
  // destroy something within the space of 5 seconds
  var destroy_interval = 5 * 1000;
  interval(function() {
    if (Date.now() - this.last_destroy < destroy_interval)
      return;

    var adj = adjacent(this, beasts);
    if (adj.length) {
      random(adj).destroy();
      this.last_destroy = Date.now();
      adjacent(this, blocks).forEach(function(block) {
        block.last_destroy = Date.now();
      });
    }
  }.bind(this), destroy_interval);
};

Block.prototype.move = function(vect) {
    Block.super_.prototype.move.call(this, vect);
    
    // detect turret
    var adj_blocks = adjacent(this, blocks);
    if (adj_blocks.length == 3) {
      // if all 3 adjacent blocks are in the same corner
      var diff_blocks = adj_blocks.map(function(block) { return difference(this, block); }.bind(this));
      if (Math.abs(diff_blocks[0].x + diff_blocks[1].x + diff_blocks[2].x) == 2 &&
        Math.abs(diff_blocks[0].y + diff_blocks[1].y + diff_blocks[2].y) == 2) {

        // if none of them are touching any other blocks
        if (adjacent(adj_blocks[0], blocks).length == 3 &&
          adjacent(adj_blocks[1], blocks).length == 3 &&
          adjacent(adj_blocks[2], blocks).length == 3) {
            this.makeTurret();
            adj_blocks.forEach(function(block) {
              block.makeTurret();
            });
        }
      }
    }

    // detect beast-squishing
    var collide_beast = collide(this, beasts);
    if (collide_beast) {
        if (collide(add(this, vect), blocks))
            collide_beast.destroy();
        else
            collide_beast.move(vect);
    }
}

function Nest(pos) {
  Nest.super_.call(this, pos);
  this.fillStyle = "#FFFFFF";
  this.interval_id = interval(this.spawnBeast.bind(this), random([30, 45, 60, 75, 90]) * 1000);
  this.arr = nests;
}
inherits(Nest, Sprite);

Nest.prototype.spawnBeast = function() {
  if (!playing) return;

  var avail_coords = coords.filter(function(vect) {
    return !collide(add(this, vect), beasts);
  });
  if (!avail_coords)
    return;
  
  var vect = add(this, random(avail_coords));
  var beast = new Beast(vect);
  beasts.push(beast);
  sprites.push(beast);
};
Nest.prototype.destroy = function() {
  if (this.is_destroyed) return;
  clearInt(this.interval_id);
  Sprite.prototype.destroy.apply(this, arguments);
};

function Dynamite(pos) {
  Dynamite.super_.call(this, pos);
  this.fillStyle = "#BB0000";
  this.img = bomb;
  this.ticking = false;
  this.movable = true;
  this.arr = dynamites;
}
inherits(Dynamite, Sprite);
Dynamite.prototype.move = function() {
  // TODO: detect contact w/ another dynamite & set ticking to true
  Sprite.prototype.move.apply(this, arguments);
  var adj_dynamites = adjacent(this, dynamites);
  if (!adj_dynamites.length)
    return;
  adj_dynamites.forEach(function(dyn) {
    dyn.startTicking();
  });
  this.startTicking();
};
Dynamite.prototype.startTicking = function() {
  if (this.ticking) return;
  this.ticking = true;
  this.tick_times = 0;
  var interval_id = interval(function() {
    this.tick_times++
    if (this.tick_times < 4) {
      this.fillStyle = "rgb(125,0,0)";
      this.img = bomb2;
      setTimeout(function() {
        this.fillStyle = "rgb(255,0,0)";
        this.img = bomb;
      }.bind(this), 100);
    }
    // SHE'S GONNA BLOW!!!
    else {
      clearInt(interval_id);
      var explosion_size = random([1, 2, 3]);
      adjacent(this, sprites, explosion_size).forEach(function(sprite) {
        if (sprite.destroy) {
          log('dynamite is destroying sprite');
          sprite.destroy();
        }
      });
      this.destroy();
    }
  }.bind(this), 1000);
};
