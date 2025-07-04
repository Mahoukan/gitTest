let randomR, randomG, randomB;
let currentR, currentG, currentB;
let buttonReset, buttonDone;
let sliderR, sliderG, sliderB;
let difficultySelect;
let timerMax, timer;
let highScore = 0;
let lastScore = 0;
let showHelp = true;
let resultShown = false;

function setup() {
  createCanvas(800, 600);
  textFont('Courier New');
  btnCreate();
  sliderCreate();
  difficultySelector();
  reset();
}

function draw() {
  background(220);

  // Always update current slider values
  currentR = sliderR.value();
  currentG = sliderG.value();
  currentB = sliderB.value();

  // Display colour blocks
  fill(randomR, randomG, randomB);
  rect(100, 100, 200, 200, 20); // Target

  fill(currentR, currentG, currentB);
  rect(500, 100, 200, 200, 20); // Player

  // RGB bar visual hints
  fill(currentR, 0, 0); rect(600, 380, 40, 40);
  fill(0, currentG, 0); rect(600, 430, 40, 40);
  fill(0, 0, currentB); rect(600, 480, 40, 40);

  fill(0);
  textSize(12);
  text(`Your RGB: (${currentR}, ${currentG}, ${currentB})`, 480, 350);
  if (resultShown) {
    text(`Target RGB: (${Math.round(randomR)}, ${Math.round(randomG)}, ${Math.round(randomB)})`, 80, 350);
  }

  if (showHelp) {
    drawHelp();
  }

  // Timer & Result
  if (timer > 0) {
    timer--;
    // Show arc for time left
    let timeAngle = map(timer, 0, timerMax, 0, TWO_PI);
    fill(200);
    arc(400, 200, 80, 80, 0, timeAngle, PIE);
  } else if (!resultShown) {
    checkScore();
  }

  // Show score after round
  if (resultShown) {
    textSize(32);
    fill(0);
    text(`Score: ${lastScore}%`, 330, 300);
    textSize(18);
    text(`High Score: ${highScore}%`, 330, 330);
  }
}

function checkScore() {
  let r = abs(currentR - randomR);
  let g = abs(currentG - randomG);
  let b = abs(currentB - randomB);
  let total = r + g + b;
  let points = 100 - (total / 765) * 100;
  points = constrain(round(points), 0, 100);
  lastScore = points;
  highScore = max(highScore, points);
  resultShown = true;
}

function reset() {
  randomR = random(0, 255);
  randomG = random(0, 255);
  randomB = random(0, 255);
  currentR = 0;
  currentG = 0;
  currentB = 0;
  timer = timerMax;
  resultShown = false;
}

function done() {
  timer = 0;
}

function btnCreate() {
  buttonReset = createButton("Reset");
  buttonReset.size(130, 40);
  buttonReset.position(10, 10);
  buttonReset.mousePressed(reset);

  buttonDone = createButton("Done");
  buttonDone.size(130, 40);
  buttonDone.position(width - 140, 10);
  buttonDone.mousePressed(done);
}

function sliderCreate() {
  sliderR = createSlider(0, 255, 127);
  sliderR.position(200, 400);
  sliderR.style("width", "300px");

  sliderG = createSlider(0, 255, 127);
  sliderG.position(200, 450);
  sliderG.style("width", "300px");

  sliderB = createSlider(0, 255, 127);
  sliderB.position(200, 500);
  sliderB.style("width", "300px");
}

function difficultySelector() {
  createDiv("Difficulty").position(10, 60).style('color', '#000');
  difficultySelect = createSelect();
  difficultySelect.position(10, 85);
  difficultySelect.option('Easy (60s)', 3600);
  difficultySelect.option('Normal (30s)', 1800);
  difficultySelect.option('Hard (15s)', 900);
  difficultySelect.changed(() => {
    timerMax = int(difficultySelect.value());
    reset();
  });
  difficultySelect.value('1800');
  timerMax = 1800;
}

function drawHelp() {
  fill(0);
  textSize(14);
  let shift = 70;
  let change = 20;
  text("Match the LEFT colour using RGB sliders below.", 10, height - shift);
  shift-=change;
  text("Click 'Done' to submit your guess before time runs out.", 10, height - shift);
  shift-=change;
  text("Score is based on colour accuracy. High score is tracked.", 10, height - shift);
  shift-=change;
  text("Press 'H' to toggle these instructions.", 10, height - shift);
}

function keyPressed() {
  if (key === 'h' || key === 'H') {
    showHelp = !showHelp;
  }
}
