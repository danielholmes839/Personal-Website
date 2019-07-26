function Node(x, y) {
  /* a "Node" for generating mazes with recursive backtracking */

  this.x = x;                             // position
  this.y = y; 
  this.visited = false;                   // has the algorithm visited the node
  this.visit_number = 0;                  // what order was it in visited
  this.connections = [];                  // array of x and y values that the node is connect to
}

function MazeGenerator(iw, ih) {
  /* 
    a class for generating mazes using recursive back tracking 
    iw and ih are the final width and height of the the final maze as an array of integers - must be odd
  */
  
  if (iw % 2 === 0) {                     // adjust final maze dimensions to be odd
    iw -= 1;
  }

  else if (ih % 2 === 0) {
    ih -= 1;
  }

  this.w = (iw+1)/2;                      // maze will be scaled back up later when it is turned into ones and zeroes
  this.h = (ih+1)/2;                      // w and h will be the dimensions of the nodes
  
  this.grid = [];                         // store nodes
  this.visits_made = 0;                   // number of nodes visited
}
  
MazeGenerator.prototype.create_grid = function() {
  /* creates a grid of nodes */
  this.grid = [];
  
  for (var y = 0; y<this.h; y++) {
    this.grid.push([]);
    for (var x = 0; x<this.w; x++) {
      this.grid[y].push(new Node(x, y));  // make nodes at each x and y value
    }
  }

};
  
MazeGenerator.prototype.set_start = function(x, y) {
  /* sets the starting position of the maze */
  this.grid[y][x].visited = true;
  this.visits_made += 1;
  this.grid[y][x].visit_number = this.visits_made;
};

MazeGenerator.prototype.is_valid = function(x, y) {
  /* determine if a position (that refers to a node) can be moved to */
  if (x >= 0 && x < this.w && y >= 0 && y < this.h) {   // on the grid
    if (this.grid[y][x].visited === false) {              // not visited
      return true;
    }
  }
  return false;
};


MazeGenerator.prototype.get_options = function(x, y) {
  /* returns the options that a node can join to based on its x and y position */
  var options = [];
  
  if (this.is_valid(x+1, y)) {options.push([x+1, y]);}
  if (this.is_valid(x-1, y)) {options.push([x-1, y]);}
  if (this.is_valid(x, y+1)) {options.push([x, y+1]);}
  if (this.is_valid(x, y-1)) {options.push([x, y-1]);}
  
  return options;
};

MazeGenerator.prototype.connect = function(n1, n2) {
  /* 
    creates a connection between two nodes 
    n1 and n2 are arrays with an x and y ex: [x, y]
  */
  this.grid[n1[1]][n1[0]].connections.push(n2);
  this.grid[n2[1]][n2[0]].connections.push(n1);
};

MazeGenerator.prototype.backtrack = function() {
  /* looks for the x any y of the most recently visited node that is not a dead end */

  var bx = 0;         // position of the tile that will be backtracked to
  var by = 0;
  var backtrack = 0;  // keeps track of the order visited of the most recently visited tile that can be backtracked to
  
  for (var y = 0; y<this.h; y++) {
    for (var x = 0; x<this.w; x++) {
      if (this.grid[y][x].visited === true) { // grid has been visited
        if (this.get_options(x, y).length > 0) { // has options
          if (this.grid[y][x].visit_number > backtrack) { // more recently visited than last found
            bx = x;
            by = y;
            backtrack = this.grid[y][x].visit_number;
          }
        }
      }
    }
  }
  
  return {x: bx, y:by};
};

MazeGenerator.prototype.create = function(x, y) {
  /* Creates the maze */
  this.create_grid();                   // creates the grid of nodes
  this.set_start(x, y);                 // sets the starting point of the maze honestly doesn't matter too much where
  
  var visits_required = this.w*this.h;  // number of visits required to "fill" the maze

  while (this.visits_made != visits_required) {
    var options = this.get_options(x, y);
    
    if (options.length > 0) {
      // pick an option and connect the nodes
      var choice = options[Math.floor((Math.random() * options.length))];
      this.connect([x,y], choice);
      
      // new x and y that will be looked at
      x = choice[0];
      y = choice[1];
      
      // increase visits made and set the node to visited 
      this.grid[y][x].visited = true;
      this.visits_made += 1;
      this.grid[y][x].visit_number = this.visits_made;
    }
    
    else {
      // back track to a position with options that has been visited
      var pos = this.backtrack();
      x = pos.x;
      y = pos.y;
    }
  }
};

MazeGenerator.prototype.int = function(x, y) {
  /* converts nodes to an integer array of ones for walls and zeros for path */
  
  var a = [];             // array of integer
  var iw = (this.w*2)-1;  // width of integer array
  var iy = (this.h*2)-1;  // height of integer array
  
  // fill the array with ones for walls
  for (var y = 0; y<iy; y++) {
    a.push([]);
    for (var x = 0; x<iw; x++) {
      a[y].push(1);
    }
  }
  
  // place zeros on the array based on nodes
  for (var y = 0; y<this.h; y++) {
    for (var x = 0; x<this.w; x++) {
      var node = this.grid[y][x]; 
      var xn = node.x*2;    // where the node is on the integer array
      var yn = node.y*2;
      
      a[yn][xn] = 0;        // set the location of the node to 0 
      
      for (var c = 0; c < node.connections.length; c++) { // for every connection the node has 
        var cdx = node.connections[c][0] - node.x;    // direction of the connections
        var cdy = node.connections[c][1] - node.y;
        
        a[yn + cdy][xn + cdx] = 0;                    // place a 0 where the connection is
      } 
    }
  }
  
  return a;
};