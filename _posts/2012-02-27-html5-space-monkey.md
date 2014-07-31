---
layout: post
title:  "HTML5 Space Monkey"
date:   2012-02-27 00:00:00
color:  green
---

After finishing at Specialmoves last week I now have a few weeks off before moving to New York and getting started at Fi, so plenty of time to work on all the little experiments and ideas I’ve had recently.

I’ve been really enjoying playing around with HTML5 and thought it would be a nice challenge to re-write my Flash Space Monkey game using only HTML5, JavaScript and CSS. I’m really happy with the result and it even works quite nicely on iOS, where you can control the game by tilting your iPhone/iPad from left to right, taking advantage of JavaScript’s native device orientation events.

The character is made up of nested dom elements and is controlled by CSS3 transitions. The platforms are transparent PNGs drawn to a canvas element.

I was originally thinking of creating the game using some of the many great JavaScript libraries available but ended up just using a bit of JQuery (of course) and also RequireJS, which I found really useful.

It’s only been tested on a limited amount of devices so any feedback on performance is welcomed. Also, since I’m still relatively new to extensive JS and CSS, any tips on how I could do things better in the future would be cool too. Enjoy the game and see if you can beat my high score of 20,000+!!!
