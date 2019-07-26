function Key(x, y, width, height) {
  /* Keys required before a level can be completed */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.solid = false;
  this.moving = false;
  this.collides = false;

  this.collected = false;

  this.img = new Image();
  this.img.src = 'img/key/' + Math.floor(Math.random()*5) + '.png'; // pick a random image
} 
  
Key.prototype.draw = function() {
  /* Draw a key */
  if (this.collected === false) {
    ctx.drawImage(this.img, this.x, this.y);
  }
}; 