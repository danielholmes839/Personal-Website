function Exit(x, y, width, height) {
  /* Exit to the maze */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.solid = false;
  this.moving = false;
  this.collides = false;

  this.img = new Image();
  this.img.src = 'img/exit.png';
}

Exit.prototype.draw = function() {
  /* Draw the exit to the maze */
  ctx.drawImage(this.img, this.x, this.y);
};
