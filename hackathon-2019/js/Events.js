function key_down(e) {
  /* Checks for key presses */
  var code = e.keyCode;
  switch (code) {
      // player movement
      case 65: player.dirx = -1; player.c = 0; break;
      case 87: player.diry = -1; player.c = 3; break;
      case 68: player.dirx = 1; player.c = 2; break;
      case 83: player.diry = 1; player.c = 1; break;
      case 82: if (select_tool.locked) {select_tool.rotate_all();} break;   // cw rotation 90 degrees
      case 70: if (select_tool.locked) {select_tool.flip_all(true);} break; // flip over a horizontal line
      case 67: if (select_tool.locked) {select_tool.flip_all(false);} break;// flip over a vertical line
      case 69: // E deactivates the select tool and checks if the player is moving between levels
        if (select_tool.locked) {
          select_tool.deactivate();
        } 

        level.ladder_collision(player);  
        level.exit_collision(player);
        break;
  }
}

function key_up(e) {
  /* Stops player movement if they let of the key that goes with the direction */
  var code = e.keyCode;
  switch (code) {
    case 65: if (player.dirx === -1) {player.dirx = 0;} break;
    case 87: if (player.diry === -1) {player.diry = 0;} break;
    case 68: if (player.dirx === 1) {player.dirx = 0;} break;
    case 83: if (player.diry === 1) {player.diry = 0;} break;
  }
}
  
function get_mouse_pos(e) {
  /*
    Gets the actual position of the mouse on the canvas taken from stackoverflow:
    https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
  */
  var rect = canvas.getBoundingClientRect();  // abs. size of element
  var scaleX = canvas.width / rect.width;     // relationship bitmap vs. element for X
  var scaleY = canvas.height / rect.height;   // relationship bitmap vs. element for Y

  return {
    x: (e.clientX - rect.left) * scaleX,      // scale mouse coordinates after they have
    y: (e.clientY - rect.top) * scaleY        // been adjusted to be relative to element
  };
}
  
function on_canvas(pos) {
  /* check if a position of x and y is on the canvas */
  if (pos.x >= 0 && pos.x <= canvas.width && pos.y >= 0 && pos.y <= canvas.height) {
    return true;
  }
  return false;
}
  
function mouse_movement(e) {
  /* moving the mouse adjusts the select tool dimensions */
  var pos = get_mouse_pos(e);
  select_tool.while_active(pos);
}
  
function mouse_down(e) {
  /* mouse clicks */
  var pos = get_mouse_pos(e);
  if (e.which === 1) {                                                      // left clicks

    if (select_tool.active === false && on_canvas(pos) === true) {          // start the select tool
      select_tool.activate(pos);
    }
    
    else {                                                                  // apply transformations from the select tool
      select_tool.apply_transformations(player, level);
      maze_solver.update(level.array);
      select_tool.deactivate();
    }
  }
}
  
function mouse_up(e) {
  /* mouse is released */
  var pos = get_mouse_pos(e);
  if (e.which === 1) {                                                      // lock the select tool in place
    if (select_tool.locked === false && select_tool.active === true) {
      select_tool.lock(level);
    }
  }
}

window.onload = function() {
  draw_start_image();
}