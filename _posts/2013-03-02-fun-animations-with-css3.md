---
layout: post
title:  "Fun animations with CSS3"
date:   2013-03-02 00:00:00
color:  purple
---

Finally a new blog post! I launched the site nearly a month ago and the response to it has been both surprising and a little overwhelming. I’ve had, as of today, over 160,000 page views and my followers on twitter have almost quadrupled. This is a short blog post on how I made some of the fun animations on the site.

As I started my career as a Flash Developer I came to the CSS game pretty late. However, I think it’s been a perfect time to get started as new(ish) CSS3 features such as transition and animation/keyframe are awesome. I used them plentifully on this site.

One of the things people have noticed most about the site is all the little touches such as the twitter bird animation so I’ve just picked out a few of them to talk about here.

Twitter Bird Animation

I’ll start with the one that people seem to love the most – the flying twitter bird you can see when hovering the top right corner of the nav bar. The thing I’m most pleased about with this is that it uses no JavaScript.

This is made possible by CSS3 animation and the sprite sheet shown above. If you haven’t played around with them yet you can read a little about them here.

Below are two examples. The one on the left was my first attempt, I just jumped straight in without thinking and I got the effect you’ll see if you hover the bird. Kind of an obvious mistake. The example on the right uses the step parameter. It took a little searching to find out about step but once I knew about it I got the perfect effect without the need for any JavaScript. Hover the bird on the right to see it in action.

{% highlight css %}
.twitter-bird {
    background-image: url(twitter-bird-sprite.png);
    display: inline-block;
    height: 150px;
    width: 150px;
}

.twitter-bird:hover {
    animation: fly 0.2s steps(3) 0 infinite;
}

@keyframes fly {
    from { background-position: 0 0; }
    to { background-position: -450px 0; }
}
{% endhighlight %}

Logo Bounce

Next up is my favourite little animation on the site – the bouncy hover state on the logo.

This doesn’t use a sprite sheet and instead simply uses animation and margins to get the effect:

Pretty simple right? And again, no JavaScript required here.

Button Hovers

Finally I want to talk about the rolly hover states of the nav buttons. This effect is used a lot at the moment and I personally really like it as it looks slick but gives the user clear feedback of when a button is hovered.

To get this effect on your site requires a little extra markup:

Again all the work is done by CSS3 with no need for JavaScript.

A full working example of all the code that you can play with and modify can be found here on CodePen.
