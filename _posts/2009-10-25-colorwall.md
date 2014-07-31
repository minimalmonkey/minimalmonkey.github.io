---
layout: post
title:  "ColorWall"
date:   2009-10-25 00:00:00
color:  lime
---

Before you read the rest of this post, if you haven’t already done so, check out the ColorWall here.

A couple of weeks ago I saw Yugo Nakamura’s brilliant wonderwall Flash site. It’s a really original idea and one of the most impressive things I’ve seen in a while, he has done a great job of building the site. However, it got me thinking about how he made it. After a bit of a discussion with the other Flash Developers in my team we all agreed that we think it’s probably done with a 3D class library, most likely Away3D or Papervision (or maybe even one he’s developed himself). We thought that because you sometimes get weird mapping with the images as shown below, looks like a Papervision Plane with a double sided material perhaps.


After playing around with the site a bit more I thought I’d like to have a go at re-creating it but with a slightly different approach (that’s assuming we were right about the 3D library approach Yugo used). If you study the way the planes move you can see that there are defined points and this gave me the idea to build a similar application but using particles rather than a 3D library, and the below examples show you the steps I took to build it (when the example swf’s loose focus I am stopping the update method, this is to save fps with so many examples on 1 page). I won’t go into too much technical detail as the files are available to download at the bottom of this post so you can play around and see the code/maths yourself.

I started off simple by creating just one particle and getting the movement of that correct. What I needed was a particle with a home point that it’s always trying to get to, but it must avoid the mouse cursor at a certain distance. This was achieved with a bit of trigonometry and some simple easing.

 
The next step was to create a grid of particles. As you can see from the below I am getting just the movement I wanted, although this will be easier to visualize with the third example. One thing I had to do to get the right effect was make particles who’s home was closer to the mouse’s center point less effected by the repel, this stops you from having all the particles around the edge of the mouse repel circle.

 
Now I had the right movement I just needed to associate 4 particles together to create a square. Once I had that I just used the the moveTo and lineTo methods of the drawing API to connect the dots – simple!

 
The final example shows the application with the guides removed. I managed to get a very similar effect as Yogu’s wonderwall, and even surprised myself at how simple it turned out to be. It’s literally just 3 very simple classes – 1 document class to set the particles up and call an update function on enterFrame, 1 simple value object to associate 4 particles together and finally a simple particle class where the maths is done (and it’s pretty simple maths).

 
I have a few other things I want to do with these little particles, and I have already put together a PhotoWall app that I will post shortly (I just need to optimize it a bit first). The source for the above can be downloaded here. As always if you grab it and do something cool please post a comment with a link to it as I’d be really interested to see what you do.
