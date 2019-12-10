
class BallSystem {

    constructor(world, numTriggerBalls=1, numRegularBalls=5) {	

	this.world = world
	this.triggerBalls = [];
	this.regularBalls = [];

	for (let i=0; i < numTriggerBalls; i++) {
            this.triggerBalls[i] = new TriggerBall(i, random(0, width), random(0, height-150), 30, TRIG_BALL_COLOR, 15);
            World.add(this.world, this.triggerBalls[i].getBody());
	}
	
	for (let i=0; i<numRegularBalls; i++) {
	    this.regularBalls[i] = new RegularBall(i, random(0, width), random(0, height-150), 30, REG_BALL_COLOR, 15, PITCHES[i%3]);
	    World.add(this.world, this.regularBalls[i].getBody());
	}
    }

    getNumTriggerBalls() {
	return this.triggerBalls.length;
    }

    getNumRegularBalls() {
	return this.regularBalls.length;
    }

    getTriggerBalls() {
	return this.triggerBalls;
    }

    getRegularBalls() {
	return this.regularBalls;
    }

    addNewTriggerBall() {
	if (triggerBalls.length < MAX_REG_BALLS) {
	    let ball = new TriggerBall(triggerBalls.length, mouseX, mouseY, 30, TRIG_BALL_COLOR, 15)
	    this.triggerBalls.push(ball);
	    World.add(this.world, ball.getBody());
	}

    }
    
    removeTriggerBall(ball) {
	let index = this.triggerBalls.findIndex(b => b.getId() === ball.getId())
	if (index !== -1) {
	    this.triggerBalls.splice(index, 1);
	    Matter.Composite.remove(this.world, ball.getBody())
	}
    }

    addNewRegularBall() {
	if (regularBalls.length < MAX_REG_BALLS) {	    
	    let ball = new RegularBall(this.regularBalls.length, mouseX, mouseY, 30, REG_BALL_COLOR, 15, PITCHES[this.regularBalls.length % 3]);
	    this.regularBalls.push(ball);
	    World.add(this.world, ball.getBody());
	}
    }
    
    removeRegularBall(ball) {
	let index = this.regularBalls.findIndex(b => b.getId() === ball.getId())
	if (index !== -1) {
	    Matter.Composite.remove(this.world, ball.getBody())
	    this.regularBalls.splice(index, 1);
	}
    }

    updateAndDrawTriggerBalls() {
	for (let i=0; i < this.triggerBalls.length; i++) {
            let ball = this.triggerBalls[i]
	    ball.draw();
            ball.update();
	    if (ball.isDead())
		this.removeTriggerBall(ball);
	}
    }

    updateAndDrawRegularBalls() {
	for (let i=0; i < this.regularBalls.length; i++) {
	    let ball = this.regularBalls[i];
	    ball.draw();
            ball.update();
	    if (ball.isDead())
		this.removeRegularBall(ball);
	}
    }


    detectCollisions() {	
	for (let i=0; i < this.triggerBalls.length; i++) { 
	    for (let j=0; j < this.regularBalls.length; j++) {
		let collision = Matter.SAT.collides(this.triggerBalls[i].getBody(), this.regularBalls[j].getBody());
		if (collision.collided) {	    
		    let cur_time = Date.now();

		    if (cur_time - this.regularBalls[j].lastHitTime > SOUND_INTERVAL) {
			let regBall = this.regularBalls[collision.bodyB.p5id];
			this.triggerBalls[i].playSound(regBall.getPitch());
			color_id = (color_id + 1) % TOTAL_COLORS;  // color_id is global
			regBall.setLastHitTime(cur_time);
		    } else {
			//console.log(cur_time -this.regularBalls[j].lastHitTime);
			this.regularBalls[j].setLastHitTime(cur_time);
		    }
		}
            }
	}
    }
    
}


class Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0) {	

	this.id = id;

	// Drawing
	this.x = startX;
	this.y = startY;
	this.radius = radius;

	// Matter body
	this.body = Matter.Bodies.circle(startX, startY, radius, {
	    friction: 0,
	    frictionAir: 0,
	    frictionStatic: 0,
	    restitution: 0.7,
	    // mass: random(1,2)	    
	    p5id: this.id
	});

	// Trail
	this.trailHistory = [];
	this.trailLength = 1 + trailLength;
	this.minTrailRadius = radius / 2;
	this.trailHistory.push(this.getPosition());

	//Colours
	this.colors = colors;	
	this.color = this.colors[color_id];
	this.alpha = 255;

	// Lifespan
	this.maxLife = random(100,500);
	this.life = this.maxLife;
    }

    getId() {
	return this.id;
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

    calcAgeEffect() {
	return ((this.maxLife - this.life) / this.maxLife) * 10
    }


    isDead() {
	if (this.life <= 0)
	    return true
	else
	    return false;
    }

    deathSequence() {}

    
    update() {	
	let pos = this.getPosition()
	// let angle = this.getAngle();
	this.trailHistory.push({x: pos.x, y: pos.y});

	if (this.trailHistory.length > this.trailLength)
	    this.trailHistory.shift();
	
	this.color = this.colors[color_id];
			
	this.life -= 0.01;

	if (this.life <= 0) {
	    this.deathSequence();
	}
	
    }
    
    draw() {

	for (let i=0; i<this.trailHistory.length; i++) {
	    
	    push();

	    let ageEffect = this.calcAgeEffect()
	    translate(this.trailHistory[i].x + random(-ageEffect, ageEffect), this.trailHistory[i].y + random(-ageEffect, ageEffect));

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

    constructor(id, startX, startY, radius, colors, trailLength=0, synth=null) {
	super(id, startX, startY, radius, colors, trailLength);
	this.synth = synth;
    }

    setSynth(synth) {
	this.synth = synth;
    }

    playSound(note) {
	// console.log("playSound called: " + str(note));
    }

    deathSequence() {
	// console.log('trig dead', this);
    }
}


class RegularBall extends Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0, pitch) {
	super(id, startX, startY, radius, colors, trailLength, color);
	this.pitch = pitch;
	this.lastHitTime = Date.now();
	//console.log("regular ball created: " + str(this.lastHit));
    }

    getPitch() {
	return this.pitch;
    }

    setLastHitTime(newHitTime){
    	this.lastHitTime = newHitTime;
    }
    
    deathSequence() {
	// console.log('reg dead', this);
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
