
class BallSystem {

    constructor(world, numTriggerBalls=1, numRegularBalls=5) {	

	this.world = world
	this.triggerBalls = [];
	this.regularBalls = [];
	this.garbageTriggerBalls = [];
	this.garbageRegularBalls = [];

	for (let i=0; i < numTriggerBalls; i++) {
            let r = max(randomGaussian(TRIG_RANGE[0], TRIG_RANGE[1]), MIN_R);
            this.triggerBalls[i] = new TriggerBall(i, random(r, width-r), random(r, height-r), r, TRIG_BALL_COLOR, 30, i%TOTAL_INS);
            World.add(this.world, this.triggerBalls[i].getBody());
	}
	
	for (let i=0; i<numRegularBalls; i++) {
	    let r = max(randomGaussian(REG_RANGE[0], REG_RANGE[1]), MIN_R);
	    this.regularBalls[i] = new RegularBall(i, random(r, width-r), random(r, height-r), r, REG_BALL_COLOR, 15, PITCHES[i%TOTAL_PITCHES]);;
	    World.add(this.world, this.regularBalls[i].getBody());
	}
    }

    getNumTriggerBalls() {
		return this.triggerBalls.length;
    }

    getNumRegularBalls() {
		return this.regularBalls.length;
    }

    getTotalNumBalls() {
        return this.regularBalls.length + this.triggerBalls.length;
    }

    getTriggerBallById(id) {
		return this.triggerBalls.find(b => b.getId() === id);
    }

    getRegularBallById(id) {
		return this.regularBalls.find(b => b.getId() === id);
    }

    getTriggerBalls() {
		return this.triggerBalls;
    }

    getRegularBalls() {
		return this.regularBalls;
    }

    addNewTriggerBall(x=null, y=null, instrument=Math.floor(random(0, TOTAL_INS))) {
        console.log(instrument);
		if (triggerBalls.length < MAX_REG_BALLS) {
			let r = max(randomGaussian(TRIG_RANGE[0], TRIG_RANGE[1]), MIN_R);
			x = x || random(r, width-r);
			y = y || random(r, height-r);
			let ball = new TriggerBall(this.triggerBalls.length, x, y, r, TRIG_BALL_COLOR, 15, instrument);
			this.triggerBalls.push(ball);
			World.add(this.world, ball.getBody());
		}
    }
    
    removeTriggerBall(ball) {
		let index = this.triggerBalls.findIndex(b => b.getId() === ball.getId());
		if (index !== -1) {
			Matter.Composite.remove(this.world, ball.getBody());	// remove from world
			// will be removed from this.triggerBalls in cleanTriggerBall()
			this.garbageTriggerBalls.push(index);
		}
    }

    addNewRegularBall(x=null, y=null) {
		if (regularBalls.length < MAX_REG_BALLS) {
			let r = max(randomGaussian(REG_RANGE[0], REG_RANGE[1]), MIN_R);
			x = x || random(r, width-r);
			y = y || random(r, height-r);
			let ball = new RegularBall(this.regularBalls.length, mouseX, mouseY, r, REG_BALL_COLOR, 15, PITCHES[this.regularBalls.length % TOTAL_PITCHES]);
			this.regularBalls.push(ball);
			World.add(this.world, ball.getBody());
		}
    }
    
    removeRegularBall(ball) {
		let index = this.regularBalls.findIndex(b => b.getId() === ball.getId());
		if (index !== -1) {
			Matter.Composite.remove(this.world, ball.getBody());	// remove from world
			// will be removed from this.regularBalls in cleanRegularBall()
			this.garbageRegularBalls.push(index);
		}
    }

    updateAndDrawTriggerBalls() {
    	this.cleanTriggerGarbage();	// garbage collected here
		for (let i=0; i < this.triggerBalls.length; i++) {
				let ball = this.triggerBalls[i];
			ball.draw();
				ball.update();
			if (ball.isDead()) {
			ball.explode();
			ball.playExplosionSound();
			this.removeTriggerBall(ball);
			}
		}
    }

    updateAndDrawRegularBalls() {
    	this.cleanRegularGarbage();	// garbage collected here
		for (let i=0; i < this.regularBalls.length; i++) {
			let ball = this.regularBalls[i];
			ball.draw();
			ball.update();
			if (ball.isDead()) {
				ball.explode();
				ball.playExplosionSound();
				this.removeRegularBall(ball);
			}
		}
    }

    cleanRegularGarbage() {
    	// remove in descending order
		this.garbageRegularBalls.sort(function(a, b){return b-a});

		for (let i=0; i < this.garbageRegularBalls.length; i++){
			let index = this.garbageRegularBalls[i];
			this.regularBalls.splice(index, 1);
		}

		this.garbageRegularBalls = [];
    }

    cleanTriggerGarbage() {
    	// remove in descending order
    	this.garbageTriggerBalls.sort(function(a, b){return b-a});

		for (let i=0; i < this.garbageTriggerBalls.length; i++){
			let index = this.garbageTriggerBalls[i];
			this.triggerBalls.splice(index, 1);
		}

    	this.garbageTriggerBalls = [];
    }

    computeShakeness() {
		let maxShakeness = 0;
		for (let i=0; i < this.triggerBalls.length; i++) {
			let tmpShakeness = this.triggerBalls[i].calcAgeEffect();
			if (tmpShakeness > maxShakeness)
				maxShakeness = tmpShakeness;
		}
		for (let i=0; i < this.regularBalls.length; i++) {
			let tmpShakeness = this.regularBalls[i].calcAgeEffect();
			if (tmpShakeness > maxShakeness)
				maxShakeness = tmpShakeness;
		}
		maxShakeness *= 10;
		let msg = str(48) + ' ' + str(maxShakeness);
		SendMessage('/shaking', msg);
    }



