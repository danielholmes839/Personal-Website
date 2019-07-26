function SelectTool() {
  /*
    Selection tool will be used to perform transformation on the level by
    selecting an area and then applying a transformation.
    For example: rotate, flip, scramble
  */
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;

  this.active = false; // is being used 
  this.locked = false; // position is locked 

  this.w_limit = 5;
  this.h_limit = 5;

  this.selected_objects = [];
  this.selected_indexes = [];
}
  
SelectTool.prototype.draw = function(player, level) {
  /* Draws the area selected as a yellow highlight */
  if (this.active === true) {
    var text_pos = this.get_top_left_point();
    var dimensions = this.get_tile_dimensions();

    var highlight;

    // select tool is locked
    if (this.locked === true) { 
      if (this.objects_collide(player, level) === true) {
        highlight = 'rgba(255, 0, 0, 0.5)';
      }
      else {
        highlight = 'rgba(255, 255, 0, 0.5)';
      }
    }

    // select tool is being moved
    else { 
      if (dimensions.w > this.w_limit || dimensions.h > this.h_limit) {
        highlight = 'rgba(255, 0, 0, 0.5)';
      }

      else {
        highlight = 'rgba(255, 255, 0, 0.5)';
      }
    }

    for (var i = 0; i<this.selected_objects.length; i++) {
      this.selected_objects[i].draw(false);
    } 
    
    ctx.fillStyle = highlight;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    if (this.locked === false) {
      ctx.font = "15px Arial";
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillText(dimensions.w + "x" + dimensions.h, text_pos.x, text_pos.y+15);
    }
  }
};
  
SelectTool.prototype.get_tile_dimensions = function() {
  /* Returns the dimensions of the selected area in tiles */
  pos = this.get_top_left_point();
  var x_actual = pos.x;
  var y_actual = pos.y;

  var x_moved = Math.floor(x_actual/grid_size) * grid_size;
  var y_moved = Math.floor(y_actual/grid_size) * grid_size;

  var w = Math.abs(this.w) + (x_actual - x_moved); 
  var h = Math.abs(this.h) + (y_actual - y_moved);
 
  w = Math.floor(w/grid_size)+1;
  h = Math.floor(h/grid_size)+1;

  return {
    w: w,
    h: h
  };
};
  
SelectTool.prototype.get_top_left_point = function() {
  /* Returns the top left point of the selection area */
  var x = this.x;
  if(this.w < 0) {x += this.w;}
  if(x < 0) {x = 0;}

  var y = this.y;
  if(this.h < 0) {y += this.h;}
  if(y < 0) {y = 0;}

  return {
    x: x,
    y: y
  };
};
  
SelectTool.prototype.activate = function(pos) {
  /* "activates" the select tool */
  this.w = 0;
  this.h = 0;
  this.x = pos.x;
  this.y = pos.y;

  this.active = true;
  this.locked = false;

  this.selected_indexes = [];
  this.selected_objects = [];
};

SelectTool.prototype.deactivate = function() {
  /* deactivates the select tool */
  this.active = false;
  this.locked = false;
};

SelectTool.prototype.lock = function(level) {
  /* locks the select tool in place */
  play_sound(lock_sound);
  this.locked = true;
  this.simplify_position();         // all positive values
  this.fill_grid();                 // fill the grid
  this.confine();                   // grid not exceeding max size
  this.get_selected_objects(level); // get the selected objects
};

SelectTool.prototype.confine = function() {
  dimensions = this.get_tile_dimensions();
  
  if (dimensions.w > this.w_limit) {
    this.w = grid_size * this.w_limit;
  }

  if (dimensions.h > this.h_limit) {
    this.h = grid_size * this.h_limit;
  }
};

SelectTool.prototype.while_active = function(pos) {
  /* 
    triggered when the mouse is moved 
    adjusts the width and height
  */
  if (this.active === true && this.locked === false) {
    this.w = pos.x - this.x;
    this.h = pos.y - this.y;
  }
};
  
SelectTool.prototype.simplify_position = function() {
  /* 
    two parts
    1. make the x and y of the select tool in the top left of the shape and adjust w and h accordingly
    2. make sure the shape is on the screen. The mouse events are triggered even when off screen so 
       an x coordinate could be set at -100 so it needs to be moved to 0 and have its width adjusted.
  */

  // part 1
  if (this.w < 0) {
    this.x += this.w;
    this.w *= -1;
  }

  if (this.h < 0) {
    this.y += this.h;
    this.h *= -1;
  }
  
  // part 2
  var p2x = this.x + this.w;    // create varibles to represent the bottom left point
  var p2y = this.y + this.h;

  if (this.x < 0) {this.x = 0;} // first point
  if (this.y < 0) {this.y = 0;}

  if (p2x > canvas.width) {     // second point
    p2x = canvas.width;
  }

  if (p2y > canvas.height) {
    p2y = canvas.height;
  }

  this.w = p2x - this.x;      // adjust width and height based on the two points
  this.h = p2y - this.y;
};

