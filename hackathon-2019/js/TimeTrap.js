function TimeTrap(x, y, width, height) {
  /* Animate a player goes back in time on collision */

  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.solid = false;
  this.moving = false;
  this.collides = false;

  this.activated = false;
  this.img = new Image();
  this.img.src = 'img/clock.png';

  this.frame = 0;
  this.frame_length = 20;
  this.frame_counter = 0;
  this.last_frame = 4;
}; 
  
TimeTrap.prototype.draw = function() {
  /* Draw the trap */
  if (this.activated === false) {
    ctx.drawImage(this.img, 0, this.frame * 31, this.w, this.h, this.x, this.y, this.w, this.h);
    
    this.frame_counter += 1;

    if (this.frame_counter === this.frame_length) {
      this.frame += 1;
      this.frame_counter = 0;
      if (this.frame > this.last_frame) {
        this.frame = 0;
      }
    }
  }
}; 