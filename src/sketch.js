
// module aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events

// p5
let canvasWidth = 1920;
let canvasHeight = 1080;

let engine = null;
let world = null;


let ground = null;

let ballSystem = null;
let triggerBalls = [];
let regularBalls = [];
let regularBallBodies = [];

let cur_num_reg_balls = NUM_REG_BALLS;
let cur_num_trig_balls = NUM_TRIG_BALLS;

let color_id = 0;


function setup() {
    
    let myCanvas = createCanvas(canvasWidth, canvasHeight);
    resizeCanvas(window.innerWidth, window.innerHeight);
    myCanvas.parent('canvas-container')
    
    //console.log(window.innerHeight, window.innerHeight);
    //console.log(height, width);

    background(BACKGROUND_COLOR[color_id]);

    
    // Create Engine
    engine = Engine.create();
    world = engine.world;
    world.gravity.x = 0;
    world.gravity.y = 0;

    
    // Create Ground    
    ground = new Ground();
    let surfaceBodies = ground.getSurfaceBodies()
    for (let i=0; i<ground.getNumSurfaces(); i++)   
        World.add(engine.world, surfaceBodies[i]);

     

    ballSystem = new BallSystem(world, NUM_TRIG_BALLS, NUM_REG_BALLS);

    
    // Add mouse control
    let myMouse = Mouse.create(window.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse: myMouse,
    });
    World.add(engine.world, mouseConstraint);

   


    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 70) {
            for (let i=0; i < cur_num_trig_balls; i++) {
                let ball = triggerBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.05, 0.05), y:random(-0.05, 0.05)});
            }
        }
        if(event.keyCode == 38) { // up
	    let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: 0, y: -0.05});
            }
        }
        if(event.keyCode == 40) { // down
	    let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: 0, y: 0.05});
            }
        }
        if(event.keyCode == 37) { // left
	    let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: -0.05, y: 0});
            }
        }
        if(event.keyCode == 39) { // right
	    let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: 0.05, y: 0});
            }
        }
        if(event.keyCode == 32) { // space
	    let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody()
                Matter.Body.setVelocity(ball, {x: 0, y:0});
            }
	    let regBalls = ballSystem.getRegularBalls();
            for (let i=0; i < regBalls.length; i++) {
                let ball = regBalls[i].getBody()
                Matter.Body.setVelocity(ball, {x: 0, y:0});
            }
        }
    });
    
    // Start Engine
    Engine.run(engine)
}


function draw() {

    Matter.Engine.update(engine);

    // Draw background
    background(BACKGROUND_COLOR[color_id]);
        
    // Draw Ground
    for (let i=0; i<4; i++)
        ground.draw();
    
    // Draw Balls
    ballSystem.updateAndDrawTriggerBalls();
    ballSystem.updateAndDrawRegularBalls();

    // Handle Collisions
    let trigBalls = ballSystem.getTriggerBalls();
    let regBalls = ballSystem.getRegularBalls();    

    ballSystem.detectCollisions();
    
}



function mouseClicked(event){
    if (event.shiftKey){ // shift + click
	ballSystem.addNewTriggerBall();
        console.log('adding a trigger ball...current num: ' + str(ballSystem.getNumTriggerBalls()));
    }
    else {
	ballSystem.addNewRegularBall();
        console.log('adding a regular ball...current num: ' + str(ballSystem.getNumRegularBalls()));
    }
}
