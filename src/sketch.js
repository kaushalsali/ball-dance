
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
let dots = [];

let cur_num_reg_balls = NUM_REG_BALLS;
let cur_num_trig_balls = NUM_TRIG_BALLS;

let color_id = 0;

let loopTimer = 0;
let loopMode = false;

function setup() {

    ConnectServer();
    
    let myCanvas = createCanvas(canvasWidth, canvasHeight);
    resizeCanvas(window.innerWidth, window.innerHeight);
    myCanvas.parent('canvas-container');
    
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
    let surfaceBodies = ground.getSurfaceBodies();
    for (let i=0; i<ground.getNumSurfaces(); i++)   
        World.add(engine.world, surfaceBodies[i]);

     // Create Ball System
    ballSystem = new BallSystem(world, NUM_TRIG_BALLS, NUM_REG_BALLS);          
    
    // Add mouse control
    let myMouse = Mouse.create(window.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse: myMouse,
    });
    World.add(engine.world, mouseConstraint);

    // Key Events
    document.addEventListener('keydown', function(event) {
        if(event.keyCode === 70) { // F key
            let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.1, 0.1), y:random(-0.05, 0.05)});
            }
            let regBalls = ballSystem.getRegularBalls();
            for (let i=0; i < regBalls.length; i++) {
                let ball = regBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.1, 0.1), y:random(-0.05, 0.05)});
            }
        }
	
        if(event.keyCode === 38) { // up
            let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: 0, y: -0.05});
            }
        }
	
        if(event.keyCode === 40) { // down
            let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: 0, y: 0.05});
            }
        }
	
        if(event.keyCode === 37) { // left
            let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: -0.05, y: 0});
            }
        }
	
        if(event.keyCode === 39) { // right
            let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x: 0.05, y: 0});
            }
        }
	
        if(event.keyCode === 32) { // space
            let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.setVelocity(ball, {x: 0, y:0});
            }
            let regBalls = ballSystem.getRegularBalls();
            for (let i=0; i < regBalls.length; i++) {
                let ball = regBalls[i].getBody();
                Matter.Body.setVelocity(ball, {x: 0, y:0});
            }
        }
	
        if (event.keyCode >= 49 && event.keyCode <= 51) {
	        ballSystem.addNewTriggerBall(mouseX, mouseY, (event.keyCode+2)%TOTAL_INS);
        }
	
        if (event.keyCode === 82) {
            ballSystem.addNewRegularBall(mouseX, mouseY);
        }

        if (event.keyCode === 76) { // Key L
            loopMode = !loopMode;
        }
	
    });
    
    // Start Engine
    Engine.run(engine)
}


function draw() {

    Matter.Engine.update(engine);

    // Draw background
    background(BACKGROUND_COLOR[color_id]);

    // Draw dots
    //console.log(dots.length, "before");
    for (let i = 0; i < dots.length; i++) {
        dots[i].draw();
        dots[i].update();
        if (dots[i].life <= 0){
          dots.splice(i, 1);
          //console.log(dots.length, "after");
        }
    }

    // Draw Ground
    for (let i=0; i<4; i++)
        ground.draw();
    
    // Draw Balls
    ballSystem.detectCollisions();
    ballSystem.updateAndDrawTriggerBalls();
    ballSystem.updateAndDrawRegularBalls();

    ballSystem.computeShakeness();

    loopTimer += 1;
    if ((loopMode) && (loopTimer > LOOP_INTERVAL)) {
        let numRegBalls = ballSystem.getNumRegularBalls();
        let numTrigBalls = ballSystem.getNumTriggerBalls();
        if (numRegBalls < LOOP_MIN_REG_BALLS) {
            for (let i=0; i < LOOP_NUM_REG_BALLS_TO_ADD; i++) {
                ballSystem.addNewRegularBall(random(0, width), random(0, height));
            }
            console.log(5 - numRegBalls +" reg balls added")
        }
        if (numTrigBalls < LOOP_MIN_TRIG_BALLS) {
            for (let i=0; i < LOOP_NUM_TRIG_BALLS_TO_ADD; i++) {
                ballSystem.addNewTriggerBall(random(0, width), random(0, height));
            }
            console.log(5 - numTrigBalls +" trig balls added")
        }
        let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.1, 0.1), y:random(-0.05, 0.05)});
            }
        let regBalls = ballSystem.getRegularBalls();
            for (let i=0; i < regBalls.length; i++) {
                let ball = regBalls[i].getBody();
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.1, 0.1), y:random(-0.05, 0.05)});
            }
        loopTimer = 0;
    }

}



function mouseClicked(event){
    let mouse = createVector(mouseX, mouseY);

    let triggerBalls = ballSystem.getTriggerBalls();
    for (let i=0; i < triggerBalls.length; i++) {
        let l = triggerBalls[i].getPosition();
        let v = createVector(l.x, l.y);
        if (v.dist(mouse) < triggerBalls[i].radius) {	    
            triggerBalls[i].explode();
            triggerBalls[i].playExplosionSound();
	    ballSystem.removeTriggerBall(triggerBalls[i])
        }
    }

    let regularBalls = ballSystem.getRegularBalls();
    for (let j=0; j < regularBalls.length; j++) {
        let l = regularBalls[j].getPosition();
        let v = createVector(l.x, l.y);
        if (v.dist(mouse) < regularBalls[j].radius) {
            regularBalls[j].explode();
            regularBalls[j].playExplosionSound();
	    ballSystem.removeRegularBall(regularBalls[j]);
        }
    }
}
