---
layout: post
title:  "Collage Creator"
summary: "This idea originated from playing around with the Flickr API whilst creating Colorwall with images"
date:   2009-11-22 00:00:00
color:  navy
---

This idea originated from playing around with the Flickr API whilst creating the Colorwall with images example I posted a couple of weeks ago. So what is it? Simply an image, made up of thousands of other images, dynamically created using Flickr thumbnails. To be honest someone has probably done this before, if not with Flickr then definitely with another source of images, but that didn’t stop me as I had a lot of fun putting this little experiment together.

You can check out the experiment [here](http://flashmonkey.co.uk/flash/collagecreator/). It takes a bit of time to get a good representation of your image, so the best bet is to set it up then go off and do something else for a while (or just watch it, I find it quite interesting to see the image develop!). After a bit of time you should get a pretty good looking image like the one below.

![Screenshot of collage creator experiment](/images/collagecreator/screenshot.jpg)

If you look a bit closer you’ll see all the pixels of the monkey are made up of random images.

![Screenshot of collage creator experiment close up](/images/collagecreator/screenshot-zoom.jpg)

Creating this app was actually a lot simpler than I was expecting. To get the average color of the image I simply grab each RGB value of every pixel, then divide by the amount of pixels. For this I used some code written by [Justin Windle](http://blog.soulwire.co.uk/about). To view Justin’s code and read about how it works follow [this link](http://blog.soulwire.co.uk/flash/actionscript-3/extract-average-colours-from-bitmapdata/). Once I had the color values I just compare them to each pixel and give it a score of how similar it is to the original pixel, the longer you leave it the more likely it is to find a perfect match.

I actually started to build save functionality so you could save your collage and there was going to be a gallery (I even bought a domain for it!). However, after I had written some code for saving, the next time I came back to the application several of the images where no longer available (I guess the owners had taken them down from Flickr) so I canned that idea, for now anyway, I may come back to it one day.

I really enjoyed building this one and have added a ‘create your own’ section so you can upload your own images and have them turned into a collage. If you create something cool take a screenshot of it, send me it and I’ll put the best ones on the site.
