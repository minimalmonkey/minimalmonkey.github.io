---
layout: post
title:  "A Nice Recursion Example"
date:   2013-04-03 00:00:00
color:  lime
---

Recursion is cool. It can be defined in a non computer science way as:

the process of repeating items in a self-similar way

You may have experienced a simple form of recursion in a clothing shop fitting room when each side of the cubicle has mirrors and you see your reflection repeated for infinity; as shown in this photo.

Recursion is also a really powerful programming technique. In computer science it’s defined as:

a method where the solution to a problem depends on solutions to smaller instances of the same problem

Before I go on a little background behind this blog post. A friend of mine (no, not me but I won’t mention who) was recently interviewing for a new job and as part of the process was presented with this problem:

Given a random matrix, where each cell is either 1 or 0, determine the groups of contiguous cells that have the value 1. Cells are considered contiguous if they are neighboring to the north, south, east or west; i.e. no disgonals

The solution to the problem can be visualised in the below image.

I had a quiet Monday night a couple of weeks ago and being a bit of a nerd I thought I’d give the challenge a go. You know, for fun.

At first I thought the problem would be really easy but soon I realised it wasn’t as simple as it first seems. After staring at it for a bit I realised the solution was to use recursion!

It’s actually a really nice example of recursion and that’s why I’m posting it here as I think it could help beginners understand what recursion is and how they can use it.

So let’s look at how to solve this problem. We obviously need to loop through and see if a cell is a 0 or 1. Once we find a 1 we give it a random color then check it’s adjacent cells and if they are also 1′s give them the same color. If an adjacent cell is a 1, we should also check that cell’s adjacent cells and repeat the process until we have find a cell with no adjacent 1′s.

So let’s look at this in code but with all the non-logic stuff stripped out – e.g. I’m not going to include the code for drawing to the canvas etc, you can view the final code with all that on CodePen here.

{% highlight js %}
// random matrix
var matrix = [[0,1,0,0,1],[1,1,0,0,1],[1,0,0,1,0],[0,0,1,1,1],[0,0,1,0,0]];

var init = function() {

  // for loops to iterate through each cell
  for(var row = 0; row < matrix.length; ++row) {
    for(var column = 0; column < matrix[rows].length; ++column) {

      // if cell is a 1
      if(matrix[row][column] === 1) {

        // create a random color
        var color = matrix[row][column] = randomColor();

        // check adjacent cells
        checkNeighbours(row, column, color);
      }
    }
  }
};

var checkNeighbours = function(rows, cols, color) {

  // check cell above
  if(rows-1 >= 0 && matrix[rows-1][cols] === 1) {
    matrix[rows-1][cols] = color;

    // call checkNeighbours function from within itself
    checkNeighbours(rows-1, cols, color); // recursion!
  }

  // check cell below
  if(rows+1 < matrix.length && matrix[rows+1][cols] === 1) {
    matrix[rows+1][cols] = color;

    // call checkNeighbours function from within itself
    checkNeighbours(rows+1, cols, color); // recursion!
  }

  // check cell to the left
  if(cols-1 >= 0 && matrix[rows][cols-1] === 1) {
    matrix[rows][cols-1] = color;

    // call checkNeighbours function from within itself
    checkNeighbours(rows, cols-1, color); // recursion!
  }

  // check cell to the right
  if(cols+1 < matrix[rows].length && matrix[rows][cols+1] === 1) {
    matrix[rows][cols+1] = color;

    // call checkNeighbours function from within itself
    checkNeighbours(rows, cols+1, color); // recursion!
  }

};
{% endhighlight %}

In the above example we call the checkNeighbours function from within itself and continue to do so until we find a cell that has no unset adjacent 1′s. This is recursion.

See the below image to visualise the order in which the code runs through and colors each cell.

I hope this helps anyone who was struggling to get their head around what recursion is and how to use it. If it doesn’t make sense give me a shout in the comments and I’ll try to explain it further!
