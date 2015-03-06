var coords = [
  {x: 0, y: -1},
  {x: 1, y: -1},
  {x: 1, y: 0},
  {x: 1, y: 1},
  {x: 0, y: 1},
  {x: -1, y: 1},
  {x: -1, y: 0},
  {x: -1, y: -1}
];

function clockwise(vect) {
  var ix = whereIndex(coords, {x: vect.x, y: vect.y});
  ix++;

  // cycle around the circle
  if (ix >= coords.length)
    ix = 0;
  
  return clone(coords[ix]);
}

function counterclock(vect) {
  var ix = whereIndex(coords, {x: vect.x, y: vect.y});
  ix--;

  // cycle around the circle
  if (ix < 0)
    ix = coords.length - 1;

  return clone(coords[ix]);
}

function whereIndex(arr, vect) {
  var len = arr.length;
  for (var n = 0; n < len; n++)
    if (arr[n].x == vect.x && arr[n].y == vect.y)
      return n;
  throw new Error('Unable to find: ' + vect. x + ', ' + vect.y);
}

// copied from Node.js
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

// pick random item from array
function random(arr) {
  return arr[Math.floor(m.random() * arr.length)];
}

// returns items from arr that are adjacent to coords
function adjacent(coords, arr, dist) {
  if (!dist)
    dist = 1;
  
  var adj = [];
  var len = arr.length;
  for (var n = 0; n < len; n++) {
    var sprite = arr[n];
    var diff = difference(sprite, coords);
    if (diff.x >= -dist && diff.x <= dist && diff.y >= -dist && diff.y <= dist)
      if (diff.x != 0 || diff.y != 0)
        adj.push(sprite);
  }
  return adj;
}

function difference(sprite1, sprite2) {
  return {x: sprite1.x - sprite2.x, y: sprite1.y - sprite2.y};
}

function log(msg) {
  if (is_debug)
    console.log(msg);
}

function ajax(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200)
        cb(null, xhr.responseText);
      else
        cb(new Error(xhr.status + " : " + xhr.responseText));
    }
  }
  xhr.open("GET", url, true);
  xhr.send();
}

// setup sound effects
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var oscillator = audioCtx.createOscillator();
oscillator.type = 'square';
oscillator.frequency.value = 130.81;// C3 in hertz (http://www.phy.mtu.edu/~suits/notefreqs.html, https://github.com/kittykatattack/soundForGames)
oscillator.start();
var gainNode = audioCtx.createGain();
gainNode.gain.value = 0;
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
