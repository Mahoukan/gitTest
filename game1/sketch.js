let diameter;
let n = 1;
let dAngle;
let angle = 0;
let xP = [];
let yP = [];
let size = 500;
let i = 0;

function setup() {
  createCanvas(size, size);
  background(255);
  diameter = 3 * height / 4;
  reset();
}

function reset() {
  xP = [];
  yP = [];
  angle = 0;
  dAngle = TWO_PI / n;

  for (let j = 0; j < n; j++) {
    let x = diameter / 2 * cos(angle) + width / 2;
    let y = diameter / 2 * sin(angle) + height / 2;
    xP.push(x);
    yP.push(y);
    angle += dAngle;
  }
}

function draw() {
  fill(0);
  noStroke();
  textSize(20);
  text("Points: " + n, 10, 30);

  if (i < n) {
    for (let z = 0; z < n; z++) {
      stroke(0);
      line(xP[i], yP[i], xP[z], yP[z]);
    }
    i++;
  }
}

function mouseClicked() {
  n++;
  redo();
}

function keyReleased() {
  if (keyCode === UP_ARROW) {
    n++;
    redo();
  } else if (keyCode === DOWN_ARROW) {
    if (n > 1) n--;
    redo();
  } else if (keyCode === LEFT_ARROW) {
    n = 1;
    redo();
  } else if (keyCode === RIGHT_ARROW) {
    n += 10;
    redo();
  }
}

function redo() {
  i = 0;
  background(255);
  reset();
}
