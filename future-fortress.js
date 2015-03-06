document.body.style.overflow = 'hidden';
var canvas = document.getElementById('tutorial');
var viewport = new Viewport(window.innerWidth || document.body.clientWidth, window.innerHeight|| document.body.clientHeight);
canvas.setAttribute('width', viewport.width);
canvas.setAttribute('height', viewport.height);
var ctx = canvas.getContext('2d');

var avail_blocks = 0;
var mode;
var is_turret = false;
canvas.addEventListener('mousedown', function(evt) {
  var pos = posFromEvt(evt);
  var sprite = collide(pos, sprites);
  if (sprite) {
    mode = 'destroy';
    emit('destroy', {pos: pos, player_id: this_player_id});
  }
  else if (avail_blocks) {
    mode = 'place';
    if (!is_turret || avail_blocks >= 8)
      emit('place', {pos: pos, is_turret: is_turret, player_id: this_player_id});
  }
});

canvas.addEventListener('mousemove', function(evt) {
  if (!mode) return;
  var pos = posFromEvt(evt);
  var sprite = collide(pos, sprites);
  if (mode == 'destroy' && sprite)
    emit('destroy', {pos: pos});
  else if (mode == 'place' && !sprite)
    if (!is_turret || avail_blocks >= 8)
      emit('place', {pos: pos, is_turret: is_turret});
});

canvas.addEventListener('mouseup', function(evt) {
  mode = null;
});

document.addEventListener('keypress', function(evt) {
  var ch = String.fromCharCode(evt.which);
  if (ch == 't')
    is_turret = !is_turret;
  if (ch == 'p')
    peaceful_beasts = !peaceful_beasts;
  if (ch == 'r')
    emit('report');
});

function posFromEvt(evt) {
  var click_pos = {x: evt.pageX, y: evt.pageY};
  return toBlockCoords(click_pos);
}

function destroy(opts) {
  var sprite = collide(opts.pos, sprites);
  if (!sprite)
    return;

  sprite.destroy();
  if (opts.player_id == this_player_id)
    avail_blocks += 2;
}

function place(opts) {
  var pos = opts.pos;
  placeBlock(pos, opts.is_turret);

  if (opts.is_turret) {
    placeBlock({x: pos.x, y: pos.y + 1}, true);
    placeBlock({x: pos.x + 1, y: pos.y}, true);
    placeBlock({x: pos.x + 1, y: pos.y + 1}, true);
    if (opts.player_id == this_player_id)
      avail_blocks -= 8;
  }
  else if (opts.player_id == this_player_id) {
    avail_blocks--;
  }
}

function placeBlock(pos, is_turret) {
  var block = new Block(pos);
  blocks.push(block);
  sprites.push(block);
  if (is_turret)
    block.makeTurret();
}

function toBlockCoords(pos) {
  return {x: Math.floor(pos.x / block_size) + viewport.x, y: Math.floor(pos.y / block_size) + viewport.y};
}

var blocks = [], beasts = [], nests = [], dynamites = [], sprites = [];
var players = [];
var playing = true;
var is_debug = true;
var snd_effect_time = Date.now();
var block_size = 40;
var peaceful_beasts = false; // makes beasts move randomly instead of toward you
var server_time = 0;
var this_player_id = Math.random();
var this_player = null;

var playback = true;
var offline = !window.io;

if (offline || playback) {
  window.emit = function(name, data) {
    handleEvent({name: name, data: data});
  };
}
else {
  var socket = io(location.origin, {multiplex: false});
  socket.on('evt', handleEvent);
  socket.on('playEvents', function(events) {
    events.forEach(function(evt) {
      handleEvent(evt);
    });
    joinGame();
  });

  window.emit = function(name, data) {
    socket.emit('evt', {name: name, data: data});
  };
}

if (offline) {
  setTimeout(function() {
    init({seed: Date.now()});
    joinGame();
  }, 0);
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

function joinGame() {
  emit('new_player', {id: this_player_id, color: 'rgb(' + [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)].join(',') + ')'});
}

function handleEvent(evt) {
  var player;
  if (evt.name == 'spawnWorld') {
    init(evt.data);
  }
  else if (evt.name == 'move') {
    player = players.filter(function(pl) { return pl.id == evt.data.player_id; })[0];
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
    {x: -1, y: -1, color: random(bg_colors)},
    {x: 0, y: -1, color: random(bg_colors)},
    {x: 1, y: -1, color: random(bg_colors)},
    {x: -1, y: 0, color: random(bg_colors)},
    {x: 0, y: 0, color: random(bg_colors)},
    {x: 1, y: 0, color: random(bg_colors)},
    {x: -1, y: 1, color: random(bg_colors)},
    {x: 0, y: 1, color: random(bg_colors)},
    {x: 1, y: 1, color: random(bg_colors)}
  ];
  spawnWorld(4, 1, 4);

  requestAnimationFrame(draw);
  interval(function() {
    if (!playing || !beasts.length) return;

    gainNode.gain.value = 0.05;
    snd_effect_time = Date.now();

    beasts.forEach(function(beast) {
      beast.move();
    });
  }, 1000);
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

function draw() {
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    regions.forEach(function(bg) {
      ctx.fillStyle = bg.color;
      ctx.fillRect(bg.x * region_size * block_size - viewport.x * block_size, bg.y * region_size * block_size - viewport.y * block_size, region_size * block_size, region_size * block_size);
    });

    // only play sound effects for 50ms
    if (gainNode.gain.value && Date.now() - snd_effect_time > 50)
      gainNode.gain.value = 0;

    sprites.forEach(function(sprite) {
        sprite.draw();
    });
    requestAnimationFrame(draw);
}

function collide(sprite, sprites) {
    var n_sprites = sprites.length;
    for (var n = 0; n < n_sprites; n++)
        if (sprites[n] != sprite && sprite.x == sprites[n].x && sprite.y == sprites[n].y)
            return sprites[n];
}

function Viewport(width, height) {
  this.x = 0;
  this.y = 0;
  this.width = width;
  this.height = height;
}
Viewport.prototype.follow = function(pos) {
  var perct_x = (pos.x - this.x) * block_size / this.width;
  var perct_y = (pos.y - this.y) * block_size / this.height;
  if (perct_x > .8) {
    var dest_x = Math.round(this.width * .75 / block_size);
    this.x = pos.x - dest_x;
  }
  else if (perct_x < .2) {
    var dest_x = Math.round(this.width * .25 / block_size);
    this.x = pos.x - dest_x; 
  }
  if (perct_y > .8) {
    var dest_y = Math.round(this.height * .75 / block_size);
    this.y = pos.y - dest_y;
  }
  else if (perct_y < .2) {
    var dest_y = Math.round(this.height * .25 / block_size);
    this.y = pos.y - dest_y;
  }
};
