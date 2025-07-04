let targetX, targetY;
let score = 0;
let highScore = 0;
let radius = 40;
let timeLimit = 30;
let timeLeft;
let startTime;
let gameOver = false;
let buttonRestart;
let showHelp = true;
let difficultySelect;
let pulseOffset = 0;

function setup() {
  createCanvas(400, 500);
  textFont('Courier New');
  difficultyMenu();
  restartGame();
  createRestartButton();
}

function draw() {
  background(20);

  // Time calculation
  let timeElapsedMillis = millis() - startTime;
  let timeElapsed = floor(timeElapsedMillis / 1000);
  timeLeft = timeLimit - timeElapsed;

  // Game still going
  if (!gameOver && timeLeft > 0) {
    drawTarget();
    fill(255);
    textSize(18);
    text("Score: " + score, 10, 30);
    text("Time Left: " + timeLeft + "s", 10, 60);
    text("High Score: " + highScore, 10, 90);
    if (showHelp) {
      drawHelp();
    }
  } 
  // Game over screen
  else if (!gameOver) {
    gameOver = true;
    buttonRestart.show();
  }

  if (gameOver) {
    fill(255);
    textSize(40);
    text("Game Over!", 60, 200);
    textSize(24);
    text("Score: " + score, 130, 260);
    text("High Score: " + highScore, 110, 300);
  }

  pulseOffset += 0.05;
}

function drawTarget() {
  let pulse = sin(pulseOffset) * 5 + radius;
  fill(255, 0, 0);
  circle(targetX, targetY, pulse);
}

function mousePressed() {
  if (!gameOver && timeLeft > 0) {
    let distance = dist(targetX, targetY, mouseX, mouseY);
    if (distance < radius) {
      score++;
      targetX = random(radius, width - radius);
      targetY = random(radius + 100, height - radius);
    }
  }
}

function restartGame() {
  score = 0;
  gameOver = false;
  buttonRestart?.hide();
  startTime = millis();
  targetX = random(radius, width - radius);
  targetY = random(radius + 100, height - radius);
}

function createRestartButton() {
  buttonRestart = createButton("Play Again");
  buttonRestart.position(width / 2 - 60, height - 60);
  buttonRestart.size(120, 40);
  buttonRestart.mousePressed(restartGame);
  buttonRestart.hide();
}

let difficultyContainer;

function difficultyMenu() {
  difficultyContainer = createDiv();
  difficultyContainer.position(10, height - 160);

  let label = createDiv("Difficulty");
  label.style('color', '#fff');
  label.parent(difficultyContainer);

  difficultySelect = createSelect();
  difficultySelect.parent(difficultyContainer);
  difficultySelect.option('Easy (45s)', 'easy');
  difficultySelect.option('Normal (30s)', 'normal');
  difficultySelect.option('Hard (15s)', 'hard');
  difficultySelect.changed(() => {
    let diff = difficultySelect.value();
    if (diff === 'easy') {
      timeLimit = 45;
      radius = 40;
    } else if (diff === 'normal') {
      timeLimit = 30;
      radius = 30;
    } else {
      timeLimit = 15;
      radius = 20;
    }
    restartGame();
  });
  difficultySelect.value('normal');
}


function drawHelp() {
  textSize(12);
  fill(200);
  text("Click the red circle as fast as you can!", 10, height - 110);
  text("Try to beat your high score before time runs out.", 10, height - 95);
  text("Use the dropdown to change difficulty.", 10, height - 80);
  text("Press 'H' to hide or show this help text.", 10, height - 65);
}

function keyPressed() {
  if (key === 'h' || key === 'H') {
    showHelp = !showHelp;
    if (showHelp) {
      difficultyContainer.show();
    } else {
      difficultyContainer.hide();
    }
  }
}
