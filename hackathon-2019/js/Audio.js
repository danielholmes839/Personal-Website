/* Variables for music */
var music = new Audio();
music.loop = true;
music.volume = 0.50;

var music_volume_slider = document.getElementById("music-volume-slider");

function start_music(song) {
	music.src = 'audio/music/' + song + '.wav';
	music.play();
	music.currentTime = 0;
}

function update_music_volume() {
	music.volume = music_volume_slider.value/100;
  	

};

var player_death = new Audio();
player_death.src = 'audio/death.wav';
player_death.volume = 0.5;

var key_pickup = new Audio();
key_pickup.src = 'audio/key-pickup.wav';
key_pickup.volume = 0.5;

var rewind_ticking = new Audio();
rewind_ticking.src = 'audio/rewind.wav';
rewind_ticking.volume = 0.5;

var lock_sound = new Audio();
lock_sound.src = 'audio/lock.wav';
lock_sound.volume = 0.5;

var victory_sound = new Audio();
victory_sound.src = 'audio/victory.wav';
victory_sound.volume = 0.5;

var switch_layer_sound = new Audio();
switch_layer_sound.src = 'audio/switch-layer.wav';
switch_layer_sound.volume = 0.5;


var sound_volume_slider = document.getElementById("sound-volume-slider");
var sounds = [player_death, key_pickup, rewind_ticking, lock_sound, switch_layer_sound, victory_sound];

function play_sound(audio) {
	var new_audio = audio.cloneNode();
	new_audio.volume = audio.volume;
	new_audio.play();
};	

function update_sound_volume() {
	for (var i=0; i<sounds.length; i++) {
		sounds[i].volume = sound_volume_slider.value/100;
	}
};