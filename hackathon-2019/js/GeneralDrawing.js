draw_grid_overlay = function(grid_size) {
  /* Draws a gride overlay with a modifiable grid size */
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  repeat_x = Math.floor(canvas.width / grid_size)+1;
  repeat_y = Math.floor(canvas.height / grid_size)+1;
  
  for (var xl = 0; xl<repeat_x; xl++) {
    for (var yl = 0; yl<repeat_y; yl++) {
      
      var x = xl*grid_size;
      var y = yl*grid_size;
      
      ctx.strokeRect(x, y, grid_size, grid_size);
    }
  }
};
  
clear_canvas = function() {
  /* Clears the canvas */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};


var start_image = new Image();
start_image.src = 'img/start.png';

draw_start_image = function() {
  ctx.drawImage(start_image, 0, 0);
};