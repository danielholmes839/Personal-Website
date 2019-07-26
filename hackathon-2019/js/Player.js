function Player(x, y, width, height, max_speed, acceleration) {
  /* class for player objects */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.ms = max_speed;    // max speed
  this.sx = 0;            // current speed x axis
  this.sy = 0;            // current speed y axis
  this.a = acceleration;  // acceleration


  this.wind_back = false;         // is winding back
  this.wind_back_positions = [];  // list of previous player positions
  this.wind_back_index = 0;       // position index 
  this.wind_back_length = 150;    // number of positions to keep track of
  this.wind_back_speed = 2;       // how many times faster to rewind

  this.dirx = 0;
  this.diry = 0;

  this.deaths = 0;
  this.death_gui = document.getElementById('deaths-g');

  this.start_countdown = false;
  this.invulnerable = false;
  this.invulnerable_counter_length = 200;
  this.invulnerable_counter_start_flashing = 200; // maybe we could change this later 
  this.invulnerable_counter = this.invulnerable_counter_length;

  this.img = new Image();
  this.img.src = 'img/player.png';
  this.c = 0; // col
  this.r = 0; // row on sprite sheet

  this.frame_length = 15;
  this.frame_counter = 0;
  this.last_frame = 3;  
}

Player.prototype.update_death_gui = function() {
  /* update the gui */
  this.death_gui.innerHTML = this.deaths;
};

Player.prototype.move_x = function() {
  /* move the player in the x direction */

  if (this.dirx !== 0) { // player is actively accelerating
    this.sx += this.a * this.dirx;
    if (Math.abs(this.sx) > this.ms) {
      this.sx = this.ms * (this.sx/Math.abs(this.sx));
    }
  }

  else {                  // player is not actively accelerating
    if (this.sx > 0) {    // are they atleast moving right
      this.sx -= this.a;  // slow them down - make speed more left
      if (this.sx < 0) {  // if there speed becomes toward the left set it to 0
        this.sx = 0;
      }
    }

    else if (this.sx < 0) { // same thing but for the moving left slowing down right 
      this.sx += this.a;
      if (this.sx > 0) {
        this.sx = 0;
      }
    }
  }

  this.x += this.sx;
};
  
Player.prototype.move_y = function() {
  /* move the player in the y direction */
  
  if (this.diry !== 0) {
    this.sy += this.a * this.diry;
    if (Math.abs(this.sy) > this.ms) {
      this.sy = this.ms * (this.sy/Math.abs(this.sy));
    }
  }

  else {
    if (this.sy > 0) {
      this.sy -= this.a;
      if (this.sy < 0) {
        this.sy = 0;
      }
    }

    else if (this.sy < 0) {
      this.sy += this.a;
      if (this.sy > 0) {
        this.sy = 0;
      }
    }
  }

  this.y += this.sy;
};    
  
Player.prototype.collision_x = function(wall) {
  /* wall can be any object with the attributes x, y, w, h */
  if (overlapping(this, wall)) {
      if (this.x < wall.x) {
        this.x = wall.x - this.w;
      }
      else {
        this.x = wall.x + wall.w;
      }
    }

  else {
    collide_level_boundary_x(this);
  }
};
  
Player.prototype.collision_y = function(wall) {
  /* wall can be any object with the attributes x, y, w, h */
  if (overlapping(this, wall)) {
    if (this.y < wall.y) {
      this.y = wall.y - this.h;
    }
    else {
      this.y = wall.y + wall.h;
    }
  }

  else {
    collide_level_boundary_y(this);
  }
};

Player.prototype.collide_all_x = function(level) {
  /* does hit boxes for the player after they have moved in the x direction */
  for (var  i = 0; i < level.array.length; i++) {
    if (level.array[i].solid === true) {
      this.collision_x(level.array[i]);
    }
  }
};

Player.prototype.collide_all_y = function(level) {
  /* does hit boxes for the player after they have moved in the y direction */
  for (var  i = 0; i < level.array.length; i++) {
    if (level.array[i].solid === true) {
      this.collision_y(level.array[i]);
    }
  }
};

Player.prototype.spawn = function(level) {
  /* When the game is first started */
  level.move_player_to_spawn(this);
  this.reset_wind_back()                  // reset previously visited positions  
  this.start_invulnerability();
}

Player.prototype.respawn = function(level) {
  /* When the player respawn - dies */
  if (this.invulnerable === false) {
    play_sound(player_death);             // global variable in Audio.js
    level.move_player_to_spawn(this);
    
    this.deaths += 1;
    this.update_death_gui();
    
    this.stop_wind_back();
    this.reset_wind_back();
    this.start_invulnerability();

    this.dirx = 0;
    this.diry = 0;
    this.sx = 0;
    this.sy = 0;
  }
};

