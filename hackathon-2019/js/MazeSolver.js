function SolvingNode(x, y, type, index) {
  /* node for solving the maze */
  this.x = x;
  this.y = y;

  this.type = type;
  this.priority = false;
  this.determine_priority();

  this.index = index;             // index in maze solver nodes list
  this.visited = false;           // has been visited by breadth first search

  this.connections = [];          // connections as coordinates on canvas
  this.connection_indexes = [];   // indexes of nodes in the maze sovler's list of nodes
}

SolvingNode.prototype.determine_priority = function() {
  if (this.type === 3 || this.type === 4) {     // exit or ladder 
    this.priority = 0;                          // very important
  }

  else if (this.type === 5) {                   // keys
    this.priority = 1;                          // important
  }

  else if (this.type === 6) {                   // collected keys
    this.priority = 2;                          // not important
  }
}

SolvingNode.prototype.draw = function() {
  /* draw the node*/
  ctx.fillStyle = 'rgb(59, 203, 78)';
  ctx.fillRect(this.x, this.y, 7, 7);           // draw a rectangle representing the location of the node

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgb(59, 203, 78)';

  for (var c=0; c<this.connections.length; c++) {   // draw connections as black lines
    var x1 = this.x + 3;
    var y1 = this.y + 3;

    var x2 = this.connections[c][0] + 3;
    var y2 = this.connections[c][1] + 3;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.font = "12px Arial";                          // write the index of the node
  ctx.fillStyle = 'rgb(59, 203, 78)';
  ctx.fillText(""+this.index, this.x+5, this.y+15);
};

function MazeSolver(w, h, objects) {
  /* 
    class for solving mazes using breadth first search (bfs)
    
    determines the path with the least nodes (not necessarilly least distance)
    this is fine considering there is normally only one solution to get to any particular node
    if the player edits the maze there can be more than one solution. this will only find the one with the least number of nodes
    also normally if the player edits the maze it will lead to a shorter solution by number of nodes as well as distance so it works itself out

    references:
    
    1. https://www.youtube.com/watch?v=pcKY4hjDrxk - 5.1 Graph Traversals - BFS & DFS -Breadth First Search and Depth First Search
    2. https://www.youtube.com/watch?v=rop0W4QDOUI - Maze Solving - Computerphile
    3. https://www.youtube.com/watch?v=oDqjPvD54Ss - Breadth First Search Algorithm | Graph Theory

  */

  this.w = w;
  this.h = h;
  
  this.nodes;             // list of nodes which represent the maze as a graph 
  this.array;             // 2d array representing the layer 
  this.queue;
  this.previous;

  this.create_array();
  this.add_objects(objects);
  this.create_nodes();
  this.connect_nodes();
  this.bfs();

  this.show_nodes = false;
  this.show_solutions = false;
}

MazeSolver.prototype.update = function(objects) {
  /* 
    solve a new maze - repeat of constructor
    I wrote this so that I wouldn't be creating a new instance
    to solve a new maze. Because that would reset the flags for whether
    or not the solution or nodes should be drawn.
  */

  this.create_array();
  this.add_objects(objects);
  this.create_nodes();
  this.connect_nodes();
  this.bfs(); // solves the maze
};

MazeSolver.prototype.toggle_show_nodes = function() {
  /* toggles if nodes are being drawn */
  this.show_nodes = !this.show_nodes;
};

MazeSolver.prototype.toggle_show_solutions = function() {
  /* toggles if the solution is being drawn */
  this.show_solutions = !this.show_solutions;
};

MazeSolver.prototype.create_array = function() {
  /* create a 2d array of zeroes */
  this.array = [];
  for (var y = 0; y<this.h; y++) {
    this.array.push([]);
    for (var x = 0; x<this.w; x++) {
      this.array[y].push(0);
    }
  }
};

MazeSolver.prototype.add_objects = function(objects) {
  /* adds numbers other than 0 to the array to represent objects */

  for (var i = 0; i<objects.length; i++) {
    if (objects[i].moving === false) {
      var x = Math.floor(objects[i].x/grid_size); // Math.floor is for safety but in theory the division should always give an integer
      var y = Math.floor(objects[i].y/grid_size);

      if (this.array[y][x] !== 2) {               // DO NOT WRITE OVER THE SPAWN POINT
        if (objects[i].solid === true) {
          this.array[y][x] = 1;
        }

        else if (objects[i] instanceof SpawnPoint) {
          this.array[y][x] = 2;
        }

        else if (objects[i] instanceof Exit) {
          this.array[y][x] = 3;
        }

        else if (objects[i] instanceof Ladder) {
          this.array[y][x] = 4;
        }

        else if (objects[i] instanceof Key) {
          if (objects[i].collected === false) {
            this.array[y][x] = 5;
          }

          else {
            this.array[y][x] = 6;
          }
        }
      }
    }
  } 
};

MazeSolver.prototype.is_valid = function (x, y) {
  /* if a tile should have a node on it */
  if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
    if (this.array[y][x] !== 1) {
      return true;
    }
  }
  return false;
};

