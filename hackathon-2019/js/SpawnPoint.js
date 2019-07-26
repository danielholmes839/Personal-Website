function SpawnPoint(x, y, width, height) {
  /* Player's spawn point */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.solid = false;
  this.moving = false;
  this.collides = false;
}

SpawnPoint.prototype.draw = function() {
  /* Draw the player's spawn point*/
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(0, 255, 0)';
  ctx.strokeRect(this.x, this.y, this.w, this.h);
};