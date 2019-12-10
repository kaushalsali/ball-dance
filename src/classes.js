
class Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0) {	

		this.id = id;
		
		this.x = startX;
		this.y = startY;
		this.radius = radius;
		
		this.trailHistory = [];
		this.trailLength = 1 + trailLength;
		this.minTrailRadius = radius / 2;
		
		this.body = Matter.Bodies.circle(startX, startY, radius, {
		    friction: 0,
		    frictionAir: 0,
		    frictionStatic: 0,
		    restitution: 0.7,
		    // mass: random(1,2)

		    p5id: this.id
		});
		
		this.trailHistory.push(this.getPosition());

		this.colors = colors;
		this.color = this.colors[color_id];
		this.alpha = 255;

		this.dots = [];

    }

    getBody() {
		return this.body;
    }

    getPosition() {
		return this.body.position;
    }

    getAngle() {
		return this.body.angle;
    }

    calcTrailRadius(i) {	
		let radiusIncFactor = (this.radius - this.minTrailRadius) / this.trailLength;
		return this.minTrailRadius + (i * radiusIncFactor);
    }

    calcTrailAlpha(i) {
		let alphaIncFactor = this.alpha / (this.trailLength - 1);
		return i * alphaIncFactor;
    }

    update() {
		let pos = this.getPosition()
		// let angle = this.getAngle();
		this.trailHistory.push({x: pos.x, y: pos.y});

		if (this.trailHistory.length > this.trailLength)
		    this.trailHistory.shift();

		this.color = this.colors[color_id];

		this.x = pos.x;
		this.y = pos.y;
		
		// this.trailHistory.splice(this.trailHistory.length - this.trailLength);
		// console.log(this.trailHistory.length);
		
    }

    explode() {
    	let pos = this.getPosition();
    	for (let i = 0; i < EXPLODE_DOTS; i++){
    		let d = new Dot(pos.x, pos.y, this.radius, this.color);
    		this.dots[i] = d
    		let id = dots.length;
    		dots[id] = d;
    	}
    	//console.log("after explode: ", dots.length);
    }
    
    draw() {
    	//console.log(typeof this.color[0]);
		//console.log(c);
		for (let i=0; i<this.trailHistory.length; i++) {

		    push();
		    // blendMode(HARD_LIGHT);
		    translate(this.trailHistory[i].x, this.trailHistory[i].y);	    
		    // rotate(angle);
		    
		    //let strokeWidth = 4;
		    //strokeWeight( (((this.trailHistory.length-1-i) / (this.trailHistory.length-1-i)) - 1) * -strokeWidth );
		    //noStroke();
		    
		    let c = color(this.color[0], this.color[1], this.color[2], this.calcTrailAlpha(i));
		    fill(c);

		    ellipseMode(RADIUS);
		    ellipse(0, 0,  this.calcTrailRadius(i));
		    // ellipse(0, 0, random(this.radius-0.5, this.radius+0.5), random(this.radius-0.5, this.radius+0.5)

		    pop();
		    // console.log(this.trailHistory[i]);
		}
		// console.log("---");

    }     
}



class TriggerBall extends Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0, ins_class=1) {
		super(id, startX, startY, radius, colors, trailLength);
		this.ins_class = ins_class;
    }

    setSynth(synth) {
		this.synth = synth;
    }

    playSound(note, radius) {
		//this.synth.triggerAttackRelease(note, NOTE_DURATION);
		//console.log("playSound called: " + str(note));
		let msg = str(note) + ' ' + str(radius);
		SendMessage('/play' + str(this.ins_class), msg);
    }
    playExplosionSound(){
    	let p = PITCHES[floor(random(0, 5))] + 60 - this.ins_class * 12;
    	let msg = str(p) + ' ' + str(this.radius);
    	//console.log(msg);
    	//console.log(Math.pow(this.body.velocity.x, 2));
    	SendMessage('/play' + str(this.ins_class), msg);
    }
}


class RegularBall extends Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0, pitch) {
		super(id, startX, startY, radius, colors, trailLength, color);
		this.pitch = pitch;
		this.lastHitTime = Date.now();
		//console.log("regular ball created: " + str(this.id) + ' ' + str(this.pitch));
    }

    getPitch() {
    	//console.log("regular ball get pitch: " + str(this.id) + ' ' + str(this.pitch));
		return this.pitch;
    }

    setLastHitTime(newHitTime){
    	this.lastHitTime = newHitTime;
    }

    playExplosionSound(){
    	let v = Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2));
    	let msg = str(this.pitch) + ' ' + str(this.radius);
    	//console.log(msg);
    	SendMessage('/explodeRegular', msg);
    }
    
}

class Dot {

	constructor(x, y, initR, c, finalR=0, lifespan=100){
		// position
		this.pos = createVector(x, y);

		// radius, color and lifespan
		this.radius = initR;
		this.finalR = finalR;
		this.color = c;
		this.lifespan = lifespan;
		this.life = lifespan;

		colorMode(RGB);
		this.r = red(c);
		this.g = green(c);
		this.b = blue(c);
		//console.log(this.r, this.g, this.b);

		this.vel = p5.Vector.random2D();
		this.acc = p5.Vector.random2D();

	}

	draw() {
		noStroke();
		//console.log(this.life/this.lifespan);
		fill(this.r, this.g, this.b, this.life / this.lifespan * 255);
		ellipseMode(RADIUS);
		ellipse(this.pos.x, this.pos.y, this.radius);
	}
	
	update(){
		this.pos.add(this.vel);
		this.vel.add(this.acc);
		this.vel.mult(0.99);

		this.life -= 1;
		if (this.radius > this.finalR){
			this.radius *= 0.8;
		}
	}


}


class Ground {
    
    constructor() {
		let thickness = 100;
		this.surfaces = [];
		
		let options = {
		    isStatic: true,
		    restitution: 0,
		    friction: 0.8
		}; 	
		this.surfaces[0] = new Surface(width/2, height, width, thickness, options);
		this.surfaces[1] = new Surface(0, height/2, thickness, height, options);
		this.surfaces[2] = new Surface(width/2, 0, width, thickness, options);
		this.surfaces[3] = new Surface(width, height/2, thickness, height, options);
	}

    getNumSurfaces() {
		return this.surfaces.length;
    }
    
    getSurfaceBodies() {
		let bodies = []
		for (let i=0; i<this.surfaces.length; i++)
		    bodies.push(this.surfaces[i].getBody());
		return bodies
	    }

    draw() {	
		for (let i=0; i<4; i++)
	    	this.surfaces[i].draw();
	}
}



class Surface {
    
    constructor(x, y, width, height, options) {
		this.width = width;
		this.height = height;
		this.body = Bodies.rectangle(x, y, this.width, this.height, options);
    }

    getBody() {
		return this.body
    }
    
    draw() {
		noStroke();
		fill(SURFACE_COLOR[color_id]);
		rectMode(CENTER);	
		rect(this.body.position.x, this.body.position.y, this.width, this.height);
    }    
}