SelectTool.prototype.fill_grid = function() {
  /* 
    adjust the dimensions so that it fills the grid
    makes it clearer which tiles are selected
  */

  // original x and y
  var x = this.x; 
  var y = this.y;

  // move x and y to fill the grid
  this.x = Math.floor(this.x/grid_size) * grid_size;
  this.y = Math.floor(this.y/grid_size) * grid_size;

  // adjust width and height based on how much the x and y were moved
  this.w += x - this.x;
  this.h += y - this.y;

  // adjust width and height to fill the grid 
  this.w = (Math.floor(this.w/grid_size)+1) * grid_size;
  this.h = (Math.floor(this.h/grid_size)+1) * grid_size;
};

SelectTool.prototype.get_selected_objects = function(level) {
  /* Adds the objects that are selected to a list and adds the corresponding index to another list */
  for (var i = 0; i<level.array.length; i++) {
    if ((overlapping(this, level.array[i]) === true) && (level.array[i].moving === false)) {

      var obj = Object.assign(new level.array[i].constructor(), level.array[i]);
      this.selected_objects.push(obj);
      this.selected_indexes.push(i);

    }
  }
};
  
SelectTool.prototype.objects_collide = function (player, level) {
  /* checks if the moved objects will collide with the player or moving objects part of the level */
  
  // if solid objects collide with the player
  for (var i = 0; i<this.selected_objects.length; i++) {
    if (this.selected_objects[i].solid === true) {
      if (overlapping(this.selected_objects[i], player) === true) {
        return true;
      }
    }
  }
  
  // if moving objects part of the level collide with solid objects 
  for (var i = 0; i<level.array.length; i++) {
    if (level.array[i].collides === true) {   // a moving object

      for (var j = 0; j<this.selected_objects.length; j++) {
        if (this.selected_objects[j].solid === true) {
          if (overlapping(level.array[i], this.selected_objects[j])) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};
  
SelectTool.prototype.rotate_tile = function(tile, cx, cy) {
  /* Rotates anything with an x and y attribute around (cx, cy) */
  tile.x -= cx;
  tile.y -= cy;

  var temp_x = tile.x; 
  tile.x = -tile.y + cx;
  tile.y = temp_x + cy;
};

SelectTool.prototype.rotate_all = function() {
  /* Rotates a selected area. ONLY SQUARES */
  if (this.w === this.h && this.locked === true) {
    
    var cx = this.x + ((this.w-grid_size)/2);
    var cy = this.y + ((this.h-grid_size)/2);
    
    for (var i = 0; i < this.selected_objects.length; i++) {
      this.rotate_tile(this.selected_objects[i], cx, cy);
    } 
  }
};

SelectTool.prototype.flip_tile = function(tile, cx, cy, horizontal) {
  /* flips a tile across a vertical or horizontal line at (cx, cy) */
  if (horizontal) {
    tile.x -= cx;
    tile.x *= -1;
    tile.x += cx;
  }

  else {
    tile.y -= cy;
    tile.y *= -1;
    tile.y += cy;
  }
};
  
SelectTool.prototype.flip_all = function(horizontal) {
  /* flip all selected tiles vertically or horizontally */
  if (this.locked === true) {
    var cx = this.x + ((this.w-grid_size)/2);
    var cy = this.y + ((this.h-grid_size)/2);

    for (var i = 0; i < this.selected_objects.length; i++) {
      this.flip_tile(this.selected_objects[i], cx, cy, horizontal);
    } 
  }
};
  
SelectTool.prototype.apply_transformations = function(player, level) {
  /* changes the objects in the level array to the new objects with transformations applied*/
  if (this.objects_collide(player, level) === false && this.locked === true) {
    for (var i = 0; i<this.selected_indexes.length; i++) {
      level.array[this.selected_indexes[i]].x = this.selected_objects[i].x; // safer to switch x and y instead of whole object
      level.array[this.selected_indexes[i]].y = this.selected_objects[i].y;
    }

    level.update_walls();
  }
};