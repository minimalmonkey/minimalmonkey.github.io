---
layout: post
title:  "Fun animations with CSS3"
short_title: "CSS3 Animation Effects"
summary: "This is a short blog post on how I made some of the fun animations on this site"
date:   2013-03-02 00:00:00
color:  purple
---

Finally a new blog post! I launched the site nearly a month ago and the response to it has been both surprising and a little overwhelming. I’ve had, as of today, over 160,000 page views and my followers on twitter have almost quadrupled. This is a short blog post on how I made some of the fun animations on the site.

As I started my career as a Flash Developer I came to the CSS game pretty late. However, I think it’s been a perfect time to get started as new(ish) CSS3 features such as transition and animation/keyframe are awesome. I used them plentifully on this site.

One of the things people have noticed most about the site is all the little touches such as the twitter bird animation so I’ve just picked out a few of them to talk about here.

## Twitter Bird Animation

I’ll start with the one that people seem to love the most – the flying twitter bird you can see when hovering the top right corner of the nav bar. The thing I’m most pleased about with this is that it uses **no JavaScript**.

![Twitter bird sprite](/images/fun-animations-with-css3/twitter-bird-sprite.png)

This is made possible by CSS3 animation and the sprite sheet shown above. If you haven’t played around with them yet you can read a little about them [here](http://www.w3schools.com/css3/css3_animations.asp).

Below are two examples. The one on the left was my first attempt, I just jumped straight in without thinking and I got the effect you’ll see if you hover the bird. Kind of an obvious mistake. The example on the right uses the **step** parameter. It took a little searching to find out about **step** but once I knew about it I got the perfect effect without the need for any JavaScript. Hover the bird on the right to see it in action.

<div style="margin: 0 auto; width: 350px; height: 150px; overflow: hidden;">
	<iframe style="border: none; display: inline-block; float: left;" name="twitter-bird" src="http://www.minimalmonkey.com/lab/css3-animations/twitter.html" width="380px" height="150px" frameborder="0" scrolling="auto" name="twitter-bird"></iframe>
</div>

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

## Logo Bounce

Next up is my favourite little animation on the site – the bouncy hover state on the logo.

<div style="margin: 0 auto; width: 254px; height: 200px; overflow: hidden;">
	<iframe style="overflow: hidden; border: none; display: inline-block; float: left;" name="logo" src="http://www.minimalmonkey.com/lab/css3-animations/logo.html" width="254px" height="200px" frameborder="0" scrolling="auto" name="logo"></iframe>
</div>

This doesn’t use a sprite sheet and instead simply uses animation and margins to get the effect:

{% highlight css %}
.logo {
    background-image: url(logo.png);
    background-repeat: no-repeat;
    height: 150px;
    margin: 50px;
    width: 154px;
}

.logo:hover {
    animation-name: bounce;
    animation-duration: 0.5s;
    animation-timing-function: linear;
    animation-iteration-count: 1;
}

@keyframes bounce {
    45% {
        height: 130px;
        margin-top: 70px;
    }
    55% {
        height: 130px;
        margin-top: 70px;
    }
    75% {
        height: 170px;
        margin-top: 0px;
    }
}
{% endhighlight %}

Pretty simple right? And again, no JavaScript required here.

## Button Hovers

Finally I want to talk about the rolly hover states of the nav buttons. This effect is used a lot at the moment and I personally really like it as it looks slick but gives the user clear feedback of when a button is hovered.

<div style="margin: 0 auto; width: 100%; height: 60px; overflow: hidden;">
	<iframe style="overflow: hidden; border: none; display: inline-block; float: left;" name="button" src="http://www.minimalmonkey.com/lab/css3-animations/button.html" width="100%" height="60px" frameborder="0" scrolling="auto" name="button"></iframe>
</div>

To get this effect on your site requires a little extra markup:

{% highlight js %}
<div class="button">
    <span class="label">Button Label</span>
    <span class="label">Button Label</span>
</div>
{% endhighlight %}

Again all the work is done by CSS3 with no need for JavaScript.

{% highlight css %}
.button {
    display: inline-block;
    height: 60px;
    line-height: 60px;
    overflow: hidden;
    position: relative;
    text-align: center;
}

.label {
    display: block;
    height: 100%;
    position: relative;
    top: 0%;
    transition: top 0.35s;
    width: 100%;
}

.button:hover .label {
    top: -100%;
}
{% endhighlight %}

A full working example of all the code that you can play with and modify can be found [here](http://codepen.io/minimalmonkey/pen/AHxys) on CodePen.