Player.prototype.start_invulnerability = function() {
  this.invulnerable_counter = this.invulnerable_counter_length;
  this.invulnerable = true;
  this.start_countdown = false;
};

Player.prototype.move = function(level) {
  /* Handles all hit boxes with solid objects and movement for the player */
  
  if (!this.wind_back) {
    this.move_x();
    this.collide_all_x(level);
    this.move_y();
    this.collide_all_y(level);
    this.update_wind_back_positions();
  }

  else {
    this.wind();

    for (var i=0; i<level.array.length; i++) {
      if (level.array[i].solid === true) {
        if (overlapping(this, level.array[i])) {
          if (this.wind_back_index+1 < this.wind_back_positions.length) {
            var previous_pos = this.wind_back_positions[this.wind_back_index + (2*this.wind_back_speed)];
            
            if (previous_pos !== undefined) {
              this.x = previous_pos.x;
              this.y = previous_pos.y;
            }
            this.stop_wind_back();
          }
        }
      }
    }

  }

  this.update_invulnerability();
};

Player.prototype.start_wind_back = function() {
  /* start winding the player back */
  play_sound(rewind_ticking);
  this.wind_back = true;
  this.wind_back_index = this.wind_back_positions.length-1;
};

Player.prototype.stop_wind_back = function() {
  /* stop winding the player back */
  this.wind_back = false;
  this.reset_wind_back();
};

Player.prototype.reset_wind_back = function() {
  /* called when the player switched layers */
  this.wind_back_positions = [];
  this.wind_back_positions.push({'x': this.x, 'y': this.y});
};

Player.prototype.wind = function() {
  var pos = this.wind_back_positions[this.wind_back_index];
  this.x = pos.x;
  this.y = pos.y;
  this.wind_back_index -= this.wind_back_speed;
  
  if (this.wind_back_index < 0) {
    this.stop_wind_back();
  }
};

Player.prototype.update_wind_back_positions = function() {
  /* 
    update the positions in the wind back positions list
    - delete the first positions in the list
    - add the newest position  
  */
  if (this.wind_back_positions.length >= this.wind_back_length) {
    this.wind_back_positions.shift();
  }

  this.wind_back_positions.push({'x': this.x, 'y': this.y});
};

Player.prototype.update_invulnerability = function() {
  /* Update the players invulnerability */
  if (this.start_countdown === true) {
    if (this.invulnerable === true) {
      this.invulnerable_counter -= 1;

      if (this.invulnerable_counter === 0) {
        this.invulnerable = false;
      }
    }
  }

  else if (this.dirx !== 0 || this.diry !== 0) {
    this.start_countdown = true;
  }
};

Player.prototype.update_sprite_pos = function() {

  if (this.dirx !== 0 || this.diry !== 0) {
    this.frame_counter += 1;

    if (this.frame_counter === this.frame_length) {
      this.r += 1;
      this.frame_counter = 0;

      if (this.r === this.last_frame) {
        this.r = 0;
      }
    }

    /*
    if (Math.abs(this.sx) > Math.abs(this.sy)) {
      if (this.sx < 0) {
        this.c = 0;
      }

      else {
        this.c = 2;
      }
    }

    else {
      if (this.sy < 0) {
        this.c = 3;
      }

      else {
        this.c = 1;
      }
    }
    */
  }


  else {
    this.r = 1;
  }
}

Player.prototype.draw = function() {
  /* draw the player */

  if (this.wind_back) {
    ctx.strokeStyle = 'rgb(128, 0, 255)';
    ctx.lineWidth = 2;
    var offset = grid_size/2;

    for (var i=1; i<this.wind_back_index; i++) {
      var start = this.wind_back_positions[i-1];
      var pos = this.wind_back_positions[i];
      
      ctx.beginPath();
      ctx.moveTo(start.x + offset, start.y + offset);
      ctx.lineTo(pos.x + offset, pos.y + offset);
      ctx.closePath();
      ctx.stroke();
    }
  }

  this.update_sprite_pos();
  ctx.drawImage(this.img, this.c * this.w, this.r * this.h, this.w, this.h, this.x, this.y, this.w, this.h);

  if (this.invulnerable === true) {
    if (this.invulnerable_counter < this.invulnerable_counter_start_flashing) {
      if (this.invulnerable_counter % 20 < 10) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.25)';
        ctx.fillRect(this.x, this.y, this.w, this.h);
      }
    }

    else {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.25)';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
};