function LevelGenerator(width_tiles, height_tiles, difficulty) {
  /* Class for generating levels */
  this.wt = width_tiles;
  this.ht = height_tiles;

  this.layers = [];
  this.difficulty = difficulty;
  this.config;

  if (this.difficulty === 0) { // pl is "per layer"
    this.config = {
      'name': 'Easy',
      'n_layers': 1,
      'enemies_pl': {'min': 1, 'max': 2},
      'chasing_enemies_pl': {'min': 1, 'max': 1},
      'keys_pl': {'min': 1, 'max': 2},
      'fall_traps_pl': {'min': 0, 'max': 0},
      'time_traps_pl': {'min': 0, 'max': 5},
    };
  }

  else if (this.difficulty === 1) {
    this.config = {
      'name': 'Medium',
      'n_layers': 2,
      'enemies_pl': {'min': 3, 'max': 5},
      'chasing_enemies_pl': {'min': 1, 'max': 2},
      'keys_pl': {'min': 2, 'max': 4},
      'fall_traps_pl': {'min': 5, 'max': 10},
      'time_traps_pl': {'min': 5, 'max': 10},
    };
  }

  else if (this.difficulty === 2) {
    this.config = {
      'name': 'Hard',
      'n_layers': 3,
      'enemies_pl': {'min': 5, 'max': 10},
      'chasing_enemies_pl': {'min': 2, 'max': 3},
      'keys_pl': {'min': 4, 'max': 7},
      'fall_traps_pl': {'min': 10, 'max': 15},
      'time_traps_pl': {'min': 10, 'max': 15},
    };
  }
}

LevelGenerator.prototype.place_randomly = function(number, layer, range) {
  /* 
    places a number on a layer randomly 
    2 represents keys
    > 100 represents ladders
  */
  
  var amount = Math.round(Math.random()*(range.max-range.min)) + range.min;

  for (var j=0; j<amount; j++) {
      var placed = false;

      while (placed === false) {
        var x = Math.floor(Math.random()*this.layers[layer][0].length);
        var y = Math.floor(Math.random()*this.layers[layer].length);
        
        if (this.layers[layer][y][x] === 0) {
          this.layers[layer][y][x] = number;
          placed = true;
        }
      }
    }
};

LevelGenerator.prototype.add_spawn_points = function() {
  /* adds a spawn point to each layer */
  for (var i = 0; i<this.config.n_layers; i++) {
    this.place_randomly(5, i, {'min': 1, 'max':1});
  }
};

LevelGenerator.prototype.add_exit = function() {
  /* adds an exit to the last layer */
  this.place_randomly(6, this.config.n_layers-1, {'min': 1, 'max':1});
};

LevelGenerator.prototype.add_keys = function() {
  /* adds one key to each layer */
  for (var i = 0; i<this.config.n_layers; i++) {
    this.place_randomly(2, i, this.config.keys_pl);
  }
};
  
LevelGenerator.prototype.add_enemies = function() {
  /* adds enemies to each layer */
  for (var i = 0; i<this.config.n_layers; i++) {
    this.place_randomly(3, i, this.config.enemies_pl);
  }

  for (var i = 0; i<this.config.n_layers; i++) {
    this.place_randomly(7, i, this.config.chasing_enemies_pl);
  }
};

LevelGenerator.prototype.add_fall_traps = function() {
  /* adds one key to each layer */
  for (var i = 1; i<this.config.n_layers; i++) {
    this.place_randomly(4, i, this.config.fall_traps_pl);
  }
};

LevelGenerator.prototype.add_time_traps = function() {
  /* adds one key to each layer */
  for (var i = 0; i<this.config.n_layers; i++) {
    this.place_randomly(8, i, this.config.time_traps_pl);
  }
};

LevelGenerator.prototype.add_ladders = function() {
  /*
    adds ladders right now a ladder will connect each layer linearly
    layer 0 -> 1, 1 -> 2 etc
  */
  
  for (var i = 0; i<this.config.n_layers-1; i++) {
    this.place_randomly(101+i, i, {'min': 1, 'max':1});
    this.place_randomly(101+i, i+1, {'min': 1, 'max':1});
  }
};
  

LevelGenerator.prototype.create_objects = function() {
  /* Turns an array of numbers into objects useable by the game */
  var olayers = []; 
  
  for (var l = 0; l < this.config.n_layers; l++) {
    olayers.push([]);
    for (var y = 0; y < this.layers[l].length; y++) {
      for (var  x = 0; x < this.layers[l][y].length; x++) { 
        
        if (this.layers[l][y][x] === 1) {       // Walls
          olayers[l].push(new Wall(x*grid_size, y*grid_size, grid_size, grid_size));
        }
        
        else if (this.layers[l][y][x] === 2) {  // Keys
          olayers[l].push(new Key(x*grid_size, y*grid_size, grid_size, grid_size));
        }
        
        else if (this.layers[l][y][x] === 3) {  // Enemies
          olayers[l].push(new Enemy(x*grid_size, y*grid_size, grid_size, grid_size));
        }
        
        else if (this.layers[l][y][x] === 4) {  // Trap
          olayers[l].push(new FallTrap(x*grid_size, y*grid_size, grid_size, grid_size));
        }

        else if (this.layers[l][y][x] === 5) {  // Trap
          olayers[l].push(new SpawnPoint(x*grid_size, y*grid_size, grid_size, grid_size));
        }

        else if (this.layers[l][y][x] === 6) {  // Trap
          olayers[l].push(new Exit(x*grid_size, y*grid_size, grid_size, grid_size));
        }

        else if (this.layers[l][y][x] === 7) {  // Trap
          olayers[l].push(new ChaseEnemy(x*grid_size, y*grid_size));
        }

        else if (this.layers[l][y][x] === 8) {  // Trap
          olayers[l].push(new TimeTrap(x*grid_size, y*grid_size, grid_size, grid_size, 2));
        }
        
        else if (this.layers[l][y][x] > 100) {  // Ladders
          olayers[l].push(new Ladder(x*grid_size, y*grid_size, grid_size, grid_size, this.layers[l][y][x]-100, l));
        }
      }
    }
  }
  
  return olayers;
};
  
LevelGenerator.prototype.create = function() {
  // create layers as mazes of ones and zeroes
  for (var i = 0; i<this.config.n_layers; i++) {
    var maze = new MazeGenerator(this.wt, this.ht);
    maze.create(0, 0);
    this.layers.push(maze.int());
  }
  
  // add other features to the maze
  this.add_spawn_points();
  this.add_exit();
  this.add_keys();
  this.add_fall_traps();
  this.add_ladders();
  this.add_enemies();
  this.add_time_traps();
  
  // turn .layers into objects and return that
  return this.create_objects();
};
