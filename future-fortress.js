document.body.style.overflow = 'hidden';
var canvas = document.getElementById('tutorial');
var viewport = new Viewport(window.innerWidth || document.body.clientWidth, window.innerHeight|| document.body.clientHeight);
canvas.setAttribute('width', viewport.width);
canvas.setAttribute('height', viewport.height);
var ctx = canvas.getContext('2d');

var mode;
var is_turret = false;
canvas.addEventListener('mousedown', function(evt) {
  var pos = posFromEvt(evt);
  var sprite = collide(pos, sprites);
  if (sprite) {
    mode = 'destroy';
    emit('destroy', {pos: pos, player_id: this_player_id});
  }
  else {
    mode = 'place';
    emit('place', {pos: pos, is_turret: is_turret, player_id: this_player_id});
  }
});

canvas.addEventListener('mousemove', function(evt) {
  if (!mode) return;
  var pos = posFromEvt(evt);
  var sprite = collide(pos, sprites);
  if (mode == 'destroy' && sprite)
    emit('destroy', {pos: pos, player_id: this_player_id});
  else if (mode == 'place' && !sprite)
    emit('place', {pos: pos, is_turret: is_turret, player_id: this_player_id});
});

canvas.addEventListener('mouseup', function(evt) {
  mode = null;
});

function posFromEvt(evt) {
  var click_pos = {x: evt.pageX + viewport.transform_x, y: evt.pageY + viewport.transform_y};
  return toBlockCoords(click_pos);
}

function destroy(opts) {
  var sprite = collide(opts.pos, sprites);
  if (!sprite || !(sprite instanceof Block))
    return;

  var player = getPlayer(opts.player_id);
  sprite.destroy();
  player.avail_blocks += 2;
}

function place(opts) {
  var pos = opts.pos;
  var sprite = collide(opts.pos, sprites);
  var player = getPlayer(opts.player_id);

  if (sprite || !player.avail_blocks)
    return;
  if (opts.is_turret && player.avail_blocks < 8)
    return;

  placeBlock(pos, true);

  // if (opts.is_turret) {
  //   placeBlock({x: pos.x, y: pos.y + 1}, true);
  //   placeBlock({x: pos.x + 1, y: pos.y}, true);
  //   placeBlock({x: pos.x + 1, y: pos.y + 1}, true);
  //   player.avail_blocks -= 8;
  // }
  // else {
    player.avail_blocks--;
  // }
}

function placeBlock(pos, is_turret) {
  var block = new Block(pos);
  blocks.push(block);
  sprites.push(block);
  if (is_turret)
    block.makeTurret();
}

function toBlockCoords(pos) {
  return {x: Math.floor(pos.x / block_size), y: Math.floor(pos.y / block_size)};
}

document.addEventListener('keypress', function(evt) {
  var ch = String.fromCharCode(evt.which);
  if (ch == 't')
    is_turret = !is_turret;
  if (ch == 'p')
    peaceful_beasts = !peaceful_beasts;
  if (ch == 'r')
    emit('report');
});

var blocks = [], beasts = [], nests = [], dynamites = [], sprites = [];
var players = [];
var playing = true;
var is_debug = true;
var snd_effect_time = Date.now();
var block_size = 64;
var peaceful_beasts = false; // makes beasts move randomly instead of toward you
var server_time = 0;
var this_player_id = Math.random();
var this_player = null;

var playback = false;
var offline = !window.io;

function getPlayer(player_id) {
  return players.filter(function(pl) {
    return pl.id == player_id;
  })[0];
}

if (offline || playback) {
  window.emit = function(name, data) {
    handleEvent({name: name, data: data});
  };
}
else {
  window.done = function() {
    window.socket = io(location.origin, {multiplex: false});
    socket.on('evt', handleEvent);
    socket.on('playEvents', function(events) {
      events.forEach(function(evt) {
        handleEvent(evt);
      });
      joinGame();
    });
  };

  window.emit = function(name, data) {
    socket.emit('evt', {name: name, data: data});
  };
}

