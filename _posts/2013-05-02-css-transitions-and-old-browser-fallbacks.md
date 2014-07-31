---
layout: post
title:  "CSS Transitions and old browser fallbacks"
date:   2013-05-02 00:00:00
color:  red
---

Using CSS3 transitions are great. Supporting old browsers, not so great. As I stated in a tweet recently I think that for non-essential animations it’s fine to use CSS3 without a JavaScript fallback. If the user is viewing in an old browser like IE8, then stuff will just pop/snap without transitions. They still get to see all the content, we’re not depriving them of that, they just don’t get the nice transitions.

Let’s take a simple image gallery like the one below. I’m using opacity and CSS3 Transitions to smoothly crossfade between images.

This gallery works great in modern browsers but when we remove CSS opacity and transition support there is an obvious issue – the user will continuously see the last image. We could use display: none; instead of opacity but then we won’t have our smooth transitions in modern browsers.

The other fallback is to use a negative margin, e.g. margin-left: -99999px; That sort of works but in modern browsers there’s no fadeout transitions, or rather the transition happens, but off the page. You see the background color pop in then the image fades in, like this.

It’s close but not as smooth as it could be by having the images crossfade. The trick is to keep the negative margin in, but add it with a delay to your transitions.

When fading an image out we have a delay so we don’t adjust the margin until the fadeout is complete in modern browsers.

{% highlight css %}
transition: opacity 1s, margin-left 0s linear 1s;
Fading an image in, we remove the delay.
{% endhighlight %}

transition: opacity 1s, margin-left 0s;
Now we get the nice crossfade in modern browsers, and when the transition is complete we set the negative margin so it also works in older browsers. The delay on the margin is ignored in older browser as transitions are not supported so we just pop between images. It’ll look like this.

But in modern browsers we get the nice smooth crossfade transitions as show in the first example up top.

One thing to make sure of is that you have your transition properties in the correct order.

{% highlight css %}
transition: [ <transition-property> ||
<transition-duration> ||
<transition-timing-function> ||
<transition-delay> ]
{% endhighlight %}

If not the delay will not work in certain browsers. Also, always ensure to specify the type after duration, even when using 0. For example, 0s or 0ms.

I’ve put a simple working example of what I’m showing above on CodePen here. Obviously this is dependant on client expectations on how the site should look/work in older browsers.
