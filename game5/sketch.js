let randomR, randomG, randomB;
let currentR, currentG, currentB;
let buttonReset, buttonDone;
let sliderR, sliderG, sliderB;
let timer;

function setup() {
  createCanvas(800, 600);
  btnCreate();
  sliderCreate();
  reset();
}

function draw() {
  background(220);

  // Target colour
  fill(randomR, randomG, randomB);
  rect(100, 100, 200, 200, 20);

  // Current colour
  fill(currentR, currentG, currentB);
  rect(500, 100, 200, 200, 20);

  // Individual R/G/B rectangles
  fill(currentR, 0, 0); rect(600, 380, 40, 40);
  fill(0, currentG, 0); rect(600, 430, 40, 40);
  fill(0, 0, currentB); rect(600, 480, 40, 40);

  // Timer & game logic
  if (timer > 0) {
    currentR = sliderR.value();
    currentG = sliderG.value();
    currentB = sliderB.value();
    timer--;
    fill(200);
    arc(400, 200, 80, 80, 0, (timer * TWO_PI) / 3000, PIE);
  } else {
    checkScore();
  }
}

function checkScore() {
  let r = abs(currentR - randomR);
  let g = abs(currentG - randomG);
  let b = abs(currentB - randomB);
  let total = r + g + b;
  let points = 100 - (total / 765) * 100;
  points = constrain(round(points), 0, 100);

  textSize(32);
  fill(0);
  text(points + "%", 350, 300);
}

function reset() {
  randomR = random(0, 255);
  randomG = random(0, 255);
  randomB = random(0, 255);
  currentR = 0;
  currentG = 0;
  currentB = 0;
  timer = 3000;
}

function done() {
  timer = 0;
}

function btnCreate() {
  buttonReset = createButton("Reset");
  buttonReset.size(130, 65);
  buttonReset.position(10, 10);
  buttonReset.style("font-family", "Times New Roman");
  buttonReset.style("font-size", "48px");
  buttonReset.mousePressed(reset);

  buttonDone = createButton("Done");
  buttonDone.size(130, 65);
  buttonDone.position(width - 140, 10);
  buttonDone.style("font-family", "Times New Roman");
  buttonDone.style("font-size", "48px");
  buttonDone.mousePressed(done);
}

function sliderCreate() {
  sliderR = createSlider(0, 255, 255);
  sliderR.position(200, 400);
  sliderR.style("width", "300px");

  sliderG = createSlider(0, 255, 255);
  sliderG.position(200, 450);
  sliderG.style("width", "300px");

  sliderB = createSlider(0, 255, 255);
  sliderB.position(200, 500);
  sliderB.style("width", "300px");
}