if (offline) {
  window.done = function() {
    init({seed: Date.now()});
    joinGame();
  };
  window.interval = setInterval;
  window.clearInt = clearInterval;
}
else {
  window.interval = function(cb, ms) {
    var secs = ms / 1000;
    data = {start: server_time, secs: secs, id: Math.random(), cb: cb};
    interval.fns.push(data);
    return data.id;
  };
  window.clearInt = function(id) {
    for (var n = 0; n < interval.fns.length; n++) {
      if (interval.fns[n].id == id)
        interval.fns.splice(n, 1);
    }
  };
  interval.fns = [];
}

var rock1, rock2, grass, grass_tl, grass_tr, grass_bl, grass_br, rocks, rock_b, rock_t, rock_l, rock_r, rock_tl, rock_tr, rock_bl, rock_br, wall, wall_l, wall_r, wall_h, wall_v, wall_t, wall_b, wall_tr, wall_tl, wall_br, wall_bl, wall_i, wall_bi, wall_ti, wall_li, wall_ri, ship, beast, bomb, bomb2;
var n_loaded = 0;
var n_total = 36;
loadImage('sprites/grass.png', function(err, img) {
  if (err) throw err;
  grass = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/grass-tl.png', function(err, img) {
  if (err) throw err;
  grass_tl = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/grass-tr.png', function(err, img) {
  if (err) throw err;
  grass_tr = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/grass-bl.png', function(err, img) {
  if (err) throw err;
  grass_bl = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/grass-br.png', function(err, img) {
  if (err) throw err;
  grass_br = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock.png', function(err, img) {
  if (err) throw err;
  rocks = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-b.png', function(err, img) {
  if (err) throw err;
  rock_b = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-t.png', function(err, img) {
  if (err) throw err;
  rock_t = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-l.png', function(err, img) {
  if (err) throw err;
  rock_l = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-r.png', function(err, img) {
  if (err) throw err;
  rock_r = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-tl.png', function(err, img) {
  if (err) throw err;
  rock_tl = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-tr.png', function(err, img) {
  if (err) throw err;
  rock_tr = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-bl.png', function(err, img) {
  if (err) throw err;
  rock_bl = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-br.png', function(err, img) {
  if (err) throw err;
  rock_br = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-1.png', function(err, img) {
  if (err) throw err;
  rock1 = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/rock-2.png', function(err, img) {
  if (err) throw err;
  rock2 = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall.png', function(err, img) {
  if (err) throw err;
  wall = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-l.png', function(err, img) {
  if (err) throw err;
  wall_l = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-r.png', function(err, img) {
  if (err) throw err;
  wall_r = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-h.png', function(err, img) {
  if (err) throw err;
  wall_h = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-v.png', function(err, img) {
  if (err) throw err;
  wall_v = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-t.png', function(err, img) {
  if (err) throw err;
  wall_t = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-b.png', function(err, img) {
  if (err) throw err;
  wall_b = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-tr.png', function(err, img) {
  if (err) throw err;
  wall_tr = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-tl.png', function(err, img) {
  if (err) throw err;
  wall_tl = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-br.png', function(err, img) {
  if (err) throw err;
  wall_br = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-bl.png', function(err, img) {
  if (err) throw err;
  wall_bl = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-i.png', function(err, img) {
  if (err) throw err;
  wall_i = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-bi.png', function(err, img) {
  if (err) throw err;
  wall_bi = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-ti.png', function(err, img) {
  if (err) throw err;
  wall_ti = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-li.png', function(err, img) {
  if (err) throw err;
  wall_li = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/wall-ri.png', function(err, img) {
  if (err) throw err;
  wall_ri = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/ship.png', function(err, img) {
  if (err) throw err;
  ship = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/beast.png', function(err, img) {
  if (err) throw err;
  beast = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/bomb.png', function(err, img) {
  if (err) throw err;
  bomb = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});
loadImage('sprites/bomb-2.png', function(err, img) {
  if (err) throw err;
  bomb2 = img;
  n_loaded++;
  if (n_loaded == n_total)
    done();
});

function joinGame() {
  emit('new_player', {id: this_player_id, color: 'rgb(' + [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)].join(',') + ')'});
}

