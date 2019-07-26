function Wall(x, y, width, height) {
  /* class for walls */
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;

  this.img = new Image();
  this.img.src = 'img/walls.png';
  this.c = 0;
  this.r = 0;

  this.solid = true;
  this.moving = false;
  this.collides = false;  // collides with solid objects moved by the selection tool
}

Wall.prototype.update = function(level) {
  /* updates the sprite when rotated */
  this.c = 0;
  this.r = 0;
  
  var deltas = [[0, grid_size], [grid_size,0], [0, -grid_size], [-grid_size, 0]];
  var connections = [false, false, false, false]; // north, east, south, west

  for (var i=0; i<deltas.length; i++) {
    var object = {
      'x': this.x + deltas[i][0],
      'y': this.y + deltas[i][1],
    };

    for (var j=0; j<level.length; j++) {
      if (level[j].solid === true) {
        if (same_position(object, level[j]) === true) {
          connections[i] = true;
          break;
        }
      }
    }
  }

  var n_connections = 0;
  for (i=0; i<connections.length; i++) {
    if (connections[i] === true) {
      n_connections += 1;
    }
  }

  // the part of the sprite sheet to be drawn
  if (n_connections === 4) {
    this.c = 0;
  }

  else if (n_connections === 3) {
    this.c = 1 ;
    if (connections[0] === connections[2]) {  // connected vertically
      if (connections[1] === true) {          // connected on right
        this.r = 0 ;
      }

      else {
        this.r = 2;                           // connected on left
      }
    }

    else {                                    // connected horizontally
      if (connections[2] === true) {          // connected top 
        this.r = 3 ;
      }

      else {
        this.r = 1;
      }
    }
  }

  else if (n_connections === 2) {
    

    if (connections[0] === connections[2]) {                                // straight line
      this.c = 3;
      if (connections[0] === connections[2] && connections[0] === true) {   // vertical line
        this.r = 1;
      }

      else {                                                                // horizontal line
        this.r = 0;
      }
    }

    else {
      this.c = 2;

      if (connections[0] === connections[1]) {  // north and east connections are same
        if (connections[0] === true) {          // north is true
          this.r = 1;                           // there are north and east connections
        }

        else {                                  // north is false
          this.r = 3;                           // there are south and west connections
        }
      }

      else {                                    // north and west are the same
        if (connections[0] === true) {
          this.r = 2;
        }

        else {
          this.r = 0;
        }
      }

     
    }
  }

  else if (n_connections === 1) {
    this.c = 4
    if (connections[0] === true) {
      this.r = 3;
    }

    else if (connections[1] === true) {
      this.r = 2;
    }

    else if (connections[2] === true) {
      this.r = 1;
    }

    else {
      this.r = 0;
    }
  }

  else {
    this.r = 1;
  }

};
  
Wall.prototype.draw = function(normal = true) {
  /* draws a wall */
  if (normal) {
    ctx.drawImage(this.img, this.c * this.w, this.r * this.h, this.w, this.h, this.x, this.y, this.w, this.h);
  }

  else {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
};