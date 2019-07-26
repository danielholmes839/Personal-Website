overlapping = function(obj1, obj2) {
  /*
    A general function that return's true if two objects overlap
    objects must have an x, y, w, h attribute (2 rectangular objects)
  */
  if (obj1.x + obj1.w > obj2.x && obj1.x < obj2.x + obj2.w && obj1.y + obj1.h > obj2.y && obj1.y < obj2.y + obj2.h) {
    return true;
  }
  return false; 
};
  
completely_overlapping = function(obj1, obj2) {
  /*
    A general function that return's true if object 1 is COMPLETELY within object 2
    objects must have an x, y, w, h attribute (2 rectangular objects)
  */
  if (obj2.x <= obj1.x && obj2.y <= obj1.y && obj2.x + obj2.w >= obj1.x + obj1.w && obj2.y + obj2.h >= obj1.y + obj1.h) {
    return true;
  }
  return false;
};

collide_level_boundary_x = function(obj) {
  /* keep an object within the canvas */
  if (obj.x < 0) {
    obj.x = 0;
    return true;
  }

  else if (obj.x + obj.w > canvas.width) {
    obj.x = canvas.width - obj.w;
    return true;
  }

  return false;
};

collide_level_boundary_y = function(obj) {
  /* keep the object within the canvas */
  if (obj.y < 0) {
    obj.y = 0;
    return true;
  }
  
  else if (obj.y + obj.h > canvas.height) {
    obj.y = canvas.height - obj.h;
    return true;
  }

  return false;
};

same_position = function (obj1, obj2) {
  if (obj1.x === obj2.x && obj1.y === obj2.y) {
    return true;
  }

  return false;
};

point_is_inside = function (x, y, obj) {
  return obj.x < x && obj.x + obj.w > x && obj.y < y && obj.y + obj.h > y;
}