function handleEvent(evt) {
  var player;
  if (evt.name == 'spawnWorld') {
    init(evt.data);
  }
  else if (evt.name == 'move') {
    player = getPlayer(evt.data.player_id);
    if (player.canMove(evt.data))
      player.move(evt.data);
  }
  else if (evt.name == 'pause') {
    playing = !playing;
  }
  else if (evt.name == 'time') {
    server_time = evt.data.time;
    interval.fns.forEach(function(data) {
      var diff = server_time - data.start;
      if (diff % data.secs == 0)
        data.cb();
    });
  }
  else if (evt.name == 'new_player') {
    player = new Player({x: 18, y: 18, id: evt.data.id, color: evt.data.color});
    if (evt.data.id == this_player_id)
      this_player = player;
    players.push(player);
    sprites.push(player);
  }
  else if (evt.name == 'place') {
    place(evt.data);
  }
  else if (evt.name == 'destroy') {
    destroy(evt.data);
  }
}

function init(opts) {
  window.m = new MersenneTwister(opts.seed);
  window.regions = [
    {x: -1, y: -1, color: random(bg_colors), img: random([grass, rocks])},
    {x: 0, y: -1, color: random(bg_colors), img: random([grass, rocks])},
    {x: 1, y: -1, color: random(bg_colors), img: random([grass, rocks])},
    {x: -1, y: 0, color: random(bg_colors), img: random([grass, rocks])},
    {x: 0, y: 0, color: random(bg_colors), img: random([grass, rocks])},
    {x: 1, y: 0, color: random(bg_colors), img: random([grass, rocks])},
    {x: -1, y: 1, color: random(bg_colors), img: random([grass, rocks])},
    {x: 0, y: 1, color: random(bg_colors), img: random([grass, rocks])},
    {x: 1, y: 1, color: random(bg_colors), img: random([grass, rocks])}
  ];
  regions.forEach(function(region) {
    populateRegion(region);
  });
  spawnWorld(4, 1, 4);

  window.artist = new Artist(ctx);
  artist.startDrawing();
  
  interval(function() {
    if (!playing || !beasts.length) return;

    gainNode.gain.value = 0.05;
    snd_effect_time = Date.now();

    beasts.forEach(function(beast) {
      beast.move();
    });
  }, 1000);
}

