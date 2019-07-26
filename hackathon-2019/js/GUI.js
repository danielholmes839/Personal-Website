update_level_complete_modal = function() {
  /* updates the text shown when the level is complete */
  var pdeaths = document.getElementById('deaths-c');
  var pkeys = document.getElementById('keys-c');
  var ptime = document.getElementById('time-c');

  pdeaths.innerHTML = player.deaths;
  pkeys.innerHTML = '' + level.keys_collected + '/' + level.keys_required;
  ptime.innerHTML = format();
};

modalTransition = function() {
  /* specifically for going from the level complete to new game modal */
  $(document).ready(function(){
    $("#level-complete-modal").modal('hide');
    $("#new-game-modal").modal('show');
  });
};
  
reset_gui = function() {
  /* resets the gui above the canvas */
  var gdeaths = document.getElementById('deaths-g');
  var gkeys = document.getElementById('keys-g');
  var gtime = document.getElementById('time-g');
  var glayer = document.getElementById('layer-g');

  gdeaths.innerHTML = '0';
  gkeys.innerHTML = '0/0';
  gtime.innerHTML = '00:00';
  glayer.innerHTML = '0/0';
};