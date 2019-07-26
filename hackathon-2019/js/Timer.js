var seconds = 0;
var minutes = 0;
var timer = document.getElementById('time-g');

function count() {
  seconds += 1;

  if (seconds >= 60) {
      seconds = 0;
      minutes++;
  }
  
  update();
};

function format() {
  var mstring = ''
  if (minutes < 10) {
    mstring += '0';
  }
  mstring += minutes;

  var sstring = ''
  if (seconds < 10) {
    sstring += '0';
  }
  sstring += seconds;

  return mstring + ':' + sstring;
};

function update() {
  timer.innerHTML = format(); 
};

function stop(loop) {
  clearInterval(loop);
  seconds = 0;
  minutes = 0;
  update();
};