function populateRegion(region) {
  var arr;
  if (region.img == grass)
    arr = [grass, grass, grass, rocks];
  else
    arr = [rocks, rocks, rocks, grass];

  region.cols = [];

  var terrain_size = 40; // terrain blocks are only 40px
  var num_terrains = region_size * block_size / terrain_size;
  for (var x = 0; x <= num_terrains; x++) {
    var col = [];
    for (var y = 0; y <= num_terrains; y++) {
      var tile = {x: x, y: y};
      if (x % 2 == 0 && y % 2 == 0)
        tile.img = random(arr);
      col.push(tile);
    }
    region.cols.push(col);
  }

  for (var x = 0; x <= num_terrains; x++) {
    for (var y = 0; y <= num_terrains; y++) {
      if (x % 2 == 0 && y % 2 == 1) {
        var tile = region.cols[x][y];
        var above = region.cols[x][y-1];
        var below = region.cols[x][y+1];
        if (!above || !above.img || !below || !below.img)
          return;
        if (above.img == rocks && below.img == rocks)
          tile.img = rocks;
        if (above.img == grass && below.img == grass)
          tile.img = grass;
        if (above.img == grass && below.img == rocks)
          tile.img = rock_b;
        if (above.img == rocks && below.img == grass)
          tile.img = rock_t;
      }
    }
  }

  for (var x = 0; x <= num_terrains; x++) {
    for (var y = 0; y <= num_terrains; y++) {
      if (x % 2 == 1 && y % 2 == 0) {
        var tile = region.cols[x][y];
        var left = region.cols[x-1][y];
        var right = region.cols[x+1][y];
        if (!left || !left.img || !right || !right.img)
          return;
        if (left.img == rocks && right.img == rocks)
          tile.img = rocks;
        if (left.img == grass && right.img == grass)
          tile.img = grass;
        if (left.img == grass && right.img == rocks)
          tile.img = rock_r;
        if (left.img == rocks && right.img == grass)
          tile.img = rock_l;
      }
    }
  }

  for (var x = 0; x <= num_terrains; x++) {
    for (var y = 0; y <= num_terrains; y++) {
      if (x % 2 == 1 && y % 2 == 1) {
        var tile = region.cols[x][y];
        
        // look at diagonal tiles b/c these are the ones w/ solid fills
        var top_right = region.cols[x+1][y-1];
        var top_left = region.cols[x-1][y-1];
        var bottom_right = region.cols[x+1][y+1];
        var bottom_left = region.cols[x-1][y+1];

        if (!top_right || !top_left || !bottom_right || !bottom_left)
          return;

        if (top_left.img == rocks && top_right.img == rocks && bottom_left.img == rocks && bottom_right.img == rocks)
          tile.img = rocks;
        if (top_left.img == grass && top_right.img == grass && bottom_left.img == grass && bottom_right.img == grass)
          tile.img = grass;

        // similar to above
        if (top_left.img == grass && top_right.img == rocks && bottom_left.img == grass && bottom_right.img == rocks)
          tile.img = rock_r;
        if (top_left.img == rocks && top_right.img == grass && bottom_left.img == rocks && bottom_right.img == grass)
          tile.img = rock_l;

        // similar to the ones above that
        if (top_left.img == grass && top_right.img == grass && bottom_left.img == rocks && bottom_right.img == rocks)
          tile.img = rock_b;
        if (top_left.img == rocks && top_right.img == rocks && bottom_left.img == grass && bottom_right.img == grass)
          tile.img = rock_t;

        // grass in one corner
        if (top_left.img == grass && top_right.img == rocks && bottom_left.img == rocks && bottom_right.img == rocks)
          tile.img = grass_tl;
        if (top_left.img == rocks && top_right.img == grass && bottom_left.img == rocks && bottom_right.img == rocks)
          tile.img = grass_tr;
        if (top_left.img == rocks && top_right.img == rocks && bottom_left.img == grass && bottom_right.img == rocks)
          tile.img = grass_bl;
        if (top_left.img == rocks && top_right.img == rocks && bottom_left.img == rocks && bottom_right.img == grass)
          tile.img = grass_br;

        // rocks in one corner
        if (top_left.img == rocks && top_right.img == grass && bottom_left.img == grass && bottom_right.img == grass)
          tile.img = rock_tl;
        if (top_left.img == grass && top_right.img == rocks && bottom_left.img == grass && bottom_right.img == grass)
          tile.img = rock_tr;
        if (top_left.img == grass && top_right.img == grass && bottom_left.img == rocks && bottom_right.img == grass)
          tile.img = rock_bl;
        if (top_left.img == grass && top_right.img == grass && bottom_left.img == grass && bottom_right.img == rocks)
          tile.img = rock_br;

        // diagonals (not supplied by graphics, should we avoid this?)
        if (top_left.img == grass && top_right.img == rocks && bottom_left.img == rocks && bottom_right.img == grass)
          tile.img = grass_br;
        if (top_left.img == rocks && top_right.img == grass && bottom_left.img == grass && bottom_right.img == rocks)
          tile.img = grass_bl;
      }
    }
  }

}

var LEFT = 37;
var RIGHT = 39;
var UP = 40;
var DOWN = 38;
var SPACE = 32;

var vectors = {};
vectors[LEFT] = {x: -1, y: 0};
vectors[RIGHT] = {x: 1, y: 0};
vectors[UP] = {x: 0, y: 1};
vectors[DOWN] = {x: 0, y: -1};

var keys = {};
var bg_colors = ['#85C15B', '#CCCCCC', '#FFCC66', '#006600'];
var region_size = 40;

if (playback) {
  var events;
  ajax('report1', function(err, responseText) {
    events = responseText.split('\n');
    events = events.map(function(evt) {
      return JSON.parse(evt);
    });
  });
  
  var evt_ix = 0;
  document.addEventListener('keydown', function(evt) {
    if (evt.keyCode == RIGHT) {
      var curr_evt = events[evt_ix];
      emit(curr_evt.name, curr_evt.data);
      evt_ix++;
    }
  });
}
else {
  document.addEventListener('keydown', function(evt) {
    if (!playing || !vectors[evt.keyCode])
      return;

    var vect = vectors[evt.keyCode];
    vect.player_id = this_player_id;
    emit('move', vect);
    keys[evt.keyCode] = 1;
    setTimeout(function() {
      if (keys[evt.keyCode])
        keys[evt.keyCode] = 2;
    }, 500);
  });

  document.addEventListener('keyup', function(evt) {
    if (evt.keyCode == SPACE)
      emit('pause');
    
    keys[evt.keyCode] = 0;
  });

  setInterval(function() {
    if (!playing) return;

    for (vect in vectors) {
      if (keys[vect] == 2) {
        var vector = vectors[vect];
        vector.player_id = this_player_id;
        emit('move', vector);
      }
    }
  }, 100);
}

