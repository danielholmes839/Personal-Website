var grid_size = 32;
var tiles_x = 31; // MUST BE ODD
var tiles_y = 17; // MUST BE ODD
var canvas = document.getElementById('game');
canvas.width = tiles_x * grid_size;
canvas.height = tiles_y * grid_size;

var ctx = canvas.getContext('2d');
var game_on = false;

var level, player, select_tool, game_loop, timer_loop, maze_solver; // variables for the game