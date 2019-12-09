
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
let ground = null;

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
        for (let i=0; i < cur_num_trig_balls; i++) {
            let ball = triggerBalls[i].getBody()
            Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.05, 0.05), y:random(-0.05, 0.05)});
        }
    }
    });



    
    
    // Start Engine
    Engine.run(engine)
}

function draw() {

    background(BACKGROUND_COLOR[color_id]);
    
    Matter.Engine.update(engine);
    
    // Draw Ground
    for (let i=0; i<4; i++)
        ground.draw();
    
    // Draw Balls
    for (let i=0; i < cur_num_reg_balls; i++) {
        regularBalls[i].update();
        regularBalls[i].draw();
    }

    
    for (let i=0; i < cur_num_trig_balls; i++) {
        triggerBalls[i].update();
        triggerBalls[i].draw();

    for (let j=0; j<regularBalls.length; j++) {
        collision = Matter.SAT.collides(triggerBalls[i].getBody(), regularBallBodies[j]);
        if (collision.collided) {

            cur_time = Date.now();
            if (cur_time - regularBalls[j].lastHitTime > SOUND_INTERVAL){
                regBall = regularBalls[collision.bodyB.p5id];
                triggerBalls[i].playSound(regBall.getPitch());
                color_id = (color_id + 1) % TOTAL_COLORS;
                //console.log(cur_time - regularBalls[j].lastHitTime);
                regularBalls[j].setLastHitTime(cur_time);
            }
            else{
                //console.log(cur_time - regularBalls[j].lastHitTime);
                regularBalls[j].setLastHitTime(cur_time);
            }
        }
        
    }
    }

}

function mouseClicked(event){
    if (event.shiftKey){ // shift + click
        let i = cur_num_trig_balls;
        triggerBalls[i] = new TriggerBall(i, mouseX, mouseY, 30, TRIG_BALL_COLOR, 15)
        World.add(engine.world, triggerBalls[i].getBody());
        cur_num_trig_balls = cur_num_trig_balls + 1;
        console.log('adding a trigger ball...current num: ' + str(cur_num_trig_balls));
    }
    else {
        let i = cur_num_reg_balls;
        regularBalls[i] = new RegularBall(i, mouseX, mouseY, 30, REG_BALL_COLOR, 15, PITCHES[i%3]);
        regularBallBodies[i] = regularBalls[i].getBody();
        World.add(engine.world, regularBallBodies[i]);
        cur_num_reg_balls = cur_num_reg_balls + 1;
        console.log('adding a regular ball...current num: ' + str(cur_num_reg_balls));
    }
}