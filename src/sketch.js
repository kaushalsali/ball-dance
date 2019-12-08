
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

let triggerBalls = [];
let regularBalls = [];
let regularBallBodies = [];

// Tone
let synths = []
let started = false;




// Start Tone on pressing 's' key
document.addEventListener('keydown', function(event) {

    if(event.keyCode == 83) {
	Tone.start();
	console.log('Tone started');

	synths[0] = new Tone.Synth(SYNTH1_CONFIG).toMaster();
	synths[1] = new Tone.Synth(SYNTH2_CONFIG).toMaster();

	for (let i = 0; i < NUM_TRIG_BALLS; i++)
	    triggerBalls[i].setSynth(synths[i])		

    }
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

    
    // Create Ground    
    ground = new Ground();
    let surfaceBodies = ground.getSurfaceBodies()
    for (let i=0; i<ground.getNumSurfaces(); i++)	
	World.add(engine.world, surfaceBodies[i]);

    
    // Create Regular Balls    
    for (let i = 0; i < NUM_REG_BALLS; i++) {
	regularBalls[i] = new RegularBall(i, random(0, width), random(0, height-150), 30, REG_BALL_COLOR, 15, PITCHES[i%3]);
    	regularBallBodies[i] = regularBalls[i].getBody();
	World.add(engine.world, regularBallBodies[i]);
    }
    


    
    // Create Trigger Balls

    for (let i = 0; i < NUM_TRIG_BALLS; i++) {
	triggerBalls[i] = new TriggerBall(i, random(0, width), random(0, height-150), 30, TRIG_BALL_COLOR, 15)
	World.add(engine.world, triggerBalls[i].getBody());
    }
 




    
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
	    for (let i=0; i < NUM_TRIG_BALLS; i++) {
		let ball = triggerBalls[i].getBody()
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
    for (let i=0; i < NUM_REG_BALLS; i++) {
	regularBalls[i].update();
	regularBalls[i].draw();
    }

    
    for (let i=0; i < NUM_TRIG_BALLS; i++) {
	triggerBalls[i].update();
	triggerBalls[i].draw();

	for (let j=0; j<regularBalls.length; j++) {
	    collision = Matter.SAT.collides(triggerBalls[i].getBody(), regularBallBodies[j]);
	    if (collision.collided) {
		regBall = regularBalls[collision.bodyB.p5id];
		triggerBalls[i].playSound(regBall.getPitch());
	    }
	}
    }


    // collision = Matter.SAT.collides(balls[0].getBody(), ballBodies[0]);
    // if (collision.collided) {
    // 	polySynth.triggerAttackRelease(["C4", "E4", "A4"], "4n");
    // }

}
