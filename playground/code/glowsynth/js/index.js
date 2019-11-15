window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;

var Particle = function(x, y, intensity) {

	this.x = x + random(-10, 10);
	this.y = y + random(-10, 10);
	this.vx = random(-2.5, 2.5);
	this.vy = random(-5, 5);
	this.radius = (random() > 0.75) ? random(25, 50) : 1 + random(1, 20);
	this.radius *= 1.2;
	this.lifespan = random(25, 50);
	this.charge = this.lifespan;
	this.color = {
		r: round(random(255)),
		g: round(random(75)),
		b: round(random(50))
	};
}

Particle.prototype = {

	update: function() {
		this.charge--;
		this.radius--;
		this.x += this.vx;
		this.y += this.vy;
	},

	draw: function(ctx) {

		var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
		gradient.addColorStop(0, 'rgba(' + this.color.r + ', ' + this.color.g + ', ' + this.color.b + ', ' + this.opacity + ')');
		gradient.addColorStop(0.5, "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", " + this.opacity + ")");
		gradient.addColorStop(1, "rgba(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ", 0)");

		ctx.fillStyle = gradient;
		ctx.beginPath();

		ctx.arc(this.x, this.y, this.radius, 0, TWO_PI, false);
		ctx.fill();
	}
};


var GlowSynth = function(){
	var _this = this;

	this.context = new AudioContext();
	this.envelope = this.context.createGain();
	this.envelope.gain.value = 0.3;
	this.convolver = this.context.createConvolver();

	// this.envelope.connect(this.context.destination);
	this.envelope.connect(this.convolver);
	this.envelope.connect(this.context.destination);
	this.convolverGain = this.context.createGain();
	this.convolverGain.gain.value = .2;
	this.convolver.connect(this.convolverGain);
	this.convolverGain.connect(this.context.destination);

	this.attackTime = 0.01;
	this.releaseTime = 0.9;
	this.maxLoudness = 0.2;

	this.upperLimitNote = 96;
	this.lowerLimitNote = 36;

	this.particles = [];
	this.octave = 0;

	this.mousedown = false;
	this.lastNotePlayed = null;

	this.keyMap = {
		65: 48,
		87: 49,
		83: 50,
		69: 51,
		68: 52,
		70: 53,
		84: 54,
		71: 55,
		89: 56,
		90: 56,
		72: 57,
		85: 58,
		74: 59,
		75: 60,
		79: 61,
		76: 62,
		80: 63,
		59: 64,
		186: 64,
		222: 65,
		221: 66,
		220: 67
    };




	this.noteOn = function(noteNumber, now, velocity, vertCenter) {

		var osc = this.context.createOscillator();

		var adsr = this.context.createGain();

		var loudness = (velocity/127) * this.maxLoudness

		adsr.gain.setValueAtTime(0, now);
		adsr.gain.linearRampToValueAtTime(loudness, now + this.attackTime);
		adsr.gain.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
		osc.frequency.value = this.frequencyFromNoteNumber(noteNumber);

		osc.connect(adsr);
		adsr.connect(this.envelope);

		osc.start(0);
		osc.stop(now + this.attackTime + this.releaseTime);

		if (vertCenter == true){
			this.drawNoteHit(noteNumber, 127/2);
		} else {
			this.drawNoteHit(noteNumber, velocity);
		}

	}


	// A lot of this WebMidi code here is based off Chris Wilson's examples. Thanks Chris! https://github.com/cwilso/monosynth

	this.onMIDISuccess = function(midiAccess) {
	    // when we get a succesful response, run this code
	    _this.midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

	    var inputs = _this.midi.inputs.values();
	    // loop over all available inputs and listen for any MIDI input
	    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
	        // each time there is a midi message call the onMIDIMessage function
	        input.value.onmidimessage = _this.onMIDIMessage;
	    }
	}

	this.onMIDIFailure = function(e) {
	    // when we get a failed response, run this code
	    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
	}

	this.onMIDIMessage = function(message) {
	    data = message.data; // this gives us our [command/channel, note, velocity] data.

	    switch (message.data[0] & 0xf0) {
	    	case 0x90:
	    		if (message.data[2]!=0) {  // if velocity != 0, this is a note-on message
	    			_this.noteOn(message.data[1], _this.context.currentTime, message.data[2], true);
	    			return;
	    		}
		}
	}



	this.init = function(){
		this.requestMIDIAccess();
		 
		// load the impulse response asynchronously
		// Shout out to Open Air impulse response library for the wav file http://www.openairlib.net/
		var request = new XMLHttpRequest();
		request.open("GET", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/20212/carpark_balloon_ir_mono_24bit_44100.wav", true);
		request.responseType = "arraybuffer";

		request.onload = function () {
		 _this.context.decodeAudioData(request.response, function(buffer) {
		    _this.convolver.buffer = buffer;
		 });
		}
		request.send();

		this.setupEventListeners();
	}

	this.setupEventListeners = function(){
		$(window).on("mousedown touchstart", function(e){
			_this.mousedown = true;
			_this.lastNotePlayed = midiNumber;
			var midiNumber = _this.getMidiNumberFromClick(e);
			var velocity = _this.getVelocityFromClick(e);
			_this.noteOn(midiNumber,_this.context.currentTime,velocity);
		});

		$(window).keydown(function(e){
			if (typeof _this.keyMap[e.keyCode] !== "undefined"){
				_this.noteOn(_this.keyMap[e.keyCode] + _this.octave*12, _this.context.currentTime, 127/2);
			}

			if (e.keyCode == 189){
				_this.octave = 0;
			}

			if (e.keyCode == 187){
				_this.octave = 1;
			}
		});

		$(window).mousemove(function(e){
			var midiNumber = _this.getMidiNumberFromClick(e);
			var velocity = _this.getVelocityFromClick(e);
			if (_this.mousedown && midiNumber != _this.lastNotePlayed){
				_this.lastNotePlayed = midiNumber;
				_this.noteOn(midiNumber,_this.context.currentTime,velocity);
			}
		});

		$(window).on("mouseup touchend", function(e){
			_this.mousedown = false;
		})
	}

	this.requestMIDIAccess = function(){
		if (navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess({
		    }).then(_this.onMIDISuccess, _this.onMIDIFailure);
		} else {
			console.log("No MIDI support in your browser. Please try again with Chrome.");
		}
	}

	this.drawNoteHit = function(noteNumber, velocity){
		var windowWidth = $(window).width();
	    var windowHeight = $(window).height();
	    var midiRange = this.upperLimitNote - this.lowerLimitNote;
	    var particlesY = windowHeight * (127 - velocity)/127
	    // var particlesY = windowHeight/2;
	    
	     this.resetParticles((noteNumber - this.lowerLimitNote) /midiRange  * windowWidth, particlesY);      
	}

	this.resetParticles = function(x,y){
  		for (var i = 0; i < 35; i++) {
			this.particles.push(new Particle(x,y));
		}
	}

	this.frequencyFromNoteNumber = function(note) {
		return 440 * Math.pow(2,(note-57)/12);
	}

	this.mapRange = function(from, to, s) {
		return Math.round(to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]));
	};

	this.getMidiNumberFromClick = function (e){
		if (e.type == "touchstart"){
			var x = e.originalEvent.touches[0].clientX;
		} else {
			var x = e.clientX;
		}
		return this.mapRange([0,$(window).width()], [this.lowerLimitNote, this.upperLimitNote], x)
	}

	this.getVelocityFromClick = function (e){
		if (e.type == "touchstart"){
			var y = e.originalEvent.touches[0].clientY;
		} else {
			var y = e.clientY;
		}
		return this.mapRange([$(window).height(), 0], [0, 127], y);
	}
	
	this.sketch = Sketch.create({
    	center: {},
    	setup: function() {
    		
    	this.resize();
        
        x = this.width * 0.5;
        y = this.height * 0.5;
    		
    	},

    	resize: function() {
    		this.center.x = this.width * 0.5;
    		this.center.y = this.height * 0.5;
    	},

    	draw: function() {

    		this.globalCompositeOperation = "source-over";
    		this.fillStyle = '#0A0B1F';
    		this.fillRect(0, 0, this.width, this.height);
    		this.globalCompositeOperation = "lighter";

    		var p, i = _this.particles.length;
    		
    		while (i--) {
    			p = _this.particles[i];
    			p.opacity = round(p.charge / p.lifespan * 100) / 100;
    			p.draw(this);
    			p.update();
    			if (p.charge < 0 || p.radius < 0) {
		            _this.particles.splice(i, 1);
    			}
    		}

    	}
    });


	this.init();

}

var glowsynth = new GlowSynth();