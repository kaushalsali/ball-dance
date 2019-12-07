
// module aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events

// p5
let canvasWidth = 1920
let canvasHeight = 1080 -100

let engine = null;
let ground = null;

let numBalls = NUM_BALLS;
let balls = [];
let ballBodies = []

// Tone
let polySynth;
let started = false;



document.addEventListener('keydown', function(event) {
    if(event.keyCode == 83) {
	console.log('Tone started');
	Tone.start();
	console.log(ENV);
	polySynth = new Tone.Synth(ENV).toMaster();
    
	console.log(polySynth);
    }
});

document.getElementById('play').addEventListener('click', () => {
    console.log('Play');
    // polySynth.triggerAttackRelease("C4", "8n");
});





function setup() {
    
    let myCanvas = createCanvas(canvasWidth, canvasHeight);
    resizeCanvas(window.innerWidth, window.innerHeight);
    myCanvas.parent('canvas-container')

    background(80);

    // Create Engine
    engine = Engine.create();
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;
    
    // Add Ground    
    ground = new Ground();
    let surfaceBodies = ground.getSurfaceBodies()
    for (let i=0; i<ground.getNumSurfaces(); i++)	
	World.add(engine.world, surfaceBodies[i]);
    
    // Add Balls     
    balls[0] = new Ball(random(0, width), random(0, height-150), 40, 10, 15);
    World.add(engine.world, balls[0].body);
    
    for (let i=1; i<numBalls; i++) {
	balls[i] = new Ball(random(0, width), random(0, height-150), 30, 200, 15);
	// balls[i] = new Ball(random(0, width), random(0, height-150), random(10,50), 200);
	World.add(engine.world, balls[i].body);
    }


    
    for(let i=1; i<balls.length; i++)
    	ballBodies[i-1] = balls[i].getBody();
    console.log(ballBodies.length)


    
    
    // Add mouse control
    let myMouse = Mouse.create(window.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
	mouse: myMouse,
    });
    World.add(engine.world, mouseConstraint);

    Events.on(mouseConstraint, 'mousedown', function(event) {
        var mousePosition = event.mouse.position;
        // console.log('mousedown', mousePosition);
    });

    Events.on(mouseConstraint, 'mouseup', function(event) {
        var mousePosition = event.mouse.position;
        // console.log('mouseup', mousePosition);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'startdrag', function(event) {
        // console.log('startdrag', event);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'enddrag', function(event) {
        // console.log('enddrag', event);
    });
    


    document.addEventListener('keydown', function(event) {
	if(event.keyCode == 70) {
	    for (let i=0; i<balls.length; i++) {
		ball = balls[i].getBody();
		Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.05, 0.05), y:random(-0.05, 0.05)});
	    }
	}
    });

	
    document.addEventListener('keydown', function(event) {
	if(event.keyCode == 71) {
    	    polySynth.triggerAttackRelease("C4", DUR);
	}
    });


    
	
    // Start Engine
    Engine.run(engine)
}







function draw() {

    background(80);
    
    Matter.Engine.update(engine);
    
    // Draw Ground
    for (let i=0; i<4; i++)
	ground.draw();
    
    // Draw Balls
    for (let i=0; i<balls.length; i++) {
	balls[i].update();
	balls[i].draw();

	collision = Matter.SAT.collides(balls[0].getBody(), ballBodies[i%(balls.length-1)]);
	if (collision.collided) {
    	    polySynth.triggerAttackRelease("C4", DUR);
	}

    }


    // collision = Matter.SAT.collides(balls[0].getBody(), ballBodies[0]);
    // if (collision.collided) {
    // 	polySynth.triggerAttackRelease(["C4", "E4", "A4"], "4n");
    // }

}


