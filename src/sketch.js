
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
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;

    
    // Create Ground    
    ground = new Ground();
    let surfaceBodies = ground.getSurfaceBodies()
    for (let i=0; i<ground.getNumSurfaces(); i++)   
        World.add(engine.world, surfaceBodies[i]);

    
    // Create Regular Balls    
    for (let i = 0; i < NUM_REG_BALLS; i++) {
        let r = randomGaussian(REG_RANGE[0], REG_RANGE[1]);
        r = max(r, MIN_R);
        regularBalls[i] = new RegularBall(i, random(r, width-r), random(r, height-r), r, REG_BALL_COLOR, 15, PITCHES[i%TOTAL_PITCHES]);
        regularBallBodies[i] = regularBalls[i].getBody();
        World.add(engine.world, regularBallBodies[i]);
    }
    
    
    // Create Trigger Balls
    for (let i = 0; i < NUM_TRIG_BALLS; i++) {
        let r = randomGaussian(TRIG_RANGE[0], TRIG_RANGE[1]);
        r = max(r, MIN_R);
        triggerBalls[i] = new TriggerBall(i, random(r, width-r), random(r, height-r), r, TRIG_BALL_COLOR, 30, i%TOTAL_INS)
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
        if(event.keyCode == 38) {
            for (let i=0; i < cur_num_trig_balls; i++) {
                let ball = triggerBalls[i].getBody()
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:0, y:random(-0.05, 0)});
            }
        }
        if(event.keyCode == 40) {
            for (let i=0; i < cur_num_trig_balls; i++) {
                let ball = triggerBalls[i].getBody()
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:0, y:random(0, 0.05)});
            }
        }
        if(event.keyCode == 37) {
            for (let i=0; i < cur_num_trig_balls; i++) {
                let ball = triggerBalls[i].getBody()
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(-0.05, 0), y:0});
            }
        }
        if(event.keyCode == 39) {
            for (let i=0; i < cur_num_trig_balls; i++) {
                let ball = triggerBalls[i].getBody()
                Matter.Body.applyForce(ball, {x: ball.position.x, y: ball.position.y}, {x:random(0, 0.05), y:0});
            }
        }
        if(event.keyCode == 32) {
            for (let i=0; i < cur_num_trig_balls; i++) {
                let ball = triggerBalls[i].getBody()
                Matter.Body.setVelocity(ball, {x: 0, y:0});
            }
            for (let i=0; i < cur_num_reg_balls; i++) {
                let ball = regularBalls[i].getBody()
                Matter.Body.setVelocity(ball, {x: 0, y:0});
            }
        }
        if (event.keyCode >= 49 && event.keyCode <= 51){
            let i = cur_num_trig_balls;
            let r = randomGaussian(TRIG_RANGE[0], TRIG_RANGE[1]);
            r = max(r, MIN_R);
            triggerBalls[i] = new TriggerBall(i, mouseX, mouseY, r, TRIG_BALL_COLOR, 30, (event.keyCode+2)%TOTAL_INS)
            World.add(engine.world, triggerBalls[i].getBody());
            cur_num_trig_balls = cur_num_trig_balls + 1;
            //console.log('adding a trigger ball...current num: ' + str(cur_num_trig_balls));
        }
        if (event.keyCode == 82) {
            let i = cur_num_reg_balls;
            let r = randomGaussian(REG_RANGE[0], REG_RANGE[1]);
            r = max(r, MIN_R);
            regularBalls[i] = new RegularBall(i, mouseX, mouseY, r, REG_BALL_COLOR, 15, PITCHES[i%TOTAL_PITCHES]);
            regularBallBodies[i] = regularBalls[i].getBody();
            World.add(engine.world, regularBallBodies[i]);
            cur_num_reg_balls = cur_num_reg_balls + 1;
            //console.log('adding a regular ball...current num: ' + str(cur_num_reg_balls));
        }
    });
    
    // Start Engine
    Engine.run(engine)
}


function draw() {

    background(BACKGROUND_COLOR[color_id]);
    
    Matter.Engine.update(engine);
    
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
    for (let i=0; i < cur_num_reg_balls; i++) {
        regularBalls[i].update();
        regularBalls[i].draw();
    }

    
    for (let i=0; i < cur_num_trig_balls; i++) {
        triggerBalls[i].update();
        triggerBalls[i].draw();

        for (let j=0; j<cur_num_reg_balls; j++) {
            collision = Matter.SAT.collides(triggerBalls[i].getBody(), regularBallBodies[j]);
            if (collision.collided) {
                //console.log("trigger, reg: ", i, j)
                cur_time = Date.now();
                if (cur_time - regularBalls[j].lastHitTime > SOUND_INTERVAL){
                    regBall = regularBalls[j];
                    //console.log(regBall.id, j);
                    triggerBalls[i].playSound(regBall.getPitch(), regBall.radius);
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
    SendMessage('/mouse', "mouse clicked");
    let mouse = createVector(mouseX, mouseY);

    for (let i=0; i < triggerBalls.length; i++) {
        let l = triggerBalls[i].getPosition();
        let v = createVector(l.x, l.y);
        if (v.dist(mouse) < triggerBalls[i].radius) {
            triggerBalls[i].explode();
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
            regularBallBodies.splice(j, 1);
            Matter.Composite.remove(engine.world, regularBalls[j].getBody());
            regularBalls.splice(j, 1);
            cur_num_reg_balls -= 1;
            //console.log("regular ball explode, ", mouseX, mouseY);
        }
    }
}
