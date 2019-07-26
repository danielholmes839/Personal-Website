function Level(layers) {
  /* Level class */
  this.w = canvas.width;
  this.h = canvas.height;
  
  // store the objects part of the level
  this.layers = layers; 
  this.array = layers[0];

  // other information
  this.current_layer = 0;
  this.keys_collected = 0;
  this.keys_required = this.get_num_keys();

  // gui for layers
  this.layer_gui = document.getElementById('layer-g');
  this.update_layer_gui();

  // gui for keys
  this.key_gui = document.getElementById('keys-g');
  this.update_key_gui();
}
  
Level.prototype.draw = function() {
  /* Draw the level */
  for (var i = 0; i < this.array.length; i++) {
    if (!(this.array[i] instanceof ChaseEnemy || this.array[i] instanceof Enemy)) {
      this.array[i].draw();
    }
  }

  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof ChaseEnemy || this.array[i] instanceof Enemy) {
      this.array[i].draw();
    }
  }
};
  
Level.prototype.update_layer_gui = function() {
  /* Updates the gui for which layer the player is on */
  this.layer_gui.innerHTML = parseInt(this.current_layer+1) + '/' + this.layers.length;
};

Level.prototype.update_key_gui = function() {
  /* Updates the gui for which layer the player is on */
  this.key_gui.innerHTML = parseInt(this.keys_collected) + '/' + this.keys_required;
};
  
Level.prototype.switch_layer = function(l) {
  /* Method to simplify switching layers */
  play_sound(switch_layer_sound);
  this.current_layer = l;
  this.update_layer_gui();
  this.array = this.layers[l];
};

Level.prototype.get_num_keys = function() {
  /* get the number of keys in the level  */
  var num_keys = 0;

  for (var l = 0; l < this.layers.length; l++) {
    for (var i = 0; i < this.layers[l].length; i++) {
      if (this.layers[l][i] instanceof Key) {
        num_keys += 1;
      }
    }
  }

  return num_keys;
}
Level.prototype.key_collision = function (player) {
  /* Check if the player has collected a key */
  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof Key === true) {
      if (this.array[i].collected === false && overlapping(player, this.array[i]) === true) {
        play_sound(key_pickup);         // global variable in Audio.js
        this.array[i].collected = true;
        this.keys_collected += 1;
        this.update_key_gui();
        maze_solver.update(this.array);
      }
    }
  }
};

Level.prototype.fall_trap_collision = function(player, select_tool) {
  /* fall trap collision */

  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof FallTrap === true) {
      if (completely_overlapping(player, this.array[i]) === true) {

        // initial values for the players new spawn
        var x = this.array[i].x;
        var y = this.array[i].y;

        this.switch_layer(this.current_layer-1);
        pos = this.determine_valid_spawn(x, y);
        this.move_spawn_point(pos.x, pos.y)
        player.spawn(this);

        select_tool.deactivate();
        maze_solver.update(this.array);
        this.enemy_startup();
        return;

      }
    }
  }
};

Level.prototype.time_trap_collision = function(player) {
  /* time trap collision */
  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof TimeTrap === true) {
      if (this.array[i].activated === false) {
        if (overlapping(player, this.array[i]) === true) {
          
          if (player.wind_back) {
            player.wind_back_positions = player.wind_back_positions.reverse();
          }

          this.array[i].activated = true;
          player.start_wind_back();
          return;
        }
      }
    }
  }
};


Level.prototype.ladder_collision = function (player) {
  /* Check if a player is on a ladder and move them to a different layer */
  var on_ladder = false;
  var ladder_id = 0;
  var ladder_index = 0;
  var ladder_layer = 0;
  
  for (var i=0; i<this.array.length; i++) {
    if (this.array[i] instanceof Ladder === true) {
      if (overlapping(this.array[i], player) === true) {
        
        on_ladder = true;
        ladder_id = this.array[i].id;
        ladder_index = i;
        ladder_layer = this.array[i].layer;
        break;
        
      }    
    }
  }
  
  if (on_ladder === true) { // if the player is on a ladder find the corresponding ladder on another layer
    for (var l = 0; l<this.layers.length; l++) {
      if (l != ladder_layer) {
        for (var i = 0; i<this.layers[l].length; i++) {
          if (this.layers[l][i] instanceof Ladder) {
            if (this.layers[l][i].id === ladder_id) {
              // switch layer
              this.switch_layer(l);

              // update player position
              player.x = this.layers[l][i].x;
              player.y = this.layers[l][i].y;

              this.move_spawn_point(this.layers[l][i].x, this.layers[l][i].y, l);
              
              player.spawn(this);

              maze_solver.update(this.array);
              this.enemy_startup();
              return;
            }
          }
        }
      }
    }
  }
};

Level.prototype.update_walls_all_layers = function() {
  for (var i = 0; i < this.layers.length; i++) {
    for (var j = 0; j < this.layers[i].length; j++) {
      if (this.layers[i][j] instanceof Wall) {
        this.layers[i][j].update(this.layers[i]);
      }
    }
  }
};
Level.prototype.update_walls = function() {
  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof Wall) {
      this.array[i].update(this.array);
    }
  }
}

Level.prototype.enemy_startup = function() {
  /* Enemies pick */
  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof Enemy) {
      this.array[i].pick(this.array);
    }
  }
};

Level.prototype.enemy_collision = function(player, maze_solver) {
  /* Check if the enemy has hit the player */
  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof Enemy) {

      this.array[i].move(this.array);

      if (overlapping(player, this.array[i]) === true) {
        player.respawn(this);
      }
    }
  }
};

Level.prototype.chasing_enemy_collision = function(player, maze_solver) {
  /* Check if the enemy has hit the player */
  for (var i = 0; i < this.array.length; i++) {
    if (this.array[i] instanceof ChaseEnemy) {
      this.array[i].move(player, this);
    }
  }
};

Level.prototype.move_spawn_point = function(x, y) {
  for (var i = 0; i<this.array.length; i++) {
    if (this.array[i] instanceof SpawnPoint === true) {
      // move x and y
      this.array[i].x = x;
      this.array[i].y = y;
    }
  }
};

Level.prototype.move_player_to_spawn = function(player) {
  /* Move the player to the spawn point */
  for (var i = 0; i<this.array.length; i++) {
    if (this.array[i] instanceof SpawnPoint === true) {
      player.x = this.array[i].x;
      player.y = this.array[i].y;
    }
  }
};

Level.prototype.determine_valid_spawn = function(x, y) {
  /* make sure the spawn point is not in a solid object by moving it randomly from an invalid position */
  var collision = true;
  while (collision === true) {
    collision = false;
    
    for (var j = 0; j<this.array.length; j++) {
      if (this.array[j].solid === true && this.array[j].x === x && this.array[j].y === y) {
        collision = true;

        // randomly chose a new position
        x += grid_size * Math.round((Math.random()*2) - 1); 
        y += grid_size * Math.round((Math.random()*2) - 1);    

        // if the new position is off the canvas move it back onto the canvas
        if (x < 0) {x = 0;}
        else if (x >= canvas.width) {x = canvas.width - grid_size;}

        if (y < 0) {y = 0;}
        else if (y >= canvas.height) {y = canvas.height - grid_size;}      }
    }   
  }

  return {'x': x, 'y': y};
};

Level.prototype.exit_collision = function (player) {
  /* Move the player to the spawn point */
  if (this.keys_collected === this.keys_required) {
    for (var i = 0; i < this.array.length; i++) {
      if (this.array[i] instanceof Exit) {
        if (overlapping(player, this.array[i])) {
          stop_game();
        }
      }
    }
  }
};