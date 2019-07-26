function ChaseEnemyVFX(parent) {
  /* a trail going back */
  this.min_duration = 10;
  this.max_duration = 27;

  this.min_size = 5;
  this.max_size = 12;

  this.speed_change_min = -.8;
  this.speed_change_max = .8;

  this.w = 25;
  this.h = 25;
  this.duration, this.x, this.y, this.sx, this.sy, this.size;

  this.create(parent);
};

ChaseEnemyVFX.prototype.create = function(parent) {
  this.x = parent.x + parent.w / 2;
  this.y = parent.y + parent.h / 2;

  this.pick_size();
  this.pick_duration();
  this.pick_speed(parent);
};

ChaseEnemyVFX.prototype.pick_speed = function(parent) {
  this.sx = -parent.sx + Math.round((Math.random()* (this.speed_change_max - this.speed_change_min)) + this.speed_change_min);
  this.sy = -parent.sy + Math.round((Math.random()* (this.speed_change_max - this.speed_change_min)) + this.speed_change_min);
};

ChaseEnemyVFX.prototype.pick_size = function(parent) {
  this.size = Math.round((Math.random()* (this.max_size - this.min_size)) + this.min_size);
};

ChaseEnemyVFX.prototype.pick_duration = function() {
  this.duration = Math.round((Math.random()* (this.max_duration - this.min_duration)) + this.min_duration);
};

ChaseEnemyVFX.prototype.move = function() {
  this.x += this.sx;
  this.y += this.sy;
};

ChaseEnemyVFX.prototype.draw = function(parent) {

  if (!parent.chasing) {
    ctx.fillStyle = 'rgba(25, 25, 80, 0.2)';
    ctx.strokeStyle = 'rgba(25, 25, 80, 0.2)';
  }

  else {
    ctx.fillStyle = 'rgba(180, 25, 25, 0.2)';
    ctx.strokeStyle = 'rgba(180, 25, 25, 0.2)';
  }

  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();

  this.move();

  this.duration -= 1;
  if (this.duration < 0) {
    this.create(parent);
  }
};


function ChaseEnemy(x, y) {
  /* Enemy that chases the player */
  this.x = x;
  this.y = y;

  this.w = 27;
  this.h = 32;

  this.solid = false;
  this.moving = true;
  this.collides = false;

  this.s = .8;                  // total speed as a vector
  this.sx = 0;                  // speed x
  this.sy = 0;                  // speed y

  this.cx = this.x;             // where the chase started
  this.cy = this.y;  
  
  this.chasing = false;         // whether or not currently chasing
  this.chasing_range = 125;     // detection range to start chasing
  this.max_range = 200          // distance from the start of the chase it can move

  this.wx = 0                   // position to wander to
  this.hx = 0                   

  this.wandering = false;       // whether or not wandering
  this.wander_duration = 0;     // timer to change wander position

  this.img = new Image();
  this.img.src = 'img/chase-enemy.png';
  
  this.frame = 0;
  this.frame_length = 10;
  this.frame_counter = 0;
  this.last_frame = 5;  
  this.c = 0;

  this.vfx = [];
  for (var i=0; i<50; i++) {
    this.vfx.push(new ChaseEnemyVFX(this));
  }
};

ChaseEnemy.prototype.get_distance = function (pos) {
  /* Pythagorean theorum to get distance to a position */
  var dx = pos.x - this.x;
  var dy = pos.y - this.y;

  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};

ChaseEnemy.prototype.in_range = function (player) {
  /* Check if the player is inside of the chasing range */
  if (this.get_distance(player) < this.chasing_range) {
    return true;
  }
  return false;
};

ChaseEnemy.prototype.in_max_range = function () {
  /* Check if the player is inside of the chasing range */
  var start = {
    'x': this.cx,
    'y': this.cy,
  };

  if (this.get_distance(start) < this.max_range) {
    return true;
  }
  return false;
};


ChaseEnemy.prototype.set_speed = function (pos) {
  /* Set the speeds based on the angle between the enemy and the player */
  var dx = pos.x - this.x;
  var dy = pos.y - this.y;
  
  if (dx === 0) {dx = 0.01;}
  if (dy === 0) {dy = 0.01;}

  var theta = Math.atan(Math.abs(dy/dx));

  this.sx = this.s * Math.cos(theta) * (Math.abs(dx)/dx);
  this.sy = this.s * Math.sin(theta) * (Math.abs(dy)/dy);
};

ChaseEnemy.prototype.chase = function (player, level) {
  /* Chase the player */
  if (this.chasing === false) { // start of chase
    this.cx = this.x;
    this.cy = this.y;
    this.wandering = false;
    this.chasing = true;
  }

  this.set_speed(player);
  this.x += this.sx;
  this.y += this.sy;

  if (overlapping(this, player)) {
    player.respawn(level);
  }
};

ChaseEnemy.prototype.wander = function () {
  /* wander around the map */
  if (this.wandering === false) {
    this.wander_update();
    this.wandering = true;
    this.chasing = false;
  }

  this.cx = this.x;
  this.cy = this.y;

  this.x += this.sx;
  this.y += this.sy;

  this.wander_duration -= 1;
  if (this.wander_duration < 0) {
    this.wander_update();
  }
};

ChaseEnemy.prototype.wander_update = function () {
  /* pick a new place to go toward*/
  this.wx = Math.floor(Math.random() * (canvas.width - this.w));
  this.wy = Math.floor(Math.random() * (canvas.height - this.h));

  var wander_pos = {
    'x': this.wx,
    'y': this.wy,
  };
  var d = this.get_distance(wander_pos);
  var max_duration = d/this.s;
  
  this.wander_duration = Math.floor(Math.random()*max_duration); // kind of weights it toward shorter paths
  this.set_speed(wander_pos);
};

ChaseEnemy.prototype.move = function(player, level) {
  /* Decide to chase or not to chase */
  if (this.in_range(player) && this.in_max_range() && player.invulnerable === false) {
    this.chase(player, level);
  }

  else {
    this.wander();
  }
};

ChaseEnemy.prototype.draw = function() {
  /* draw the enemy */
  for (var i=0; i<this.vfx.length; i++) {
    this.vfx[i].draw(this);
  }

  if (this.chasing) {
    this.c = 2;
  }

  else {
    this.c = 0;
  }

  ctx.drawImage(this.img, this.c * this.w, this.frame * this.h, this.w, this.h, this.x, this.y, this.w, this.h);
  
  this.frame_counter += 1;

  if (this.frame_counter === this.frame_length) {
    this.frame += 1;
    this.frame_counter = 0;
    if (this.frame > this.last_frame) {
      this.frame = 0;
    }
  }
};
