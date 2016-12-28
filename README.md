# Beast.js

An ultra-simple clone of the 1984 [Beast](http://theodor.lauppert.ws/games/beast.htm) DOS game that I had fond memories of playing as kid. I made it after working through the first part of Mozilla's [canvas tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) with my 9-year-old son. Credit for all the gameplay ideas goes to the original authors: Dan Baker, Alan Brown, Mark Hamilton and Derrick Shadel.

## Screenshots

The original [1984 DOS game](http://theodor.lauppert.ws/games/beast.htm) (may have been written in Assembler, the 4 guys who wrote it worked on WordPerfect at BYU and worked in Assembler):

![Screenshot of original DOS game](http://theodor.lauppert.ws/games/s/screen1/ascii/beast.png)

My Javascript remake:

<img src="https://raw.githubusercontent.com/prust/beast.js/master/screenshot.png" width="371" height="279">

## Instructions

Use the arrow keys to move. You are the blue square, if the black "beasts" touch you, you die (you can tell because the game stops moving). Refresh the browser to start again. You can squish the Beasts between two bricks -- squish all the beasts and you win.

* There are two **Beast Nests** (dark grey) that spawn beasts every 20 seconds
* There are four **Dynamite blocks** (red) that explode when they come in contact with another dynamite block - this is the only way to destroy a Beast Nest

## Bug Reports

If you see any bugs, please report them on the [issues page](https://github.com/prust/beast.js/issues).

## Known Issues

* I'm pretty sure that on rare occasions I've seen beasts move through solid block walls -- perhaps diagonally? I need to do some logging and/or a subsystem integrity check to nail this down
* I think I've seen like beasts move on top of dynamite blocks or dynamite blocks being moved on top of beasts

## Roadmap

* Create a super-beast that is the final product of a beast nest and can only be destroyed by dynamite. You want to destroy both nests before any of these are spawned because they move quick, push blocks around and are hard to kill.

## Play!

Go to http://prust.github.io/beast.js to play!

## Update

I wrote a more recent version of this in Lua: https://github.com/prust/beast-lua. It's not as complete as this one, but has better movement and probably better code.
