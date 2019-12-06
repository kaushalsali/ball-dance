// module aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events



let canvasWidth = 1920
let canvasHeight = 1080 -100


let engine = null;

let ground = null;

let numBalls = 1;
let balls = [];





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
    for (let i=0; i<numBalls; i++) {
	balls[i] = new Ball(random(0, width), random(0, height-150), 40, 200);
	// balls[i] = new Ball(random(0, width), random(0, height-150), random(10,50), 200);
	World.add(engine.world, balls[i].body);
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
	    for (let i=0; i<balls.length; i++) {
		ball = balls[i].getBody();
		Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.05, 0.05), y:random(-0.05, 0.05)});
	    }
	}
    });

	

    ballBodies = []
    for(let i=0; i<balls.length; i++)
	ballBodies[i] = balls[i].getBody();

    
	
    // Start Engine
    Engine.run(engine)
}





function draw() {

    background(80);

    Matter.Engine.update(engine);
    
    // Draw Ground
    for (let i=0; i<4; i++)
	ground.draw()
    
    // Draw Balls
    for (let i=0; i<balls.length; i++) {
	balls[i].update();
	balls[i].draw()
    }

    // console.log(balls[0].history.length)

    // collisionPairs = Matter.Query.collides(balls[0].getBody(), [balls[1].getBody()]);
    // if (collisionPairs.length > 0)
    	// console.log(collisionPairs[0].bodyA);

}

