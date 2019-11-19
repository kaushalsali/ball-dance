
class Ball {

    constructor(startX, startY, radius) {
	this.x = startX;
	this.y = startY;
	this.xStep = random(-5,5);
	this.yStep = random(-5,5);
	this.radius = radius;

	let options = {
	    friction: 0,
	    frictionAir: 0,
	    frictionStatic: 0,
	    restitution: 1,
	    // mass: random(1,2)
	}
	this.body = Matter.Bodies.circle(startX, startY, radius, options)		
    }

    getBody() {
	return this.body;
    }
    
    draw() {	
	var pos = this.body.position;
	var angle = this.body.angle;
	push();
	translate(pos.x, pos.y);
	rotate(angle);
	strokeWeight(2);
	stroke(0);
	fill(127);
	ellipseMode(RADIUS);
	ellipse(0, 0, this.radius);
	// ellipse(0, 0, random(this.radius-0.5, this.radius+0.5), random(this.radius-0.5, this.radius+0.5));
	pop();
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
	fill(170);
	rectMode(CENTER);	
	rect(this.body.position.x, this.body.position.y, this.width, this.height);
    }    
}
