game = function(player, level, select_tool, maze_solver) {
  /* The game loop */
  player.move(level);
  level.key_collision(player);
  level.enemy_collision(player, maze_solver);
  level.chasing_enemy_collision(player);
  level.fall_trap_collision(player, select_tool);
  level.time_trap_collision(player);
  draw();
};

draw = function() {
  /* Function to draw everything */
  clear_canvas();
  level.draw();
  select_tool.draw(player, level);
  player.draw();
  draw_grid_overlay(grid_size);
  maze_solver.draw();
};

new_game = function(difficulty) {
  /* Create a new game */
  game_on = true;
  clearInterval(game_loop);

  window.addEventListener('keydown', this.key_down, false);
  window.addEventListener('keyup', this.key_up, false);
  window.addEventListener('mousemove', this.mouse_movement, false);
  window.addEventListener('mousedown', this.mouse_down, false);
  window.addEventListener('mouseup', this.mouse_up, false);

  start_music(difficulty);
  reset_gui();

  level = new Level(new LevelGenerator(tiles_x, tiles_y, difficulty).create());
  level.update_walls_all_layers();

  player = new Player(0, 0, 24, 26, 4, 0.6);
  player.spawn(level);
  select_tool = new SelectTool();
  maze_solver = new MazeSolver(tiles_x, tiles_y, level.array);
  level.enemy_startup();

  game_loop = setInterval(game, 17, player, level, select_tool, maze_solver);
  stop(timer_loop);
  timer_loop = setInterval(count, 1000);
};

stop_game = function() {
  /* Stop the game */
  if (game_on) {
    game_on = false;
    
    play_sound(victory_sound);
    music.pause();

    window.removeEventListener('keydown', this.key_down, false);
    window.removeEventListener('keyup', this.key_up, false);
    window.removeEventListener('mousemove', this.mouse_movement, false);
    window.removeEventListener('mousedown', this.mouse_down, false);
    window.removeEventListener('mouseup', this.mouse_up, false); 

    reset_gui();
    update_level_complete_modal();
    $(document).ready(function(){ // some jquery to show the level complete animation
      $("#level-complete-modal").modal('show');
    });

    clearInterval(game_loop);
    stop(timer_loop);
    clear_canvas();
    draw_start_image();
  }
};