let targetX;
let targetY;
let score = 0;
let timeLimit = 30;
let timeLeft;
let startTime;

function setup() {
  createCanvas(400, 400);
  targetX = random(50, 350);
  targetY = random(50, 350);
  startTime = millis();
  textFont('Courier New');
}

function draw() {
  let timeElapsedMillis = millis() - startTime;
  let timeElapsed = floor(timeElapsedMillis / 1000);
  timeLeft = timeLimit - timeElapsed;

  background(0);
  
  if (timeLeft > 0) {
    fill(255);
    circle(targetX, targetY, 50);
    textSize(20);
    text("Score: " + score, 10, 30);
    text("Time Left: " + timeLeft, 10, 60);
  } else {
    textSize(60);
    fill(255);
    text("Game Over!", 35, 150);
    text("Score: " + score, 35, 230);
  }
}

function mousePressed() {
  if (timeLeft > 0) {
    let distance = dist(targetX, targetY, mouseX, mouseY);
    if (distance < 25) {
      targetX = random(50, 350);
      targetY = random(50, 350);
      score++;
    }
  }
}