MazeSolver.prototype.get_options = function (x, y) {
  /* get the options of a specific tile */
  var options = [];

  if (this.is_valid(x+1, y)) {
    options.push([x+1, y]);
  }

  if (this.is_valid(x-1, y)) {
    options.push([x-1, y]);
  }

  if (this.is_valid(x, y+1)) {
    options.push([x, y+1]);
  }

  if (this.is_valid(x, y-1)) {
    options.push([x, y-1]);
  }

  return options;
};


MazeSolver.prototype.requires_node = function(options, n) {
  /* determine whether or not a title requires a node */

  if (n > 1) {                    // special tile
    return true;
  }

  else if (n === 0) {

    if (options.length !== 2) {   // dead end or junction
      return true;
    }

    else {                        // 2 options and changes direction
      if ((options[0][0] !== options[1][0]) && (options[0][1] !== options[1][1])) {
        return true;
      }
    }
  }

  return false;
}

MazeSolver.prototype.create_nodes = function() {
  /* create the nodes used to solve the maze */
  this.nodes = [];
  var node_counter = 0;

  for (var y = 0; y<this.h; y++) {
    for (var x = 0; x<this.w; x++) {

      var options = this.get_options(x, y);
      if (this.requires_node(options, this.array[y][x])) {

        var node = new SolvingNode(x*grid_size, y*grid_size, this.array[y][x], node_counter);
        node_counter += 1;

        this.nodes.push(node);
        this.array[y][x] = node; 
      }
    }
  }
};

MazeSolver.prototype.connect_node = function(x, y, n) {
  /* connects a node to its neighbours */

  // nodes to the right
  for (var i = x+1; i<this.w; i++) {
    if (this.array[y][i] instanceof SolvingNode) {
      this.nodes[n].connections.push([i*grid_size, y*grid_size]);
      this.nodes[n].connection_indexes.push(this.array[y][i].index);
      break;
    }

    else if (this.array[y][i] === 1) {
      break;
    }
  }

  // nodes below
  for (var i = y+1; i<this.h; i++) {
    if (this.array[i][x] instanceof SolvingNode) {
      this.nodes[n].connections.push([x*grid_size, i*grid_size]);
      this.nodes[n].connection_indexes.push(this.array[i][x].index);
      break;
    }

    else if (this.array[i][x] === 1) {
      break;
    }
  }

  // nodes to the left
  for (var i = x-1; i>=0; i--) {
    if (this.array[y][i] instanceof SolvingNode) {
      this.nodes[n].connections.push([i*grid_size, y*grid_size]);
      this.nodes[n].connection_indexes.push(this.array[y][i].index);
      break;
    }

    else if (this.array[y][i] === 1) {
      break;
    }
  }

  // nodes above
  for (var i = y-1; i>=0; i--) {
    if (this.array[i][x] instanceof SolvingNode) {
      this.nodes[n].connections.push([x*grid_size, i*grid_size]);
      this.nodes[n].connection_indexes.push(this.array[i][x].index);
      break;
    }

    else if (this.array[i][x] === 1) {
      break;
    }
  }
};

MazeSolver.prototype.connect_nodes = function() {
  /* connects all nodes together */
  var node_counter = 0;

  for (var y = 0; y<this.h; y++) {
    for (var x = 0; x<this.w; x++) {
      if (this.array[y][x] instanceof SolvingNode) {
        this.connect_node(x, y, node_counter);
        node_counter += 1;
      }
    }
  }
};

MazeSolver.prototype.get_start = function() {
  /* find the starting tile for the search */
  var start;
  for (var i=0; i<this.nodes.length; i++) {
    if (this.nodes[i].type === 2) {
      start = i;
      break
    }
  }

  return start;
};

MazeSolver.prototype.get_important_nodes = function() {
  /* get a list of important nodes which a path will be made to */
  important_nodes = [];

  for (var i=0; i<this.nodes.length; i++) {
    if (this.nodes[i].type !== 0 && this.nodes[i].type !== 2) { // not a normal node or spawn point
      important_nodes.push(i);
    }
  }

  return important_nodes;
};

