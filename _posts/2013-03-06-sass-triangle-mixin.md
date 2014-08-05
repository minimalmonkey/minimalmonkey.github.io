---
layout: post
title:  "SASS Triangle Mixin"
summary: "A little SASS mixin to create pure CSS triangles &amp; a link to some awesome CSS3 mixins"
date:   2013-03-06 00:00:00
color:  blue
---

If you’re not already using a CSS preprocessor then you should probably start now. They make writing CSS much more fun. I started out with [LESS](http://lesscss.org/) shortly after starting at [Fi](http://www.f-i.com/) last year but have now moved over to [SASS](http://sass-lang.com/). They’re both pretty similar but SASS has slightly more features.

One of the great things about CSS preprocessors are mixins. Below is a useful mixin I recently wrote for creating CSS triangles.

{% highlight css %}
//============================================================
//
// arrow
//
// @param width           :  px, em
// @param height          :  px, em
// @param direction       :  up, down, left, right
// @param color           :  hex, rgb
//
//============================================================

=arrow($width: 20px, $height: 20px, $direction: up, $color: red)

  width: 0
  height: 0

  // Right
  @if $direction == right
    border-top: $height/2 solid transparent
    border-bottom: $height/2 solid transparent
    border-left: $width solid $color

  // Left
  @if $direction == left
    border-top: $height/2 solid transparent
    border-bottom: $height/2 solid transparent
    border-right: $width solid $color

  // Up
  @if $direction == up
    border-left: $width/2 solid transparent
    border-right: $width/2 solid transparent
    border-bottom: $height solid $color

  // Down
  @if $direction == down
    border-left: $width/2 solid transparent
    border-right: $width/2 solid transparent
    border-top: $height solid $color
{% endhighlight %}

You can use the mixin to create triangles at your pleasure, like this.

<div style="margin: 30px auto 20px; width: 280px; height: 90px;">
	<iframe style="border: none;" name="sass-triangles" src="http://minimalmonkey.com/lab/sass-triangle-mixin/" width="280px" height="90px" frameborder="0" scrolling="auto" name="sass-triangles"></iframe>
</div>

{% highlight css %}
.label
    background-color: #e88565
    height: 60px
    line-height: 60px
    position: absolute
    text-transform: uppercase
    width: 280px

    &:after
        +arrow(40px, 30px, down, #e88565)
        content: ''
        left: 0
        margin: 60px 0 0 120px
        position: absolute
        top: 0
{% endhighlight %}

Have a play around with them on CodePen here.
