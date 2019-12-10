
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
		
		// this.trailHistory.splice(this.trailHistory.length - this.trailLength);
		// console.log(this.trailHistory.length);
		
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

    playSound(note) {
		//this.synth.triggerAttackRelease(note, NOTE_DURATION);
		//console.log("playSound called: " + str(note));
		let msg = str(note);
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