function spawnWorld(num_beasts, num_nests, num_dynamites) {
  var max_x = region_size;
  var max_y = region_size;
  for (var n = 0; n < num_beasts; n++)
    sprites.push(new Beast(getSpawnPosition(0, 0)));

  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      for (var n = 0; n < num_nests; n++)
        sprites.push(new Nest(getSpawnPosition(x, y)));
      for (var n = 0; n < num_dynamites; n++)
        sprites.push(new Dynamite(getSpawnPosition(x, y)));
    }
  }
  
  function getSpawnPosition(region_x, region_y) {
    var pos = {x: Math.floor(m.random() * max_x), y: Math.floor(m.random() * max_y)};
    pos.x += region_x * region_size;
    pos.y += region_y * region_size;
    if (collide(pos, sprites))
      pos = getSpawnPosition();
    return pos;
  }

  sprites.forEach(function(sprite) {
    sprite.arr.push(sprite);
  });

  for (var x = 0; x < region_size; ++x) {
    for (var y = 0; y < region_size; ++y) {
      if (m.random() > 0.85 && !collide({x: x, y: y}, sprites))
        blocks.push(new Block({x: x, y: y}));
    }
  }
  sprites = sprites.concat(blocks);
}

function Viewport(width, height) {
  this.width = width;
  this.height = height;
  this.transform_x = 0;
  this.transform_y = 0;
}
Viewport.prototype.follow = function(pos) {
  var perct_x = (pos.x * block_size - this.transform_x) / this.width;
  var perct_y = (pos.y * block_size - this.transform_y) / this.height;
  if (perct_x > .8) {
    var dest_x = Math.round(this.width * .75 / block_size);
    this.transform_x = (pos.x - dest_x) * block_size;
  }
  else if (perct_x < .2) {
    var dest_x = Math.round(this.width * .25 / block_size);
    this.transform_x = (pos.x - dest_x) * block_size; 
  }
  if (perct_y > .8) {
    var dest_y = Math.round(this.height * .75 / block_size);
    this.transform_y = (pos.y - dest_y) * block_size;
  }
  else if (perct_y < .2) {
    var dest_y = Math.round(this.height * .25 / block_size);
    this.transform_y = (pos.y - dest_y) * block_size;
  }
  ctx.setTransform(1, 0, 0, 1, -this.transform_x, -this.transform_y);
};

function Artist(ctx) {
  this.ctx = ctx;
  this.draw = this.draw.bind(this);
  this.first_time = true;
}
Artist.prototype.startDrawing = function() {
  requestAnimationFrame(this.draw);
};
Artist.prototype.draw = function() {
  if (this.first_time)
    return this.drawAll();

  this.ctx.clearRect(viewport.transform_x, viewport.transform_y, viewport.width, viewport.height);

  var terrain_size = 40; // terrain blocks are only 40px
  var num_terrains = region_size * block_size / terrain_size;
  regions.forEach(function(region) {
    var starting_x = region.x * region_size * block_size;
    var starting_y = region.y * region_size * block_size;
    for (var x = 0; x <= num_terrains; x++) {
      for (var y = 0; y <= num_terrains; y++) {
        var tile = region.cols[x][y];
        if (tile.img)
          this.ctx.drawImage(tile.img, starting_x + x * terrain_size, starting_y + y * terrain_size);
      }
    }
  }.bind(this));

  // only play sound effects for 50ms
  // TODO: move the event loop (requestAnimationFrame loop) out, so something else can manage audio
  if (gainNode.gain.value && Date.now() - snd_effect_time > 50)
    gainNode.gain.value = 0;

  sprites.forEach(function(sprite) {
    var pix = {x: sprite.x * block_size, y: sprite.y * block_size, width: block_size, height: block_size};
    if (overlap(pix, {x: viewport.transform_x, y: viewport.transform_y, width: viewport.width, height: viewport.height}))
      sprite.draw();
  }.bind(this));

  requestAnimationFrame(this.draw);
};

Artist.prototype.drawAll = function() {
  sprites.forEach(function(sprite) {
    sprite.draw();
  });
  this.first_time = false;
  requestAnimationFrame(this.draw);
};
