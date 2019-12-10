
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


function setup() {

    ConnectServer();
    
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

     // Create Ball System
    ballSystem = new BallSystem(world, NUM_TRIG_BALLS, NUM_REG_BALLS);

          
    
    // Add mouse control
    let myMouse = Mouse.create(window.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse: myMouse,
    });
    World.add(engine.world, mouseConstraint);

   


    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 70) { // F key

	    let trigBalls = ballSystem.getTriggerBalls();
            for (let i=0; i < trigBalls.length; i++) {
                let ball = trigBalls[i].getBody()
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.1, 0.1), y:random(-0.05, 0.05)});
            }
	    let regBalls = ballSystem.getRegularBalls();
            for (let i=0; i < regBalls.length; i++) {
                let ball = regBalls[i].getBody()
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.1, 0.1), y:random(-0.05, 0.05)});
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
        if (event.keyCode >= 49 && event.keyCode <= 51){ //TODO: FIX
          
          	ballSystem.addNewTriggerBall();

//            triggerBalls[i] = new TriggerBall(i, mouseX, mouseY, r, TRIG_BALL_COLOR, 30, (event.keyCode+2)%TOTAL_INS)

        }
        if (event.keyCode == 82) { //TODO: FIX
//             regularBalls[i] = new RegularBall(i, mouseX, mouseY, r, REG_BALL_COLOR, 15, PITCHES[i%TOTAL_PITCHES]);
          	ballSystem.addNewRegularBall();
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
    ballSystem.updateAndDrawTriggerBalls();
    ballSystem.updateAndDrawRegularBalls();

    // Handle Collisions
    let trigBalls = ballSystem.getTriggerBalls();
    let regBalls = ballSystem.getRegularBalls();    

    ballSystem.detectCollisions();

}



function mouseClicked(event){

  let mouse = createVector(mouseX, mouseY);

    for (let i=0; i < triggerBalls.length; i++) {
        let l = triggerBalls[i].getPosition();
        let v = createVector(l.x, l.y);
        if (v.dist(mouse) < triggerBalls[i].radius) {
            triggerBalls[i].explode();
            triggerBalls[i].playExplosionSound();
            Matter.Composite.remove(engine.world, triggerBalls[i].getBody());
            triggerBalls.splice(i, 1);
            cur_num_trig_balls -= 1;
            //console.log(dots);
            //console.log("trigger ball explode, ", mouseX, mouseY);
        }
    }
    for (let j=0; j<regularBalls.length; j++) {
        let l = regularBalls[j].getPosition();
        let v = createVector(l.x, l.y);
        if (v.dist(mouse) < regularBalls[j].radius) {
            regularBalls[j].explode();
            regularBalls[j].playExplosionSound();
            regularBallBodies.splice(j, 1);
            Matter.Composite.remove(engine.world, regularBalls[j].getBody());
            regularBalls.splice(j, 1);
            cur_num_reg_balls -= 1;
            //console.log("regular ball explode, ", mouseX, mouseY);
        }
    }
}
