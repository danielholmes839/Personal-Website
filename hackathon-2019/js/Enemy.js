function EnemyVFX (sx, sy, ex, ey) {
  /* A Line supposed to represent electricity */

  this.horizontal = true;
  if (sx === ex) {
    this.horizontal = false;
  }

  var offset = grid_size/2;
  this.sx = sx + offset;
  this.sy = sy + offset;
  this.ex = ex + offset;
  this.ey = ey + offset;

  this.min_diff = 10;
  this.max_diff = 25;
  this.points = [];
  this.create_points();
}

EnemyVFX.prototype.create_points = function() {
  this.points = [];
  var x = this.sx;
  var y = this.sy;

  var offset = grid_size/4;

  // there is definitely a more intelligent way to do this 
  // but it's last minute and I want it to work
  
  if (this.horizontal) {

    if (this.ex - this.sx > 0) {
      while (x < this.ex) {
        var dy = Math.floor(Math.random()*(offset*2)-offset);
        var pos = {
          'x': x,
          'y': y+dy,
        };

        this.points.push(pos);
        x += Math.floor(Math.random()*(this.max_diff-this.min_diff) + this.min_diff);
      }
    }

    else {
      while (x > this.ex) {
        var dy = Math.floor(Math.random()*(offset*2)-offset);
        var pos = {
          'x': x,
          'y': y+dy,
        };

        this.points.push(pos);
        x -= Math.floor(Math.random()*(this.max_diff-this.min_diff) + this.min_diff);
      }
    }
  }

  else {
    if (this.ey - this.sy > 0) {
      while (y < this.ey) {
        var dx = Math.floor(Math.random()*(offset*2)-offset);
        var pos = {
          'x': x+dx,
          'y': y,
        };

        this.points.push(pos);
        y += Math.floor(Math.random()*(this.max_diff-this.min_diff) + this.min_diff);
      }
    }

    else {
      while (y > this.ey) {
        var dx = Math.floor(Math.random()*(offset*2)-offset);
        var pos = {
          'x': x+dx,
          'y': y,
        };

        this.points.push(pos);
        y -= Math.floor(Math.random()*(this.max_diff-this.min_diff) + this.min_diff);
      }
    }
  }




};

EnemyVFX.prototype.draw = function() {
  ctx.strokeStyle = 'rgb(255, 255, 0)';
  ctx.lineWidth = 2;

  for (var i=1; i<this.points.length; i++) {
    var start = this.points[i-1];
    var pos = this.points[i];
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.closePath();
    ctx.stroke();
  }
}


function Enemy(x, y, width, height) {
  /* class for enemies */
  this.x = x;
  this.y = y;

  this.sx = 0;  // point launch started at
  this.sy = 0;

  this.nx = 0;  // point to launch to
  this.ny = 0;

  this.w = width;
  this.h = height;

  this.dirx = 0;
  this.diry = 0;

  this.s = 0;
  this.a = .5;
  
  this.timer_length = 100;
  this.timer = this.timer_length;
  
  this.solid = false;
  this.moving = true;
  this.collides = true;

  this.transitioning = false;

  this.img = new Image();
  this.img.src = 'img/enemy.png';

  this.frame = 0;
  this.frame_length = 5;
  this.frame_counter = 0;
  this.last_frame = 2;

  this.vfx = [];
  this.vfx_countdown_length = 7;
  this.vfx_update_countdown = 0;
}

Enemy.prototype.end_transition = function(nodes) {
  /* end the transition between positions */
  this.transitioning = false;
  this.timer = this.timer_length;

  this.x = this.nx;
  this.y = this.ny;

  this.dirx = 0;
  this.diry = 0;
};

Enemy.prototype.is_stopping_point = function(c, level, pos) {
  /* check if a position is a place to stop at */
  var deltas = [[grid_size,0], [-grid_size, 0], [0, grid_size], [0, -grid_size]];
  var options = [true, true, true, true]; 

  for (var i=0; i<deltas.length; i++) {

    var object = {
      'x': pos.x + deltas[i][0],
      'y': pos.y + deltas[i][1],
      'w': this.w,
      'h': this.h,
    };

    for (var j=0; j<level.length; j++) {
      if (level[j].solid === true) {
        if (same_position(object, level[j]) === true || completely_overlapping(object, c) === false) {
          options[i] = false;
          break;
        }
      }
    }
  }

  var n_options = 0;
  for (i=0; i<options.length; i++) {
    if (options[i] === true) {
      n_options += 1;
    }
  }

  if (n_options !== 2) {
    return true;
  }

  else {
    if (options[0] !== options[1] && options[2] !== options[3]) {
      return true;
    }
  }

  return false;
};

