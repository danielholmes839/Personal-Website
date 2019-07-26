function Ladder(x, y, width, height, id, l) {
  /* Ladder used to move between layers */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.solid = false;
  this.moving = false;
  this.collides = false;
  
  this.img = new Image();
  this.img.src = 'img/ladder.png';

  this.id = id;              // an id shared by 2 ladders
  this.layer = l;
} 
  
Ladder.prototype.draw = function() {
  /* Draw a ladder */
  ctx.drawImage(this.img, this.x, this.y);
}; 