MazeSolver.prototype.create_bfs_queue = function() {
  /* 
    breadth first search (bfs)
    returns a list representing the bfs queue
    returns another list representing the connection to the nodes in the bfs - not to sure how to explain it

    example graph:

    1-2-3
      \
      4
      \
      5

    bfs: 1, 2, 4, 3, 5
    previous_nodes: false, 1, 2, 2, 4
  */

  var visits_made = 0;                      // keep track of the number of visits made 
  var visits_required = this.nodes.length;  // total number of visits required

  this.queue = [];                          // order nodes were explored 
  var qn = 0;                               // node to explore in the queue
  this.previous = [false];                  // previous node for nodes in the queue
  
  var start = this.get_start();             // starting point for the search
  this.nodes[start].visited = true;             
  visits_made += 1;
  this.queue.push(this.nodes[start].index); // add the starting point to the queue

  while (visits_made < visits_required) {   // create the bfs list containing the order each node was visited
    var node = this.nodes[this.queue[qn]];  // node being explored

    if (node !== undefined) {
      for (var i=0; i<node.connections.length; i++) {                         // explore all of the nodes connections
        if (this.nodes[node.connection_indexes[i]].visited === false) {   // if they are not already visited

          this.queue.push(node.connection_indexes[i]);                    // add the connections to the queue        
          this.previous.push(node.index);                                 // add the original node to the previously visited nodes list
          this.nodes[node.connection_indexes[i]].visited = true;          // set the connection to visited
          visits_made += 1;                                               // add one to the number of connections made

        }
      }
      qn += 1;
    }

    else {
      break; // if the node is undefined that means the search should stop because it hit a dead end before visiting all nodes
    }
  }
};

MazeSolver.prototype.bfs = function() {
  /* entire solve of the maze */
  this.create_bfs_queue();
  var important_nodes = this.get_important_nodes();

  this.paths = [];
  for (var i=0; i<important_nodes.length; i++) {
    this.paths.push(this.solve_path(important_nodes[i]));
  }
  
  this.create_lines();
  this.remove_lines();
};

MazeSolver.prototype.solve_path = function(find) {
  /* solve the path to node n by using this .queue and .previous */
  var path_object = {
    'priority': this.nodes[find].priority,
    'path': [],
  };

  for (var j=this.queue.length-1; j>=0; j--) {
    if (this.queue[j] === find) {
      find = this.previous[j];
      path_object.path.unshift(this.queue[j]);
    }
  }

  return path_object;
}

MazeSolver.prototype.create_lines = function() {
  /* turn paths into lines */

  this.lines = [];                                      // 3 groups of lines for the different priorities
  var off_set = grid_size/2;

  for (var i = 0; i<this.paths.length; i++) {               // path object
    for (var j = 0; j<this.paths[i].path.length-1; j++) {   // path objects node number

      var node1 = this.nodes[this.paths[i].path[j]];
      var node2 = this.nodes[this.paths[i].path[j+1]];

      line = {
        'x1': node1.x + off_set,
        'y1': node1.y + off_set,
        'x2': node2.x + off_set,
        'y2': node2.y + off_set,
        'priority': this.paths[i].priority
      };

      this.lines.push(line);
    }
  }
};

MazeSolver.prototype.remove_lines = function() {
  /* removes duplicate lines */
  var new_lines = [];

  for (var i=0; i<this.lines.length; i++) {
    var line1 = this.lines[i];              // try to add to new lines
    var add = true;

    for (var j=0; j<new_lines.length; j++) {    // go through the new lines
      var line2 = new_lines[j];             // check is a duplicate

      if (line1.x1 === line2.x1 && line1.x2 === line2.x2 && line1.y1 === line2.y1 && line1.y2 === line2.y2) { // if there's a line that is copy
        add = false
        
        if (line1.priority === line2.priority) {                                                              // check if it's a better priority
          break;
        }

        else if (line1.priority < line2.priority) {
          new_lines[j] = line1; // find a higher priority line replace the lower priority line
        }        
      }
    }

    if (add === true) {
      new_lines.push(line1);
    }
  }

  this.lines = new_lines;
};

MazeSolver.prototype.draw = function() {
  /* draw nodes and solutions */

  if (this.show_solutions === true) {       // solution
    ctx.lineWidth = 3;
    for (var i=0; i<this.lines.length; i++) {this.draw_line(this.lines[i]);}
  }

  if (this.show_nodes === true) {           // nodes
    for (var i = 0; i<this.nodes.length; i++) {this.nodes[i].draw();}
  }
};

MazeSolver.prototype.draw_line = function(line) {
  /* draws a line */
  if (line.priority === 0) {ctx.strokeStyle = 'rgb(255,0,0)';}
  else if (line.priority === 1) {ctx.strokeStyle = 'rgb(255,255,0)';}
  else {ctx.strokeStyle = 'rgb(0,0,255)';}

  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.closePath();
  ctx.stroke();
};