    detectCollisions() {	
		for (let i=0; i < this.triggerBalls.length; i++) {
			for (let j=0; j < this.regularBalls.length; j++) {
				let regBall = this.regularBalls[j];
				let collision = Matter.SAT.collides(this.triggerBalls[i].getBody(), regBall.getBody()); // TODO: Third arg: previous collision not passed.
				if (collision.collided) {
					let cur_time = Date.now();
					if (cur_time - regBall.lastHitTime > SOUND_INTERVAL) {
						this.triggerBalls[i].playSound(regBall.getPitch());
						color_id = (color_id + 1) % TOTAL_COLORS;  // color_id is global
						regBall.setLastHitTime(cur_time);
					} else {
						regBall.setLastHitTime(cur_time);
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
	    restitution: 0.9,
	    // mass: random(1,2)	    
	    p5id: this.id
	});

	// Trail
	this.trailHistory = [];
	this.trailLength = 1 + trailLength;
	this.minTrailRadius = radius / 2;
	this.trailHistory.push(this.getPosition());
      
	this.dots = [];

	//Colours
	this.colors = colors;	
	this.color = this.colors[color_id];
	this.alpha = 255;

	// Lifespan
	this.maxLife = random(MIN_LIFE, MAX_LIFE);
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
		return ((this.maxLife - this.life) / this.maxLife) * 10;
    }


    isDead() {
		return this.life <= 0;
    }

    deathSequence() {
	
    }

    
    update() {	
		let pos = this.getPosition();
		// let angle = this.getAngle();
		this.trailHistory.push({x: pos.x, y: pos.y});
		if (this.trailHistory.length > this.trailLength)
			this.trailHistory.shift();

		this.life -= 0.1;
		if (this.life <= 0)
			this.deathSequence();

		this.color = this.colors[color_id];
		this.x = pos.x;
		this.y = pos.y;
    }

    explode() {
    	let pos = this.getPosition();
    	for (let i = 0; i < EXPLODE_DOTS; i++){
    		let d = new Dot(pos.x, pos.y, this.radius, this.color);
    		this.dots[i] = d;
    		let id = dots.length;
    		dots[id] = d;
    	}
    	//console.log("after explode: ", dots.length);
    }
    
    draw() {
		for (let i=0; i<this.trailHistory.length; i++) {
			push();

			let ageEffect = this.calcAgeEffect();
			translate(this.trailHistory[i].x + random(-ageEffect, ageEffect), this.trailHistory[i].y + random(-ageEffect, ageEffect));

			let c = color(this.color[0], this.color[1], this.color[2], this.calcTrailAlpha(i));
			fill(c);

			ellipseMode(RADIUS);
			ellipse(0, 0,  this.calcTrailRadius(i));

			pop();
		}
    }
}



class TriggerBall extends Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0, ins_class=1) {
		super(id, startX, startY, radius, colors, trailLength);
		this.ins_class = ins_class;
    }


    deathSequence() {
		// console.log('trig dead', this);
    }
    
    playSound(note, radius) {
		radius = radius || 60;
		let msg = str(note) + ' ' + str(radius);
		SendMessage('/play' + str(this.ins_class), msg);
    }

    playExplosionSound() {
    	let p = PITCHES[floor(random(0, 5))] + 60 - this.ins_class * 12;
    	let msg = str(p) + ' ' + str(this.radius);
    	SendMessage('/play' + str(this.ins_class), msg);
    }

	draw() {
		for (let i=0; i<this.trailHistory.length; i++) {
			push();

			let ageEffect = this.calcAgeEffect();
			translate(this.trailHistory[i].x + random(-ageEffect, ageEffect), this.trailHistory[i].y + random(-ageEffect, ageEffect));

			let alpha = this.calcTrailAlpha(i);
			let c = color(this.color[0], this.color[1], this.color[2], alpha);
			fill(c);

			ellipseMode(RADIUS);
			ellipse(0, 0,  this.calcTrailRadius(i));

			if (this.ins_class >= 1) {
				let c = color(this.color[0] + 20, this.color[1] + 20, this.color[2] + 20, alpha);
				fill(c);
				ellipse(0, 0,  2 * this.calcTrailRadius(i) / 3);

				if (this.ins_class === 2) {
					let c = color(this.color[0] + 60, this.color[1] + 60, this.color[2] + 60, alpha);
					fill(c);
					ellipse(0, 0,  this.calcTrailRadius(i) / 3);
				}
			}

			pop();
		}
	}

}


class RegularBall extends Ball {

    constructor(id, startX, startY, radius, colors, trailLength=0, pitch) {
		super(id, startX, startY, radius, colors, trailLength, color);
		this.pitch = pitch;
		this.lastHitTime = Date.now();
    }

    getPitch() {
		return this.pitch;
    }

    setLastHitTime(newHitTime){
    	this.lastHitTime = newHitTime;
    }

    playExplosionSound(){
    	let v = Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2));
    	let msg = str(this.pitch) + ' ' + str(this.radius);
    	SendMessage('/explodeRegular', msg);
    }
    
    deathSequence() {
		// console.log('reg dead', this);
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
        let bodies = [];
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
		return this.body;
    }
    
    draw() {
		noStroke();
		fill(SURFACE_COLOR[color_id]);
		rectMode(CENTER);	
		rect(this.body.position.x, this.body.position.y, this.width, this.height);
    }    
}
