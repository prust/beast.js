# Beast.js

An ultra-simple clone of the 1984 [Beast](http://theodor.lauppert.ws/games/beast.htm) DOS game that I had fond memories of playing as kid. I made it after working through the first part of Mozilla's [canvas tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) with my 9-year-old son. Credit for all the gameplay ideas goes to the original authors: Dan Baker, Alan Brown, Mark Hamilton and Derrick Shadel.

Screenshot of original DOS game:

![Screenshot of original DOS game](http://theodor.lauppert.ws/games/s/screen1/ascii/beast.png)

Screenshot of my Javascript remake:

![Screenshot of remake](https://raw.githubusercontent.com/prust/beast.js/master/screenshot.png =371x279)

## Instructions

Use the arrow keys to move. You are the blue rectangle, if the black "beasts" touch you, you die (you can tell because the game stops moving). Refresh the browser to start again. You can squish the Beasts between two bricks -- squish all the beasts and you win.

## Known Issues

There are still a couple minor bugs, for instance if you push a block towards a beast and they are moving towards you at approximately the same time, they can move through the block and kill you. Also, the beasts aren't quite as smart about making their way to your position as they could be, there's still a bug or two in that code.

## Play!

Go to http://prust.github.io/beast.js to play!