Enemy.prototype.pick = function(level) {
  /* pick the next x and y position for the enemy to jump to */
  var c = {
    'x': 0,
    'y': 0,
    'w': canvas.width,
    'h': canvas.height
  };

  var deltas = [[grid_size,0], [-grid_size, 0], [0, grid_size], [0, -grid_size]];
  var doptions = [[1,0], [-1,0], [0,1], [0,-1]];
  var options = [true, true, true, true];

  for (var i=0; i<deltas.length; i++) {

    var object = {
      'x': this.x + deltas[i][0],
      'y': this.y + deltas[i][1],
      'w': this.w,
      'h': this.h,
    };

    for (var j=0; j<level.length; j++) {
      if (level[j].solid === true) {
        if (same_position(object, level[j]) === true || completely_overlapping(object, c) === false) {
          options[i] = false;
          break;
        }
      }
    }
  }

  var index_options = [];
  for (var i=0; i<options.length; i++) {
    if (options[i] === true) {
      index_options.push(i);
    }
  }

  if (index_options.length !== 0) {
    var pick = index_options[Math.floor(Math.random() * index_options.length)];
    var td = 1;

    while (true) {
    
      var object = {
        'x': this.x + (deltas[pick][0]*td),
        'y': this.y + (deltas[pick][1]*td),
        'w': this.w,
        'h': this.h,
      };

      if (this.is_stopping_point(c, level, object)) {
        this.nx = object.x;
        this.ny = object.y;
        return;
      }

      td += 1;
    }
  }

  this.nx = this.x;
  this.ny = this.y;
};

Enemy.prototype.launch = function() {
  /* launches the enemy toward their next position */
  this.sx = this.x;
  this.sy = this.y;

  this.s = 0;
  this.dirx = 0;
  this.diry = 0;
  this.transitioning = true;

  var dx = this.nx - this.x;
  var dy = this.ny - this.y;

  if (dx !== 0) {
    if (dx > 0) {
      this.dirx = 1;
    }
    else if (dx < 0) {
      this.dirx = -1;
    }
    this.s = Math.sqrt(Math.abs(this.a*2*dx));
  }

  else if (dy !== 0) {
    if (dy > 0) {
      this.diry = 1;
    }
    else if (dy < 0) {
      this.diry = -1;
    }
    this.s = Math.sqrt(Math.abs(this.a*2*dy));
  }
};

Enemy.prototype.move = function(level) {
  
  if (this.transitioning === false) { // stationary
    this.timer -= 1;
    if (this.timer===0) {
      this.launch();
    }
  }

  else { // while moving
    this.s -= this.a;
    
    if (this.dirx !== 0) {
      this.x += (this.s*this.dirx);
      
    }

    else if (this.diry !== 0) {
      this.y += (this.s*this.diry);
    }

    if (this.s - this.a <= 0) {
      this.end_transition();
      this.pick(level)
      return;
    }

    // Collision with walls
    for (i=0; i<level.length; i++) {
      if (level[i].solid === true) {
        if (overlapping(this, level[i])) {
          if (this.dirx !== 0) {
            if (this.dirx === 1) {
              this.x = level[i].x - this.w;
            }

            else {
              this.x = level[i].x + level[i].w;
            }
          }
          
          else {
            if (this.diry === 1) {
              this.y = level[i].y - this.h;
            }

            else {
              this.y = level[i].y + level[i].h;
            }
          }

          this.nx = this.x;
          this.ny = this.y;

          this.end_transition();
          this.pick(level)
          return;
        }
      }
    } 
  } 
};

Enemy.prototype.draw = function() {
  /* draw an enemy */
  ctx.fillStyle = 'rgb(255, 255, 0)';

  if (this.transitioning === false) {
    ctx.drawImage(this.img, this.frame * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    
    this.frame_counter += 1;

    if (this.frame_counter === this.frame_length) {
      this.frame += 1;
      this.frame_counter = 0;
      if (this.frame > this.last_frame) {
        this.frame = 0;
      }
    }

    this.vfx_update_countdown = -1;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(0, 100, 255)';
    ctx.strokeRect(this.nx, this.ny, this.w, this.h);
  }

  else {
    this.vfx_update_countdown -= 1;
    if (this.vfx_update_countdown < 0) {
      var n = Math.floor(Math.random()*5 + 3);
      
      this.vfx = [];
      for (var i=0; i<n; i++) {
        this.vfx.push(new EnemyVFX(this.x, this.y, this.sx, this.sy))
      }

      this.vfx_update_countdown = this.vfx_countdown_length;
    }

    for (var i=0; i<this.vfx.length; i++) {
      this.vfx[i].draw();
    }


    if (this.dirx !== 0) {
      ctx.fillRect(this.x, this.y+10, this.w, this.h-20);
    }

    else {
      ctx.fillRect(this.x+10, this.y, this.w-20, this.h);
    }
  }
};
