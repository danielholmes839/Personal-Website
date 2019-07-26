function FallTrap(x, y, width, height) {
  /* Fall trap */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.solid = false;
  this.moving = false;
  this.collides = false;

  this.img = new Image();
  this.img.src = 'img/falltrap.png';
}; 
  
FallTrap.prototype.draw = function() {
  /* Draw a fall trap */
  ctx.drawImage(this.img, this.x, this.y);  
}; 